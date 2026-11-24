-- Row Level Security for every public table.
-- Anonymous shoppers can read a storefront and insert their own order/event.
-- They cannot select orders or events, so one store cannot read another store's rows.
-- UPDATE policies include a SELECT-equivalent USING clause; Postgres requires it.

alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_photos enable row level security;
alter table public.store_covers enable row level security;
alter table public.orders enable row level security;
alter table public.analytics_events enable row level security;

revoke all on public.profiles from anon, authenticated;
revoke all on public.stores from anon, authenticated;
revoke all on public.categories from anon, authenticated;
revoke all on public.products from anon, authenticated;
revoke all on public.product_photos from anon, authenticated;
revoke all on public.store_covers from anon, authenticated;
revoke all on public.orders from anon, authenticated;
revoke all on public.analytics_events from anon, authenticated;

grant select, update on public.profiles to authenticated;

grant select on public.stores to anon, authenticated;
grant insert, update, delete on public.stores to authenticated;

grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

grant select on public.product_photos to anon, authenticated;
grant insert, update, delete on public.product_photos to authenticated;

grant select on public.store_covers to anon, authenticated;
grant insert, update, delete on public.store_covers to authenticated;

grant insert on public.orders to anon, authenticated;
grant select, update on public.orders to authenticated;

grant insert on public.analytics_events to anon, authenticated;
grant select on public.analytics_events to authenticated;

create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy stores_public_read
  on public.stores
  for select
  to anon, authenticated
  using (true);

create policy stores_insert_own
  on public.stores
  for insert
  to authenticated
  with check (owner_id = (select auth.uid()));

create policy stores_update_own
  on public.stores
  for update
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy stores_delete_own
  on public.stores
  for delete
  to authenticated
  using (owner_id = (select auth.uid()) and is_demo = false);

create policy categories_public_read
  on public.categories
  for select
  to anon, authenticated
  using (true);

create policy categories_insert_owner
  on public.categories
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.stores s
      where s.id = store_id
        and s.owner_id = (select auth.uid())
    )
  );

create policy categories_update_owner
  on public.categories
  for update
  to authenticated
  using (
    exists (
      select 1 from public.stores s
      where s.id = categories.store_id
        and s.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.stores s
      where s.id = store_id
        and s.owner_id = (select auth.uid())
    )
  );

create policy categories_delete_owner
  on public.categories
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.stores s
      where s.id = categories.store_id
        and s.owner_id = (select auth.uid())
    )
  );

create policy products_public_read
  on public.products
  for select
  to anon, authenticated
  using (true);

create policy products_insert_owner
  on public.products
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.stores s
      where s.id = store_id
        and s.owner_id = (select auth.uid())
    )
  );

create policy products_update_owner
  on public.products
  for update
  to authenticated
  using (
    exists (
      select 1 from public.stores s
      where s.id = products.store_id
        and s.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.stores s
      where s.id = store_id
        and s.owner_id = (select auth.uid())
    )
  );

create policy products_delete_owner
  on public.products
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.stores s
      where s.id = products.store_id
        and s.owner_id = (select auth.uid())
    )
  );

create policy product_photos_public_read
  on public.product_photos
  for select
  to anon, authenticated
  using (true);

create policy product_photos_insert_owner
  on public.product_photos
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.stores s
      where s.id = store_id
        and s.owner_id = (select auth.uid())
    )
  );

create policy product_photos_update_owner
  on public.product_photos
  for update
  to authenticated
  using (
    exists (
      select 1 from public.stores s
      where s.id = product_photos.store_id
        and s.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.stores s
      where s.id = store_id
        and s.owner_id = (select auth.uid())
    )
  );

create policy product_photos_delete_owner
  on public.product_photos
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.stores s
      where s.id = product_photos.store_id
        and s.owner_id = (select auth.uid())
    )
  );

create policy store_covers_public_read
  on public.store_covers
  for select
  to anon, authenticated
  using (true);

create policy store_covers_insert_owner
  on public.store_covers
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.stores s
      where s.id = store_id
        and s.owner_id = (select auth.uid())
    )
  );

create policy store_covers_update_owner
  on public.store_covers
  for update
  to authenticated
  using (
    exists (
      select 1 from public.stores s
      where s.id = store_covers.store_id
        and s.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.stores s
      where s.id = store_id
        and s.owner_id = (select auth.uid())
    )
  );

create policy store_covers_delete_owner
  on public.store_covers
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.stores s
      where s.id = store_covers.store_id
        and s.owner_id = (select auth.uid())
    )
  );

create policy orders_insert_new
  on public.orders
  for insert
  to anon, authenticated
  with check (
    status = 'new'
    and exists (select 1 from public.stores s where s.id = store_id)
  );

create policy orders_owner_select
  on public.orders
  for select
  to authenticated
  using (
    exists (
      select 1 from public.stores s
      where s.id = orders.store_id
        and s.owner_id = (select auth.uid())
    )
  );

create policy orders_owner_update
  on public.orders
  for update
  to authenticated
  using (
    exists (
      select 1 from public.stores s
      where s.id = orders.store_id
        and s.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.stores s
      where s.id = store_id
        and s.owner_id = (select auth.uid())
    )
  );

create policy events_insert
  on public.analytics_events
  for insert
  to anon, authenticated
  with check (
    exists (select 1 from public.stores s where s.id = store_id)
  );

create policy events_owner_select
  on public.analytics_events
  for select
  to authenticated
  using (
    exists (
      select 1 from public.stores s
      where s.id = analytics_events.store_id
        and s.owner_id = (select auth.uid())
    )
  );
