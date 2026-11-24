-- Витрина: tables, constraints, indexes.
-- The private schema is intentionally absent from supabase/config.toml [api].schemas
-- so these helpers are not Data API endpoints. Usage is granted later so triggers can fire.

create extension if not exists pgcrypto;

create schema if not exists private;

comment on schema private is
  'Privileged triggers and helpers. Not exposed through the Data API.';

revoke all on schema private from public;
grant usage on schema private to postgres, service_role;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'One row per auth user. Created by private.handle_new_user.';

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users (id) on delete cascade,
  name text not null,
  slug text not null,
  niche text not null,
  whatsapp_e164 text not null,
  logo_path text,
  address text not null default '',
  working_hours jsonb not null default '{}'::jsonb,
  delivery_enabled boolean not null default true,
  pickup_enabled boolean not null default true,
  delivery_zones jsonb not null default '[]'::jsonb,
  min_order integer not null default 0,
  template text not null default 'minimal',
  accent_color text not null default '#3E4C3A',
  order_form jsonb not null default '{"fields":[]}'::jsonb,
  trial_ends_at timestamptz not null default (now() + interval '7 days'),
  subscription_status text not null default 'trialing',
  whop_customer_id text,
  whop_membership_id text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stores_name_len check (char_length(btrim(name)) between 1 and 80),
  constraint stores_slug_format check (slug ~ '^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$'),
  constraint stores_niche check (
    niche in ('flowers', 'bakery', 'gifts', 'clothing', 'cosmetics', 'coffee_food', 'services')
  ),
  constraint stores_whatsapp check (whatsapp_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  constraint stores_template check (
    template in ('minimal', 'boutique', 'by_date', 'editorial', 'vivid', 'cinematic')
  ),
  constraint stores_accent check (accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint stores_min_order check (min_order >= 0 and min_order <= 100000000),
  constraint stores_subscription check (
    subscription_status in ('trialing', 'active', 'past_due', 'canceled', 'expired')
  ),
  constraint stores_hours_object check (jsonb_typeof(working_hours) = 'object'),
  constraint stores_zones_array check (jsonb_typeof(delivery_zones) = 'array'),
  constraint stores_form_object check (jsonb_typeof(order_form) = 'object'),
  constraint stores_logo_len check (logo_path is null or char_length(logo_path) <= 500),
  constraint stores_address_len check (char_length(address) <= 300)
);

comment on column public.stores.trial_ends_at is
  'Set to now()+7 days on owner insert. Owners cannot extend it; service_role can for Whop later.';
comment on column public.stores.subscription_status is
  'trialing | active | past_due | canceled | expired. Whop webhooks (service_role) update this later.';
comment on column public.stores.whop_membership_id is
  'Reserved for the Whop membership id. Unused until payments launch.';

create unique index stores_slug_key on public.stores (slug);
create unique index stores_one_owner_key on public.stores (owner_id) where owner_id is not null;
create index stores_owner_idx on public.stores (owner_id);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint categories_name_len check (char_length(btrim(name)) between 1 and 80)
);

create index categories_store_sort_idx on public.categories (store_id, sort_order, id);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  name text not null,
  description text not null default '',
  price integer not null,
  available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_name_len check (char_length(btrim(name)) between 1 and 120),
  constraint products_description_len check (char_length(description) <= 2000),
  constraint products_price check (price >= 0 and price <= 100000000)
);

comment on column public.products.price is 'Price in whole tenge (KZT), not tiyn.';

create index products_store_sort_idx on public.products (store_id, sort_order, id);
create index products_category_idx on public.products (category_id);

create table public.product_photos (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  storage_path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint product_photos_path_len check (char_length(storage_path) between 1 and 500)
);

create index product_photos_product_sort_idx on public.product_photos (product_id, sort_order, id);
create index product_photos_store_idx on public.product_photos (store_id);

create table public.store_covers (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  storage_path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint store_covers_path_len check (char_length(storage_path) between 1 and 500)
);

create index store_covers_store_sort_idx on public.store_covers (store_id, sort_order, id);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  order_number text not null,
  status text not null default 'new',
  customer_name text not null,
  customer_phone text not null,
  fulfillment text not null,
  address text not null default '',
  delivery_zone_id text,
  delivery_zone_name text,
  delivery_price integer not null default 0,
  scheduled_date date,
  scheduled_time text,
  comment text not null default '',
  extra_fields jsonb not null default '{}'::jsonb,
  items jsonb not null,
  subtotal integer not null,
  total integer not null,
  currency text not null default 'KZT',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_number_len check (order_number ~ '^[A-Z0-9]{4,12}$'),
  constraint orders_status check (status in ('new', 'confirmed', 'cancelled')),
  constraint orders_fulfillment check (fulfillment in ('delivery', 'pickup')),
  constraint orders_name_len check (char_length(btrim(customer_name)) between 1 and 80),
  constraint orders_phone_len check (char_length(customer_phone) between 5 and 24),
  constraint orders_address_len check (char_length(address) <= 300),
  constraint orders_time_len check (scheduled_time is null or char_length(scheduled_time) <= 40),
  constraint orders_comment_len check (char_length(comment) <= 500),
  constraint orders_zone_len check (
    (delivery_zone_id is null or char_length(delivery_zone_id) <= 80)
    and (delivery_zone_name is null or char_length(delivery_zone_name) <= 80)
  ),
  constraint orders_money check (
    subtotal >= 0 and subtotal <= 100000000
    and total >= 0 and total <= 100000000
    and delivery_price >= 0 and delivery_price <= 100000000
  ),
  constraint orders_currency check (currency = 'KZT'),
  constraint orders_items_array check (jsonb_typeof(items) = 'array'),
  constraint orders_extras_object check (jsonb_typeof(extra_fields) = 'object'),
  constraint orders_store_number_key unique (store_id, order_number)
);

comment on table public.orders is
  'Shopper inserts are insert-only. Prices are re-checked against the catalog in private.validate_order.';

create index orders_store_created_idx on public.orders (store_id, created_at desc);
create index orders_store_status_idx on public.orders (store_id, status);
create index orders_rate_idx on public.orders (store_id, customer_phone, created_at desc);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  event_type text not null,
  product_id uuid,
  amount integer,
  source text,
  utm jsonb,
  referrer text,
  session_id text,
  created_at timestamptz not null default now(),
  constraint events_type check (
    event_type in (
      'store_view', 'product_view', 'add_to_cart', 'checkout_start', 'whatsapp_click'
    )
  ),
  constraint events_amount check (amount is null or (amount >= 0 and amount <= 100000000)),
  constraint events_source_len check (source is null or char_length(source) <= 120),
  constraint events_referrer_len check (referrer is null or char_length(referrer) <= 500),
  constraint events_session_len check (session_id is null or char_length(session_id) <= 64),
  constraint events_utm_object check (utm is null or jsonb_typeof(utm) = 'object')
);

comment on table public.analytics_events is
  'Anonymous insert-only funnel events. No select policy for anon, so rows of other stores cannot be read.';

create index events_store_created_idx on public.analytics_events (store_id, created_at desc);
create index events_store_type_created_idx on public.analytics_events (store_id, event_type, created_at desc);
create index events_rate_idx on public.analytics_events (store_id, session_id, created_at desc);
create index events_product_idx on public.analytics_events (store_id, product_id)
  where product_id is not null;
