# Components

Small set. Prefer these over new one-off markup.

## `ui/`

shadcn primitives: `Button`, `Input`, `Textarea`, `Label`, `Switch`, `Dialog`, `Sheet`, `Badge`, `Separator`. Use them for cabinet forms and overlays. Do not restyle a raw `<button>` when `Button` already fits.

## Storefront

- `storefront/frame.tsx` — product photo. Uses `next/image` for files and Supabase public URLs. Pass `priority` only on the first above-the-fold image.
- `storefront/layouts.tsx` — `ShopAvatar` is the round shop mark: the first letter on the seller accent, or the uploaded logo when it is not the sample seal. `Catalog` switches the six templates.
- `storefront/storefront.tsx` — cart, the centered order sheet, and the WhatsApp handoff. One checkout, shared by every template.

## Landing

- `landing/landing.tsx` — page composition. The storefront preview is loaded only after a template is opened.
- `landing/phone-demo.tsx` — the hero device. It is a timed demonstration, not the live store.

Motion that must respect `prefers-reduced-motion` goes through `src/lib/motion.ts`.
