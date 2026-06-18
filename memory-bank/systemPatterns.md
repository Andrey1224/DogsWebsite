# System Patterns

## Architecture

- **Framework**: Next.js 15 (App Router), React 19, TypeScript (Strict).
- **Styling**: Tailwind CSS v4.
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS).
- **Payments**: Dual-provider (Stripe + PayPal).
  - **Pattern**: Atomic reservations via `create_reservation_transaction` RPC.
  - **Idempotency**: `webhook_events` table + application-level checks.
  - **Kill switch**: Public reservation UX uses `NEXT_PUBLIC_RESERVATIONS_DISABLED`; server payment entrypoints also call the `RESERVATIONS_DISABLED`/public env guard before creating checkout sessions, PayPal orders, or captures.
  - **Stripe deposit amount**: Stripe Checkout reads server-only `STRIPE_DEPOSIT_AMOUNT_CENTS` with a default of `30000`; do not expose this as `NEXT_PUBLIC`.
- **State**: URL-driven state for lists; Server Actions for mutations.

## Conventions

- **Components**: `PascalCase`. Prefer Server Components. Client components only for interactivity.
- **Hooks**: `useCamelCase`.
- **Tests**: Vitest for unit/integration, Playwright for E2E.
- **Docs**:
  - History in `docs/history/`.
  - Architecture decisions in `docs/archive/` or specific feature docs.
  - Context map in `docs/llms.txt`.
- **Puppy Recommendations**: Always filter by `status === 'available'` before applying breed/litter matching.
- **Sold Puppy Visibility**: `status === 'sold'` remains public and is labeled `Unavailable`.
  Use `is_archived` only for intentional manual hiding; never auto-archive sold puppies.
- **Optional Third-Party Chat**: Load Crisp only when `NEXT_PUBLIC_CRISP_ENABLED=true` and a
  Website ID exists. Disabled integrations must not render preconnects, loaders, or dead CTAs.
- **React Forms**: When using `defaultValue` with dynamic data, add `key` prop that includes the data to force re-mount on updates (e.g., `key={`${id}-${value}`}`).

## SEO Conventions

- **Page titles**: Use `buildMetadata({ title: 'Page Name' })` — do NOT include "Exotic Bulldog Legacy" in the title string. The root layout template `%s | Exotic Bulldog Legacy` appends it automatically.
- **Structured data (JSON-LD)**: `Organization` and `LocalBusiness` schemas are injected globally in `app/layout.tsx`. Do NOT add `getOrganizationSchema()` or `getLocalBusinessSchema()` in individual pages — it creates duplicate `<script>` tags.
- **FAQPage schema**: Any page with a visible FAQ section should inject `getFaqSchema(items)` via `<JsonLd>` (see `faq/page.tsx` and `app/(site)/(chrome)/page.tsx` as examples).
- **Image paths**: All local public images are under `public/images/…`. URL paths must be `/images/…` (e.g., `/images/reviews/sarah-charlie.webp`). There is no `/public/reviews/` directory.
- **Default OG image**: `lib/seo/metadata.ts` → `DEFAULT_IMAGE = '/images/home/hero/puppy-play.webp'`. Override per-page via the `image` option in `buildMetadata`.
- **Business profile fallback**: `lib/config/business.ts` `DEFAULT_ADDRESS` uses `postalCode: '35622'` (Falkville, AL). Do not use Montgomery (36117).

## Anti-Patterns

- **Do NOT**: Use `any` type.
- **Do NOT**: Commit secrets to `.env`.
- **Do NOT**: Skip `npm run verify` before push.
- **Do NOT**: Duplicate business logic in API routes; use `lib/` services.
- **Do NOT**: Include brand name in page-level title strings — the layout template handles it.
- **Do NOT**: Add Organization/LocalBusiness JSON-LD to individual pages — already in root layout.
