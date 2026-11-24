-- Triggers live in private so PostgREST does not expose them as RPCs.
-- anon/authenticated still need USAGE + EXECUTE, otherwise an insert cannot fire the trigger.
-- That grant does not publish the schema: [api].schemas stays public, graphql_public.

revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();
  return new;
end;
$$;

create or replace function private.assert_store_shape(zones jsonb, form jsonb)
returns void
language plpgsql
set search_path = ''
as $$
declare
  zone jsonb;
  field jsonb;
  n int;
begin
  if jsonb_typeof(zones) <> 'array' or jsonb_array_length(zones) > 20 then
    raise exception 'invalid zones';
  end if;
  n := 0;
  for zone in select value from jsonb_array_elements(zones)
  loop
    n := n + 1;
    if jsonb_typeof(zone) <> 'object' then
      raise exception 'invalid zones';
    end if;
    if coalesce(zone->>'id', '') = '' or char_length(zone->>'id') > 80 then
      raise exception 'invalid zones';
    end if;
    if coalesce(zone->>'name', '') = '' or char_length(zone->>'name') > 80 then
      raise exception 'invalid zones';
    end if;
    if zone->>'price' is null or (zone->>'price') !~ '^[0-9]+$' then
      raise exception 'invalid zones';
    end if;
    if (zone->>'price')::bigint > 100000000 then
      raise exception 'invalid zones';
    end if;
  end loop;

  if jsonb_typeof(form) <> 'object' or jsonb_typeof(form->'fields') <> 'array' then
    raise exception 'invalid order form';
  end if;
  if jsonb_array_length(form->'fields') > 20 then
    raise exception 'invalid order form';
  end if;
  for field in select value from jsonb_array_elements(form->'fields')
  loop
    if jsonb_typeof(field) <> 'object' then
      raise exception 'invalid order form';
    end if;
    if coalesce(field->>'key', '') !~ '^[a-z][a-z0-9_]{0,40}$' then
      raise exception 'invalid order form';
    end if;
    if coalesce(field->>'label', '') = '' or char_length(field->>'label') > 80 then
      raise exception 'invalid order form';
    end if;
    if coalesce(field->>'type', '') not in ('text', 'textarea', 'phone', 'checkbox') then
      raise exception 'invalid order form';
    end if;
  end loop;
end;
$$;

create or replace function private.protect_store()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  jwt_role text;
begin
  jwt_role := coalesce(auth.role(), '');

  -- Whop webhooks and other trusted server jobs use the secret key.
  if jwt_role = 'service_role' then
    return new;
  end if;

  -- Migrations and seed.sql run as the database owner, with no request JWT.
  if jwt_role = '' and session_user in ('postgres', 'supabase_admin') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if auth.uid() is null then
      raise exception 'not authenticated';
    end if;
    new.owner_id := auth.uid();
    new.is_demo := false;
    new.subscription_status := 'trialing';
    new.trial_ends_at := now() + interval '7 days';
    new.whop_customer_id := null;
    new.whop_membership_id := null;
  elsif tg_op = 'UPDATE' then
    new.owner_id := old.owner_id;
    new.is_demo := old.is_demo;
    new.subscription_status := old.subscription_status;
    new.trial_ends_at := old.trial_ends_at;
    new.whop_customer_id := old.whop_customer_id;
    new.whop_membership_id := old.whop_membership_id;
    new.created_at := old.created_at;
  end if;

  if tg_op = 'INSERT' and new.slug in (
    'primer', 'api', 'auth', 'cabinet', 'login', 'signup', 'preview', 'admin', 'www', 'onboarding'
  ) then
    raise exception 'slug reserved';
  end if;

  if tg_op = 'UPDATE'
    and new.slug is distinct from old.slug
    and new.slug in (
      'primer', 'api', 'auth', 'cabinet', 'login', 'signup', 'preview', 'admin', 'www', 'onboarding'
    ) then
    raise exception 'slug reserved';
  end if;

  perform private.assert_store_shape(new.delivery_zones, new.order_form);
  return new;
end;
$$;

create or replace function private.enforce_product_store()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.category_id is not null and not exists (
    select 1
    from public.categories c
    where c.id = new.category_id
      and c.store_id = new.store_id
  ) then
    raise exception 'category mismatch';
  end if;
  return new;
end;
$$;

create or replace function private.enforce_photo_store()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.products p
    where p.id = new.product_id
      and p.store_id = new.store_id
  ) then
    raise exception 'photo store mismatch';
  end if;
  return new;
end;
$$;

create or replace function private.validate_order()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  store public.stores%rowtype;
  item jsonb;
  zone jsonb;
  pid uuid;
  qty int;
  price int;
  db_price int;
  db_name text;
  db_available boolean;
  sum_sub int := 0;
  zone_price int := 0;
  found_zone boolean := false;
  recent int;
  jwt_role text;
  extra_len int := 0;
begin
  jwt_role := coalesce(auth.role(), '');

  if tg_op = 'UPDATE' then
    if jwt_role = 'service_role'
      or (jwt_role = '' and session_user in ('postgres', 'supabase_admin')) then
      new.updated_at := now();
      return new;
    end if;

    if new.status not in ('new', 'confirmed', 'cancelled') then
      raise exception 'bad status';
    end if;

    new.id := old.id;
    new.store_id := old.store_id;
    new.order_number := old.order_number;
    new.customer_name := old.customer_name;
    new.customer_phone := old.customer_phone;
    new.fulfillment := old.fulfillment;
    new.address := old.address;
    new.delivery_zone_id := old.delivery_zone_id;
    new.delivery_zone_name := old.delivery_zone_name;
    new.delivery_price := old.delivery_price;
    new.scheduled_date := old.scheduled_date;
    new.scheduled_time := old.scheduled_time;
    new.comment := old.comment;
    new.extra_fields := old.extra_fields;
    new.items := old.items;
    new.subtotal := old.subtotal;
    new.total := old.total;
    new.currency := old.currency;
    new.created_at := old.created_at;
    new.updated_at := now();
    return new;
  end if;

  if new.status <> 'new' then
    raise exception 'orders start as new';
  end if;

  select * into store from public.stores where id = new.store_id;
  if not found then
    raise exception 'store not found';
  end if;

  if not (
    store.is_demo
    or store.subscription_status = 'active'
    or (store.subscription_status = 'trialing' and store.trial_ends_at > now())
  ) then
    raise exception 'store is not accepting orders';
  end if;

  select count(*) into recent
  from public.orders o
  where o.store_id = new.store_id
    and o.customer_phone = new.customer_phone
    and o.created_at > now() - interval '10 minutes';

  if recent >= 5 then
    raise exception 'rate limit';
  end if;

  if jsonb_array_length(new.items) < 1 or jsonb_array_length(new.items) > 40 then
    raise exception 'invalid items';
  end if;

  for item in select value from jsonb_array_elements(new.items)
  loop
    if jsonb_typeof(item) <> 'object' then
      raise exception 'invalid item';
    end if;
    begin
      pid := (item->>'product_id')::uuid;
      qty := (item->>'qty')::int;
      price := (item->>'price')::int;
    exception
      when others then
        raise exception 'invalid item';
    end;

    if qty < 1 or qty > 99 then
      raise exception 'invalid qty';
    end if;

    select p.price, p.name, p.available
      into db_price, db_name, db_available
    from public.products p
    where p.id = pid
      and p.store_id = new.store_id;

    if not found or db_available is distinct from true then
      raise exception 'product unavailable';
    end if;
    if price <> db_price or coalesce(item->>'name', '') <> db_name then
      raise exception 'price mismatch';
    end if;

    sum_sub := sum_sub + price * qty;
    if sum_sub > 100000000 then
      raise exception 'subtotal mismatch';
    end if;
  end loop;

  if new.subtotal <> sum_sub then
    raise exception 'subtotal mismatch';
  end if;

  if new.fulfillment = 'pickup' then
    if not store.pickup_enabled then
      raise exception 'pickup disabled';
    end if;
    if new.delivery_price <> 0 then
      raise exception 'delivery price mismatch';
    end if;
    new.delivery_zone_id := null;
    new.delivery_zone_name := null;
  elsif new.fulfillment = 'delivery' then
    if not store.delivery_enabled then
      raise exception 'delivery disabled';
    end if;
    if char_length(btrim(coalesce(new.address, ''))) < 3 then
      raise exception 'address required';
    end if;

    if jsonb_array_length(store.delivery_zones) = 0 then
      if new.delivery_price <> 0 or new.delivery_zone_id is not null then
        raise exception 'delivery price mismatch';
      end if;
    else
      for zone in select value from jsonb_array_elements(store.delivery_zones)
      loop
        if (zone->>'id') = new.delivery_zone_id then
          found_zone := true;
          zone_price := (zone->>'price')::int;
          if coalesce(new.delivery_zone_name, '') <> coalesce(zone->>'name', '') then
            raise exception 'zone name mismatch';
          end if;
        end if;
      end loop;
      if not found_zone or new.delivery_price <> zone_price then
        raise exception 'delivery price mismatch';
      end if;
    end if;
  else
    raise exception 'bad fulfillment';
  end if;

  if new.total <> new.subtotal + new.delivery_price then
    raise exception 'total mismatch';
  end if;

  if store.min_order > 0 and new.subtotal < store.min_order then
    raise exception 'below minimum';
  end if;

  select coalesce(sum(char_length(value)), 0) into extra_len
  from jsonb_each_text(new.extra_fields);

  if extra_len > 2000 then
    raise exception 'invalid extras';
  end if;

  -- Reject nested objects. jsonb_each_text already stringifies, so check kinds.
  if exists (
    select 1
    from jsonb_each(new.extra_fields) as pair(key, value)
    where jsonb_typeof(pair.value) not in ('string', 'number', 'boolean', 'null')
  ) then
    raise exception 'invalid extras';
  end if;

  new.currency := 'KZT';
  return new;
end;
$$;

create or replace function private.validate_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recent int;
begin
  if not exists (select 1 from public.stores s where s.id = new.store_id) then
    raise exception 'store not found';
  end if;

  if new.session_id is not null then
    select count(*) into recent
    from public.analytics_events e
    where e.store_id = new.store_id
      and e.session_id = new.session_id
      and e.created_at > now() - interval '10 minutes';
    if recent >= 40 then
      raise exception 'rate limit';
    end if;
  else
    raise exception 'session required';
  end if;

  select count(*) into recent
  from public.analytics_events e
  where e.store_id = new.store_id
    and e.created_at > now() - interval '1 minute';
  if recent >= 300 then
    raise exception 'rate limit';
  end if;

  if new.event_type = 'whatsapp_click' and new.amount is null then
    raise exception 'amount required';
  end if;

  if new.event_type <> 'whatsapp_click' then
    new.amount := null;
  end if;

  if new.product_id is not null and not exists (
    select 1
    from public.products p
    where p.id = new.product_id
      and p.store_id = new.store_id
  ) then
    new.product_id := null;
  end if;

  if new.utm is not null and (
    jsonb_typeof(new.utm) <> 'object'
    or (select count(*) from jsonb_object_keys(new.utm)) > 8
  ) then
    new.utm := null;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch
  before update on public.profiles
  for each row execute function private.touch_updated_at();

drop trigger if exists stores_touch on public.stores;
create trigger stores_touch
  before update on public.stores
  for each row execute function private.touch_updated_at();

drop trigger if exists products_touch on public.products;
create trigger products_touch
  before update on public.products
  for each row execute function private.touch_updated_at();

drop trigger if exists stores_protect on public.stores;
create trigger stores_protect
  before insert or update on public.stores
  for each row execute function private.protect_store();

drop trigger if exists products_store_check on public.products;
create trigger products_store_check
  before insert or update on public.products
  for each row execute function private.enforce_product_store();

drop trigger if exists product_photos_store_check on public.product_photos;
create trigger product_photos_store_check
  before insert or update on public.product_photos
  for each row execute function private.enforce_photo_store();

drop trigger if exists orders_validate on public.orders;
create trigger orders_validate
  before insert or update on public.orders
  for each row execute function private.validate_order();

drop trigger if exists events_validate on public.analytics_events;
create trigger events_validate
  before insert on public.analytics_events
  for each row execute function private.validate_event();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

revoke all on function private.touch_updated_at() from public;
revoke all on function private.handle_new_user() from public;
revoke all on function private.assert_store_shape(jsonb, jsonb) from public;
revoke all on function private.protect_store() from public;
revoke all on function private.enforce_product_store() from public;
revoke all on function private.enforce_photo_store() from public;
revoke all on function private.validate_order() from public;
revoke all on function private.validate_event() from public;

grant execute on function private.touch_updated_at() to anon, authenticated, service_role;
grant execute on function private.handle_new_user() to service_role;
grant execute on function private.assert_store_shape(jsonb, jsonb) to anon, authenticated, service_role;
grant execute on function private.protect_store() to anon, authenticated, service_role;
grant execute on function private.enforce_product_store() to anon, authenticated, service_role;
grant execute on function private.enforce_photo_store() to anon, authenticated, service_role;
grant execute on function private.validate_order() to anon, authenticated, service_role;
grant execute on function private.validate_event() to anon, authenticated, service_role;

-- Sign-up inserts into auth.users as supabase_auth_admin. That role must be
-- allowed to fire the trigger; the function itself is security definer.
grant usage on schema private to supabase_auth_admin;
grant execute on function private.handle_new_user() to supabase_auth_admin;
