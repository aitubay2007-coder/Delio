# Витрина

A mobile-first storefront for a small business. Shoppers browse, fill a short order form, and tap **Отправить в WhatsApp**. The message opens in WhatsApp, and the same order is saved as «новый». Shoppers do not register.

The interface is Russian. All copy lives in `src/i18n/ru.ts`. Fonts include Cyrillic Extended, so Kazakh letters already render; a `kk` dictionary can be added beside `ru` later.

## Requirements

- Node.js 22
- A Supabase project (Auth, Postgres, Storage)

## Environment

Copy the example file and fill in the public values. Never put a `service_role` or secret key in this app.

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_SITE_URL=http://localhost:43123
```

In the Supabase dashboard, add these Auth redirect URLs:

- `http://localhost:43123/auth/callback`
- `https://YOUR_DOMAIN/auth/callback`

## Database

This repo does not apply migrations itself. Run these files **in order** in the Supabase SQL editor (or `supabase db push` against a local stack):

1. `supabase/migrations/20261124083807_schema.sql`
2. `supabase/migrations/20261124083808_functions.sql`
3. `supabase/migrations/20261124083809_rls.sql`
4. `supabase/migrations/20261124083811_storage.sql`

Then load the example flower shop:

5. `supabase/seed.sql`

The seed is fictional and safe to run again. It creates `/s/primer` («Цветочная лавка»). Until the seed exists, that same example is served from local fixtures so the landing page’s «Посмотреть пример» still opens.

`private` is not listed in `supabase/config.toml` `[api].schemas`, so the trigger functions are not Data API endpoints. `anon` and `authenticated` can execute them only because inserts must be allowed to fire the triggers.

## Run locally

```bash
npm install
npm run dev -- --port 43123
```

Open [http://localhost:43123](http://localhost:43123).

Useful checks:

```bash
npm run lint
npm run check
npm run build
```

`npm run check` verifies that every palette color, on every template background, reaches WCAG AA 4.5:1 for button text and accent text.

## Deploy on Vercel

1. Import the repository.
2. Set the three `NEXT_PUBLIC_` variables. Set `NEXT_PUBLIC_SITE_URL` to the production origin.
3. Add that origin’s `/auth/callback` URL in Supabase Auth.
4. Apply the migrations and seed before inviting a shop.

No server secret is required for this MVP.

## What is included

- Landing page, six original templates, any accent color with automatic contrast
- Email and password sign-up, login, and password reset
- Onboarding that starts a 7-day trial (`trial_ends_at`, `subscription_status`)
- Owner cabinet: shop info, hours, delivery zones, catalog, photos, branding, order form, orders, statistics, link and QR
- Public storefront, cart, niche fields, WhatsApp deep link, and a saved order
- Anonymous analytics up to the WhatsApp tap. Confirmed orders are marked by the owner.

## What is stubbed

- **Whop** is not connected. `whop_customer_id` and `whop_membership_id` are reserved. A future webhook with the secret key can set `subscription_status`; owners cannot change it themselves.
- **Own domain** and **video cover** are marked «скоро».
- **Payments** are not collected. The first 7 days need no card. After the trial, the public storefront pauses and the cabinet stays open.
- One store per owner.
- The example cabinet at `/preview/cabinet` is labeled sample data and does not write to the database. It exists so the owner UI can be reviewed before migrations are applied.
- This environment could not run `supabase start` (no Docker) and has no database admin access, so the schema was not executed against the hosted project. The app falls back to the fixture shop for `/s/primer` when the table is missing.

## Decisions

- Prices are whole tenge.
- Orders are insert-only for shoppers. A private trigger checks catalog prices, delivery-zone prices, the minimum order, and a small rate limit. The owner can change only the status.
- Analytics events are insert-only for anonymous clients and readable only by the store owner. A session id is required. Views are deduped in the browser per day; taps are recorded each time.
- The demo slug `primer` is reserved.
- Store media uses a public Storage bucket `store-media`. Owners can upload only inside their `{store_id}/` folder. Demo art ships in `public/demo` and is referenced by path.
- The only dark surface is the «Кинематографичный» template. The marketing site and cabinet stay light.
