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
- **Vercel Web Analytics**: Include `<Analytics />` from `@vercel/analytics/next` once in the root
  `app/layout.tsx`. Keep it separate from the existing consent-managed GA4/Meta Pixel
  `AnalyticsProvider`.
- **Consent-managed marketing analytics (Advanced Consent Mode v2)**: GA4 uses Advanced Consent
  Mode v2. A `beforeInteractive` inline script in `app/layout.tsx` sets up `dataLayer`, `gtag`,
  and `gtag('consent', 'default', ...)` synchronously — reading `localStorage('exoticbulldoglegacy-consent')`
  so returning users start with their stored preference, new/unknown users start with `denied`.
  gtag.js loads unconditionally via `afterInteractive` when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set.
  GA4 config uses `send_page_view: false`; `GaPageViewTracker` sends exactly one `page_view` per
  navigation. trackEvent sends GA4 events in cookieless mode (allowlisted params only) at
  `unknown`/`denied`; Meta events are only dispatched when consent is `granted`.
  Meta Pixel (`NEXT_PUBLIC_META_PIXEL_ID`) script and Meta CAPI (`/api/analytics/meta`) remain
  fully blocked until consent is `granted`. Map shared commerce/lead actions to GA4 recommended
  events and Meta standard events in the central provider.
  - **Consent is user-driven only**: `components/consent-banner.tsx` must never grant consent
    automatically for any browser signal (including `navigator.webdriver`) — Playwright tests
    that don't test consent must preset it via `tests/e2e/helpers/consent.ts#presetConsent()`
    (or `context.addInitScript`) instead of relying on production auto-accept behavior.
  - **URL sanitization**: every analytics integration (GA4, Meta, Vercel Analytics) must route
    URL-shaped values through `lib/analytics/safe-url.ts` (`getSafeUrlParts()` /
    `sanitizeUrlValue()`) — an allowlist of `utm_*`/`gclid`/`dclid`/`fbclid`/`msclkid` query
    params; everything else, including anything on `lib/analytics/sensitive-params.ts`'s
    denylist, is dropped by default. Parse failures fall back to origin+pathname only, never
    the raw input.
  - **PII never leaves the browser, even after Accept**: `lib/analytics/sensitive-params.ts`'s
    `stripSensitiveEventParams()` denylist (`email`/`phone`/`name`/`address`/`message`/`token`/
    `session_id`/`customer_id`/`order_id`/etc.) is applied to GA4 `trackEvent` params in
    granted mode and to Meta's `trackCustom` fallback — consent controls **whether** analytics
    run, not **what** gets sent once it does.
  - **Vercel Analytics `beforeSend`**: must be defined inside a client component
    (`components/vercel-analytics.tsx`) — a function prop can't cross the Server → Client
    Component boundary from `app/layout.tsx`.
  - **Changing consent later**: use `AnalyticsProvider`'s `resetConsent()` (wired to the
    footer's "Privacy settings" button), not a raw `denyConsent()` — it also revokes Meta and
    clears the stored consent so the banner reopens.
- **Paid conversion attribution**: Capture GA4 client/session IDs in the browser when checkout
  begins, validate them before adding them to Stripe metadata, and forward them to GA4 Measurement
  Protocol when the payment webhook emits `deposit_paid`.
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
