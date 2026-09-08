# Active Context

## Current Goal

- **P0**: Adopt Memory Bank standards for AI context persistence.
- **P1**: Unify documentation entry points to reduce duplication.
- **P2**: Automate documentation integrity (link checking).
- **P3**: Temporarily pause customer reservations until Stripe customer setup is complete.
- **P4**: Disable intro screen so the home page loads immediately.
- **P5**: Disable promotional modal on production via env variable.
- **P6**: Harden live Stripe rollout with a server-side reservation kill switch.
- **P7**: Support temporary server-side Stripe deposit amount for live $1 payment verification.
- **P8**: Correct live local SEO copy around Falkville/Cullman service areas.
- **P9**: Keep sold puppy profiles public and indexable while blocking reservations.
- **P10**: Disable the unused Crisp live chat without loading its client script.
- **P11**: Add a "Pay Full" option (Stripe-only) alongside the existing deposit reservation flow.
- **P12**: Prepare the site for a Meta ads launch targeting Sunny/Dory — accurate legal pages,
  reservation-process copy, softened marketing/medical claims, restructured CTAs, and a
  non-opt-in contact form.

## Current Status

- **Completed (Sep 8, 2026)**: Added two new "Bulldog Owner School" articles: "Bringing a Puppy Home" and "How to Choose a Healthy Bulldog Puppy".
  - Created custom React layouts (`components/blog/bringing-puppy-home-first-weeks.tsx` and `components/blog/choose-healthy-bulldog-puppy-health-tests.tsx`) implementing the premium article design system with visually engaging flows, color-coded DNA statuses, and interactive checklists.
  - Copied and optimized header images (`bringing-puppy-home-first-weeks.jpg` and `choose-healthy-bulldog-puppy-health-tests.jpg`).
  - Merged local post registry metadata into `/blog` and configured dynamic rendering routes in `app/(site)/(chrome)/blog/[slug]/page.tsx`.
  - Upgraded FAQ system (`faq-data.ts`, `faq-content.tsx`) to support inline internal links and cross-linked the genetic testing question directly to the new health test article.
- **Completed (Sep 8, 2026)**: Executed Post-Publish SEO fixes.
  - Interlinked Care, Health, and Nutrition cluster articles.
  - Restructured the Sanity `high-carb-commercial-dog-food-risks` post into a local React component (`components/blog/high-carb-commercial-dog-food-risks.tsx`) with proper H2/H3s.
  - Deduplicated Sanity and local posts in `/blog` listing and `/sitemap.ts`.
  - Enforced `og:type: 'article'` and improved bottom mobile padding on blog post pages.
  - Added new E2E tests for blog SEO (`tests/e2e/blog-seo.spec.ts`).
  - Generated PR #21.

- **Completed (Aug 10, 2026, later still same day)**: Fixed a second, distinct cause of the same
  symptom as the entry directly below — `ViewContent` still missing on cold/direct loads of
  `/puppies/sunny` and `/puppies/dory` even after the effect-ordering race fix.
  - **Root cause**: when consent is already `granted` from a prior visit (localStorage/cookie),
    `PuppyViewTracker` (`components/analytics/puppy-view-tracker.tsx`) gated only on
    `consent === 'granted'` and fired immediately on mount — before the `fb-pixel` `<Script>`
    (`strategy="lazyOnload"`, `analytics-provider.tsx`) has loaded and called
    `fbq('init', metaPixelId)`. The resulting `track`/`ViewContent` call gets queued via
    `ensureMetaPixelQueue()`'s placeholder (`lib/analytics/meta-pixel.ts`) _before_ `init` is ever
    queued or executed — `init` is only ever called directly in the Script's `onLoad`, never
    pushed through the queue. Meta's real `fbevents.js`, once it loads and drains that queue, does
    not honor a `track` call that predates `init` for the same pixel — it is dropped. This is
    exactly the gap `MetaPageViewTracker` already avoids for `PageView` by gating on a `ready`
    prop wired to internal `metaReady` state; `PuppyViewTracker` had no equivalent gate.
  - **Fix**: exposed `metaReady` through `AnalyticsContextValue`/`useAnalytics()` in
    `components/analytics-provider.tsx` (it already existed as internal state, just wasn't
    exported). `PuppyViewTracker` now also gates on `metaReady`, in addition to `consent` and its
    existing per-slug dedup ref. Kept dispatch going through `trackEvent` → `dispatchMetaEvent`
    (not a direct `fbq('track', ...)` call) so the existing browser/CAPI `eventID` dedup is
    unaffected. **Side-fix required**: the pixel-consent effect previously never set `metaReady`
    to `true` when `metaPixelId` is falsy (e.g. local dev without env vars) — gating
    `PuppyViewTracker` on `metaReady` would otherwise have permanently blocked its GA4 `view_item`
    tracking too in that case, since `trackEvent` sends both GA4 and Meta from one call. Fixed by
    setting `metaReady(true)` immediately when no pixel is configured (nothing to wait for).
  - **Test coverage**: `components/analytics/puppy-view-tracker.test.tsx` — added cases for
    `metaReady: false` (no track call), `metaReady` flipping `true` (exactly one call with Sunny's
    params), and an SPA transition to a new slug (Dory) while `metaReady` stays `true` (exactly
    one more call, no duplicate for the prior slug).
  - **Verification**: `npm run lint`, `npm run typecheck`, `npm run test` (804 passed, 12 skipped)
    all clean. Live Meta Test Events verification on a direct `/puppies/sunny` load is a manual
    follow-up for the user post-deploy, not done as part of this session.

- **Completed (Aug 10, 2026, later same day)**: Fixed `ViewContent` silently not firing on the
  puppy detail pages (`/puppies/sunny`, `/puppies/dory`) for fresh/direct visits — the exact
  traffic pattern Meta ads produce. `PageView` kept working; only `ViewContent` (and, by the same
  mechanism, any other `trackEvent` call fired from a component's own mount effect) was affected.
  - **Root cause**: a React effect-ordering race, not a deleted tracker or broken consent guard.
    `PuppyViewTracker` (`components/analytics/puppy-view-tracker.tsx`) is a descendant of
    `AnalyticsProvider`. When `consent` resolves from `'unknown'` to `'granted'` on the _same_
    render (i.e. a first-time visitor who accepts the consent banner while already on the puppy
    page — normal for someone landing cold from an ad, abnormal for someone who clicked through
    from the homepage first), React fires effects child-before-parent. `PuppyViewTracker`'s effect
    (which calls `trackEvent('view_item', …)` → `window.fbq?.(...)`) ran _before_
    `AnalyticsProvider`'s own effect that creates the `window.fbq` queue placeholder via
    `ensureMetaPixelQueue()`. At that instant `window.fbq` was still `undefined`, so
    `window.fbq?.(...)` silently no-opped — the event was dropped, not queued, not retried.
    `MetaPageViewTracker` never hit this because it gates on `metaReady` (set only after the real
    pixel script's `onLoad`), not just on `consent`; `reserve_click`/`Lead` didn't hit it either
    since those fire from a later user click, well after the provider's bootstrap effect has run.
    This also explains why the Aug 10 same-day verification (noted below) reported
    `PageView`/`ViewContent`/`Lead` all arriving fine: that check was done via in-site navigation
    (consent already resolved on an earlier page), which never triggers the race — only a cold
    direct load of the puppy URL does.
  - **Fix**: `components/analytics-provider.tsx` — `trackEvent`'s Meta branch now calls
    `ensureMetaPixelQueue()` itself (idempotent, already used elsewhere in the same file) right
    before dispatching, so `window.fbq` is guaranteed to exist regardless of which component's
    effect runs first. Added `metaPixelId` to `trackEvent`'s `useCallback` deps (it's now read
    inside the callback). No changes to CAPI (`sendMetaServerEvent`/`/api/analytics/meta`), Lead,
    Purchase (still deliberately unimplemented), the cookie/consent banner, or Ads Manager
    settings — this was purely a client-side pixel-dispatch ordering bug.
  - **Regression test**: `components/analytics-provider.test.tsx` — new test under "returning user
    scenarios" that, unlike every other test in the file, does _not_ pre-stub `window.fbq`
    (pre-stubbing masks exactly this race). It mounts a child that mirrors `PuppyViewTracker`'s
    own guard shape and fires `trackEvent('view_item', …)` from its mount effect while consent
    resolves to `'granted'` on the same render, then asserts the event landed in the pixel queue.
    Confirmed the test fails without the fix (`window.fbq` never gets defined) and passes with it.
  - **Verification**: `npm run lint`, `npm run typecheck`, `npm run test` (803 tests) all clean.
    Did not re-run the full local Playwright e2e suite for this fix (no UI/markup changed, only
    the trackEvent dispatch path) — relying on CI's e2e run on push to `dev` per the standard
    workflow.
  - Committed and pushed to `dev`.

- **Completed (Aug 10, 2026)**: Shipped a full Meta-ads-launch-readiness pass on `dev`, targeting
  the Sunny/Dory listings and Pixel `1924892261406006` (not merged to `main`, not deployed).
  - Split `/policies` into real `/privacy` + `/terms` pages (the old URL becomes a short hub, no
    duplicate content); rewrote the reservation sequence sitewide to match reality — inquiry →
    contact → video call/visit → kennel confirms → signed contract → **then** $300 deposit →
    balance per contract — replacing prior copy that implied instant self-serve checkout.
  - Softened unverified marketing/medical claims sitewide (Award Winning badge, placement-count
    stats, OFA/DNA/AKC wording, numeric health-guarantee restatements outside `/terms`) to neutral,
    accurate phrasing across `app/(site)/(chrome)/{about,reviews,page}.tsx`,
    `components/hero-carousel.tsx`, `components/puppy-detail/health-badge.tsx`, `app/manifest.ts`,
    `app/opengraph-image.tsx`, `lib/data/locations.ts`, `lib/emails/simple-templates.ts`.
  - Restructured puppy detail CTAs (`app/(site)/(chrome)/puppies/[slug]/reserve-button.tsx`): the
    primary CTAs are now "Apply for {name}" / "Schedule a Video Call" (routing to
    `/contact?puppy=slug`, reusing the existing `context` prop on `ContactForm`); the Stripe
    deposit button is demoted to a secondary "final step after approval" with the accessible name
    changed from "Reserve …" to `Pay $X deposit`; the old "Buy Now — pay full" CTA was removed
    from the UI entirely (backend `paymentType: 'full'` code path and webhook handling stay
    intact, unreachable from the current UI).
  - Contact form (`components/contact-form.tsx`): added a Privacy Policy link next to the consent
    line; then, after user follow-up, fully **removed** the "we may also reach out about future
    litters — opt out anytime" sentence from both dark/light variants (it still read as a default
    marketing opt-in even with an opt-out mention). The consent copy now covers only "we'll
    respond to this inquiry." A marketing-consent checkbox was considered and rejected for this
    pass — it would need a new Supabase column (blocked by the standing "coordinate schema changes
    with maintainer" rule) and there is no marketing-email sender in the codebase to wire it to;
    any future request to add one needs a real schema-change discussion first, not cosmetic-only
    UI.
  - **Meta Pixel finding, resolved same day**: local Chrome testing showed the Pixel's own console
    warning (`traffic permission settings`) on `localhost` — initially flagged as a possible
    pre-ad-spend blocker. The user confirmed this is expected: the Pixel is domain-restricted to
    `exoticbulldoglegacy.com`, so localhost is _supposed_ to be rejected, and production was
    independently verified via Meta Test Events (PageView/ViewContent/Lead all arrive correctly
    from the live domain). **Do not re-raise the localhost warning as a blocker and do not touch
    Meta Traffic Permissions settings** — both are explicit standing instructions now.
  - Committed as `4db7b23` (47 files) + `d6fdbe0` (contact-form consent fix), pushed to `dev`.
  - **CI fix**: the push triggered a real CI failure — `tests/e2e/reservation.spec.ts` still
    looked for a button named `/^reserve\s+/i`, which no longer exists after the CTA text change
    above. Fixed the locator to match the new `Pay $X deposit` name (commit `d6fdbe0`). Verified
    against a local production build (`npm run build && next start`, matching CI's `next start`
    rather than `next dev`) with `CI=true HCAPTCHA_ALLOW_BYPASS_IN_PROD=true` — the full suite
    passes (32 passed, 1 skipped). CI run `31439224028` confirmed green after the push.
    **Gotcha for next time**: running e2e locally against a production build needs
    `HCAPTCHA_ALLOW_BYPASS_IN_PROD=true` in addition to the usual bypass token env vars, or the
    hCaptcha bypass silently no-ops in prod mode even though it works fine under `next dev`.
  - **Facts still needing the owner's confirmation** (never published as on-site placeholders):
    real Telegram handle (link stays hidden until confirmed); whether the existing 12-month health
    guarantee clause/scope in `/terms` is still accurate (left verbatim); exact balance-payment
    timing/method (not defined anywhere in the repo, `/terms` uses neutral "per your signed
    contract" wording); Dory's DB `birth_date` (`2026-05-10`, live but never explicitly restated
    by the owner) and her missing `sire_name`/`dam_name` in Supabase (Sunny has both, Dory has
    neither — confirmed via live read, not a regression from this session); and
    `sire_health_notes`/`dam_health_notes = "Health tested"` on both Sunny and Dory, a bare
    unverifiable claim that needs exact replacement wording from the owner **and** separate
    explicit permission before any production DB write.
  - **Verification**: `npm run verify` (check:links, lint, typecheck, 801 unit/a11y tests, 30 e2e,
    3 pre-existing skips) and `npm run build` clean before the first push; full e2e re-verified
    against a production build after the locator fix. Browser QA (desktop + mobile) covered `/`,
    `/puppies`, `/puppies/sunny`, `/puppies/dory`, `/contact`, `/privacy`, `/terms`, `/policies`.

- **Completed (Aug 6, 2026)**: Fixed the Meta Pixel/Conversions API (CAPI) event-count
  mismatch flagged by Meta's own diagnostics (browser Pixel reporting ~231 more events than
  the server CAPI in a review window).
  - **Root cause**: `lib/analytics/meta-conversions-api.ts` read the Pixel ID only from
    `NEXT_PUBLIC_META_PIXEL_ID`, while the browser Pixel (`app/layout.tsx`) falls back to a
    second, undocumented `META_PIXEL_ID` var. `.env.local` only defines `META_PIXEL_ID`
    (confirmed by grep), so `sendMetaConversionEvent()` was silently returning `false` for
    **every** CAPI call — the browser Pixel fired normally via its fallback while the server
    side no-opped. This was already flagged as a local "known limitation" below (now removed)
    but had never been fixed in the shared code path. Fix: `sendMetaConversionEvent` now reads
    `NEXT_PUBLIC_META_PIXEL_ID || META_PIXEL_ID`, mirroring the browser fallback. Also added
    `NEXT_PUBLIC_META_PIXEL_ID` to `.env.local` alongside the legacy `META_PIXEL_ID`, since it's
    the documented/validated var (`lib/env-validation.ts`).
  - **`reserve_click` had no dedup at all**: it fell through `getMetaTrackingCommand`'s default
    branch to `fbq('trackCustom', ...)` with no `eventID` and no server relay (the route's
    allowlist only accepted the six standard event names), so it showed up in Meta as
    browser-only. Added a small, explicit `ALLOWED_CUSTOM_EVENTS` allowlist (`reserve_click`)
    in `app/api/analytics/meta/route.ts`, loosened `MetaConversionEvent.eventName` from the
    standard-event union to `string` in `lib/analytics/meta-conversions-api.ts` (Meta's CAPI
    accepts custom event names; the standard/custom split is an Ads Manager reporting concept,
    not an API restriction), and generalized `analytics-provider.tsx`'s dedup dispatch
    (`dispatchMetaEvent(method, name, params)`) so `reserve_click` now fires
    `fbq('trackCustom', 'reserve_click', params, { eventID })` and relays the same `eventId` to
    `/api/analytics/meta`, same as the standard events. Other `trackCustom` events
    (`chat_open`, `checkout_error`, `about_cta`, etc.) are unchanged — still browser-only, out
    of scope.
  - **Deliberately deferred**: `Purchase` is declared in `META_STANDARD_EVENTS` and prior
    changelog/memory-bank entries claimed it was "added," but no code path anywhere (client or
    the Stripe/PayPal webhook handlers) actually fires it — that claim was inaccurate. The user
    chose to defer implementing `Purchase` to a separate follow-up, since it would require
    touching `lib/stripe/webhook-handler.ts`/`lib/paypal/webhook-handler.ts` (payment-critical
    code previously earmarked for isolated review — see `PLAN_PAYMENT_RELIABILITY_FIXES.md`
    history). Not touched in this pass.
  - Test coverage: extended `lib/analytics/meta-conversions-api.test.ts` (Pixel ID fallback,
    missing-both-vars case, custom event name acceptance), `app/api/analytics/meta/route.test.ts`
    (`reserve_click` now accepted), and `components/analytics-provider.test.tsx` (`reserve_click`
    dedup event_id sharing, and that it's still consent-gated).
  - **Verification**: `npm run lint`/`typecheck` clean; Vitest 772 passed / 12 skipped (784
    total).
  - **User follow-up still needed**: confirm `NEXT_PUBLIC_META_PIXEL_ID` and
    `META_CONVERSION_API_TOKEN` are set correctly in Vercel Production (the same var-naming
    mismatch may exist there — user is checking directly); after deploy, verify in Meta Events
    Manager → Test Events that Browser+Server sources merge per event; Meta's mismatch warning
    can take 24–72h to clear after the fix ships.

- **Completed (Aug 4, 2026)**: Live $1 Stripe payment QA — verified deposit and pay-in-full
  checkout end-to-end on the client's real (live) Stripe account.
  - `.env.local` Stripe keys are now **live** (`sk_live_`/`pk_live_`), not sandbox — restored
    from the previously-commented values. Sandbox keys are now the commented-out fallback.
    See memory `stripe-test-keys-active-in-env-local` (needs updating to match).
  - Key discovery: the deployed production site already has its own **live-mode Stripe webhook
    endpoint** configured and working independently of local dev — it has its own
    `STRIPE_WEBHOOK_SECRET` on Vercel (referenced in `.env.local` as the commented "Moms real
    one" secret) and its own `OWNER_EMAIL` (`mosss73@myyahoo.com`, not the local
    `nepod77@gmail.com`). Any live Stripe event now gets delivered to both production and any
    local `stripe listen --live` session running at the same time — production wins the
    race to create the reservation, and a local listener that loses the race fires a
    "money taken without reservation" alert email that looks like a bug but isn't (the
    reservation exists, just created by prod's handler, not the local one). Don't be alarmed
    by that alert if this is retested locally — verify the DB/Resend dashboard, not just the
    local terminal log.
  - Verified via two real $1 charges against test/hidden puppy records (created directly via
    Supabase MCP `insert`, archived immediately after): deposit flow → reservation `paid`,
    puppy → `reserved`; full-pay flow → reservation `paid`, puppy → `sold`. Both customer and
    real-owner (`mosss73@myyahoo.com`) emails confirmed delivered via the Resend dashboard.
  - `STRIPE_DEPOSIT_AMOUNT_CENTS` and `RESEND_DELIVERY_MODE` were temporarily changed for the
    test window and have been reverted to their prior values (`unset`/$300 default,
    `"never"`). Live Stripe keys were intentionally left active per user request — local dev
    now runs against the real payment account, not sandbox.

- **Completed (Aug 3, 2026)**: Final hardening pass on the Advanced Consent Mode v2 analytics
  stack (no architecture changes — cookieless GA/Meta-after-Accept/Vercel-always design kept).
  - Removed the `navigator.webdriver` auto-Accept branch from `components/consent-banner.tsx`
    entirely; the banner never grants consent on its own for any browser, automated or not.
    Playwright specs that don't test consent (`admin.spec.ts`, `smoke.spec.ts`,
    `reservation.spec.ts`) now preset `localStorage` consent via a new
    `tests/e2e/helpers/consent.ts#presetConsent()` (or `context.addInitScript`) instead.
  - Rewrote the consent banner copy: dropped "Analytics Only" / "Data is anonymous"; added the
    "Analytics & advertising measurement" heading and cookieless/Meta-after-Accept explanation.
    Buttons stay equally weighted (`Decline` / `Accept & Continue`).
  - New `lib/analytics/safe-url.ts`: shared allowlist-based URL sanitizer
    (`utm_*`, `gclid`, `dclid`, `fbclid`, `msclkid` only; everything else — including
    `session_id`, `email`, `token`, etc. — is dropped by default). Exposes
    `getSafeUrlParts(href) -> {safeLocation, safePath}` and `sanitizeUrlValue()` for
    path/URL-shaped strings. Parse failures fall back to origin+pathname only, never the raw
    input. Used by GA4 page views, Meta page views/CAPI `sourceUrl`, `trackEvent`'s
    `page_location`/`page_path`/`context_path` fields, and the new Vercel Analytics
    `beforeSend`.
  - New `lib/analytics/sensitive-params.ts`: `stripSensitiveEventParams()` denylist
    (email/phone/name/address/message/password/token/session_id/customer_id/order_id/etc.),
    applied to GA4 events in granted mode and to Meta's `trackCustom` fallback — consent never
    authorizes sending raw form input, on top of the existing cookieless-mode allowlist.
  - `GaPageViewTracker` now sources both `page_location` and `page_path` from the shared
    sanitizer applied to `window.location.href`; the React-side `pageKey` is dedup-only and
    is never sent to GA. Same for Meta's `PageView` and the CAPI `sourceUrl` forwarded to
    `/api/analytics/meta`.
  - `/api/analytics/meta` hardened: added a same-origin check (`request.nextUrl.host` vs.
    `Origin`/`Referer`, only enforced when one of those headers is present — keepalive
    requests during outbound navigation still work), tightened `sourceUrl`/`eventId`/`fbp`/
    `fbc` length limits, added an `eventId` charset check, and replaced the pass-through
    `customData` with an allowlist (`content_ids`/`content_name`/`content_category`/
    `content_type`/`value`/`currency`) that rejects nested objects and unknown fields. The
    consent-cookie gate and Meta event-name allowlist are unchanged.
  - Added `components/vercel-analytics.tsx`, a client wrapper around `<Analytics />` from
    `@vercel/analytics/next` (v2.0.1, confirmed `beforeSend` support in its `.d.ts`) that
    applies the shared sanitizer to `event.url`. `app/layout.tsx` (a Server Component) now
    renders `<VercelAnalytics />` instead of importing `<Analytics />` directly, since a
    `beforeSend` function prop cannot cross the Server → Client Component boundary.
  - Added `components/privacy-settings-button.tsx` and a new `resetConsent()` method on
    `AnalyticsProvider` (denies GA consent, revokes Meta, clears the consent
    localStorage/cookie, sets state back to `unknown` so the banner reopens without a full
    reload). Wired into `SiteFooter`'s bottom bar as "Privacy settings".
  - Rewrote the "Cookie & Analytics Policy" section on `/policies`: documents Vercel's
    always-cookieless aggregated stats, GA's cookieless-before-Accept mode (with the honest
    disclosure that such requests can technically include IP/user-agent/referrer/device
    params), Meta Pixel/CAPI only after Accept, Decline keeping Google cookieless and Meta
    fully blocked, and the footer "Privacy settings" link — without absolute claims like
    "completely anonymous".
  - Test coverage: new `lib/analytics/safe-url.test.ts`, `lib/analytics/sensitive-params.test.ts`,
    `components/consent-banner.test.tsx`, `app/api/analytics/meta/route.test.ts`; extended
    `components/analytics-provider.test.tsx` (URL sanitization, PII stripping in both
    granted/cookieless modes, Meta `sourceUrl` sanitization, `send_page_view:false`
    bootstrap assertion, `resetConsent` behavior) and `components/site-footer.test.tsx`
    (Privacy settings button). Rewrote `tests/e2e/analytics-consent.spec.ts` with real
    assertions matching each test's name (cookie presence, script requests, a GA
    `dataLayer` bootstrap-order check, an Accept/Decline/Privacy-settings flow) instead of
    the old webdriver-override + localStorage-only checks.
  - **Verification**: `npm run lint`/`typecheck` clean; Vitest 766 passed / 12 skipped (778
    total); `npm run build` succeeded; full Playwright suite passed serially (33 passed, 1
    skipped) — one `reservation.spec.ts` timeout was reproduced only under parallel workers
    sharing live puppy-status data with `admin.spec.ts` (pre-existing flake pattern already
    documented below under Jul 10, not caused by this change) and did not reproduce serially
    or in isolation.
  - **Known limitation**: Reset/Decline does not force-expire already-set `_ga`/`_fbp`
    browser cookies (per spec, this is acceptable — the policy copy no longer claims
    immediate removal). The local dev `/api/analytics/meta` 503 (caused by
    `NEXT_PUBLIC_META_PIXEL_ID` not being set in `.env.local`, only the `META_PIXEL_ID`
    fallback) was fixed Aug 6, 2026 — see the entry above.
  - Not deployed; no PR opened. Awaiting explicit approval before merge to `main`.

- **Completed (Aug 3, 2026)**: Implemented GA4 Advanced Consent Mode v2.
  - `beforeInteractive` inline script in `app/layout.tsx` initialises `dataLayer`/`gtag` and calls
    `gtag('consent', 'default', ...)` synchronously — reads `localStorage('exoticbulldoglegacy-consent')`
    so returning users start with their stored preference; new/unknown users start `denied`.
  - GA4 `gtag.js` loads unconditionally (when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set) via `afterInteractive`.
  - GA4 config uses `send_page_view: false`; new `GaPageViewTracker` sends exactly one `page_view` per
    navigation (pathname + searchParams). No duplicates on re-render or consent update.
  - `trackEvent` split: GA4 receives cookieless events (allowlisted params only) at `unknown`/`denied`;
    Meta events dispatched only when `consent === 'granted'`.
  - Allowlist: `page_path`, `page_location`, `page_title`, `content_type`, `content_name`,
    `puppy_slug`, `breed`, `method`, `location`, `context_path`, `currency`, `value`.
    All other params (including unknown) stripped before cookieless GA4 send.
  - `buildSafeLocation()` strips sensitive query params (email, token, key, password…) from URLs.
  - Meta Pixel and Meta CAPI remain fully blocked at `unknown`/`denied`. `/api/analytics/meta`
    cookie check unchanged. `getAnalyticsIdentifiers()` still requires `granted`.
  - Added `ConsentSettings` type and `'consent', 'default'` command to `types/window.d.ts`.
  - New `/policies` Cookie & Analytics Policy section explains Advanced Consent Mode in plain
    language with accurate IP/user-agent disclosures.
  - New `components/analytics-provider.test.tsx` (21 tests): bootstrap, script rendering,
    consent updates, page_view deduplication, cookieless allowlist, Meta isolation,
    returning-user localStorage scenarios, backward-compat Meta event mapping.
  - New `tests/e2e/analytics-consent.spec.ts`: Playwright cookie/script presence tests.
  - Updated `memory-bank/systemPatterns.md` consent pattern rule.
  - **Verification**: Vitest 721 passed / 12 skipped (733 total, 0 failed).
    Playwright 31 passed / 1 pre-existing flaky (reservation button, no dev-DB puppies,
    documented `retries: 2` in CI) / 1 skipped. Port-3000 conflict resolved before E2E run.
  - Not deployed to production. Awaiting explicit approval before PR/merge to `main`.

- **Completed (Aug 3, 2026)**: Closed the remaining literal verification gaps from
  `PLAN_PAYMENT_RELIABILITY_FIXES.md`.
  - Added durable stale-Stripe-event persistence plus database-backed alert-window aggregation in
    `20260803220000_add_webhook_alert_buckets.sql`.
  - Added eight real-Postgres reservation-integrity/concurrency regressions and corrected the
    offline Stripe integration expectation to the final `paid` contract; all 12 database-backed
    integration tests pass against local Supabase.
  - Upgraded the project Supabase CLI dependency, copied the production `public` schema and data
    into local Supabase with read-only `pg_dump`, and restored the missing local
    `reviews.featured` schema migration. A clean `supabase db reset` applies the full migration
    chain successfully; the local database was then returned to the production dataset plus the
    proposed alert-bucket migration.
  - Completed real Stripe test-mode E2E through `stripe listen`: deposit → paid/reserved; a second
    payment → no duplicate reservation, durable failed webhook, alert claimed; full payment →
    paid/sold; full refund → refunded/available. Email delivery stayed disabled throughout and all
    disposable local records were removed.
  - Final `VITEST_MAX_THREADS=4 npm run verify` passed documentation/link checks, lint, typecheck,
    Vitest, and Playwright (25 passed, 3 intentionally skipped).
  - Production Migration C was applied through Supabase MCP as
    `20260804002806_add_webhook_alert_buckets`; verification confirms the table is empty on create,
    `service_role` alone has table/RPC access, and client roles have neither.
  - The tested working tree was initially deployed directly to Vercel as
    `dpl_BTqEB2GR41kHDhBWm27cyDZRiyWD` and reached READY. The same complete change set was then
    committed to `dev` as `2380ec0`, passed the GitHub/Vercel preview pipeline, and was merged through
    PR #13 into `main` as `7810e34`.
  - The post-merge GitHub CI run `30867091312` passed Prettier, lint, typecheck, unit tests, production
    build, and Playwright E2E. Vercel production deployment
    `dpl_8qK7T2bki7eZjTZ9rzRjnwNUhRcz` completed successfully; the primary domain, `/api/health`, and
    `/api/health/webhooks` returned HTTP 200, with webhook health `healthy`. Overall health remains
    `degraded` only for the existing optional `NEXT_PUBLIC_CONTACT_HOURS` warning.
  - No Stripe environment variables were changed by the code deployment. Vercel retains Sensitive
    values without revealing them after save, so the current live/test key mode was not independently
    re-read during handoff. `STRIPE_DEPOSIT_AMOUNT_CENTS` must contain integer cents (`30000` for $300,
    or temporarily `100` for a deliberate $1 live check), never a Stripe API key. A new live-card
    payment was not performed after the merge; the signed Stripe test-mode flow above is the completed
    automated/integration verification.

- **Completed (Aug 3, 2026)**: Implemented `PLAN_PAYMENT_RELIABILITY_FIXES.md` in gated phases.
  Phase 1 combined Pay Full with the service-role/server-only and PayPal paid-status hotfixes;
  Phase 2 added durable failure handling, unified reservation integrity, and refund-safe release.
  - First staged code deployment is live as `dpl_DwKuoS7dVLd32u7894uLjsi9i6VV`; the primary
    domain is aliased to it and the live Sunny page exposes the full-payment CTA.
  - Payment-safe expiry, unified database sentinels, durable alert claims, failure persistence,
    partial-refund protection, atomic puppy release, admin warnings, and the daily cron are live.
  - Migration A (`20260803200000_make_pending_expiry_payment_safe.sql`) was applied to production
    through the Supabase SQL Editor after the read-only MCP and unauthorized CLI token prevented the
    normal migration path. Post-deploy verification confirms the paid-signal guard is present,
    `service_role` has execute access, `anon`/`authenticated` do not, and both integrity audits are 0.
  - After write access was enabled, Migration A was registered through Supabase MCP as live version
    `20260803231132`; Migration B was applied as `20260803231214`. Verification confirms the new alert
    column/functions, unified sentinels, service-role-only permissions, and clean 0/0 integrity audits.
  - Final production deployment `dpl_Dgoncm1qRKEkEkq47jyUmA75b2sn` is READY and aliased to
    `exoticbulldoglegacy.com`. Vercel registered `/api/cron/expire-reservations` at `0 6 * * *`;
    unauthenticated access returns 401 as intended. Health database/email/analytics checks are OK;
    only the pre-existing optional `NEXT_PUBLIC_CONTACT_HOURS` warning keeps overall health degraded.
  - Pre-Migration-A production audit: 0 paid-signal pending rows and 0 unpaid expired pending rows.
  - Verification: docs/link checks, lint, typecheck, and Vitest pass (696 passed, 4 skipped);
    Playwright passes outside the macOS sandbox (25 passed, 3 skipped).
  - Final post-documentation `npm run verify` again passed docs/link checks, lint, typecheck, and
    Vitest; its Playwright stage hit the known sandbox `EMFILE` watcher failure. The same E2E suite
    had already passed in the approved non-sandbox run above, and the Vercel production build passed.

- **Completed (Aug 3, 2026)**: Connected Codex to the project-scoped Supabase MCP using OAuth.
  - MCP targets project `vsjsrbmcxryuodlqscnl`. On user approval, the `read_only=true` URL flag
    was removed from `.codex/config.toml` so future Codex sessions can apply tracked migrations.
  - Removed the stale `SUPABASE_ACCESS_TOKEN` requirement from `.codex/config.toml`; credentials
    are stored by Codex OAuth and no secret was added to the repository.
  - A new Codex chat/session may be required before Supabase tools appear in the tool list.

- **Completed (Aug 3, 2026)**: Added a "Pay Full" payment option to the puppy reservation flow
  (Stripe-only; PayPal remains deposit-only and its UI stays disabled).
  - New `reservations.payment_type` column (`'deposit' | 'full'`, default `'deposit'`) and a
    matching `p_payment_type` param on the `create_reservation_transaction` RPC
    (`supabase/migrations/20260803000000_add_payment_type_to_reservations.sql`). A full payment
    now sets the puppy to `'sold'` instead of `'reserved'`.
  - `createCheckoutSession()` takes a `paymentType` argument; for `'full'` the charge is computed
    from `puppy.price_usd` instead of the flat deposit env var, with matching Checkout line-item
    copy and metadata.
  - Puppy detail page shows a secondary "Buy Now — Pay full $X" CTA alongside the existing deposit
    button (only when the puppy has a price).
  - Webhook handler, GA4 (`trackDepositPaid`), and the owner/customer email templates all branch
    on `payment_type`, defaulting to `'deposit'` for in-flight sessions created before this shipped.
  - Admin reservations table now shows a Type (Deposit/Full Payment) column.
  - Migration applied to the live `exotic-bulldog` Supabase project (`vsjsrbmcxryuodlqscnl`) via
    the Supabase MCP, with the user's explicit approval per-action. `lib/supabase/database.types.ts`
    was verified against a live `generate_typescript_types` call (matches the hand-edit exactly);
    the file was not wholesale-replaced since the generator now uses a newer codegen format that
    would have produced a large, unrelated diff across every table.
  - **Two pre-existing production issues found and fixed while inspecting the live schema (both
    unrelated to Pay Full, both explicitly approved by the user before applying):**
    1. `reservations.status` check constraint only allowed `'canceled'` (single-L) while the app
       (`ReservationQueries.cancel()`) writes `'cancelled'` — the admin "cancel reservation" action
       was failing in production. Fixed via
       `20260803190000_fix_reservation_status_cancelled_spelling.sql` (drops the redundant legacy
       constraint, normalizes the 3 existing rows, re-adds `valid_reservation_status` with the
       correct spelling).
    2. `create_reservation_transaction` (SECURITY DEFINER) was executable by `anon`/`authenticated`
       via the public PostgREST RPC endpoint — Postgres grants EXECUTE to PUBLIC by default on
       function creation, and the original migration never revoked it. This let unauthenticated
       callers mark any puppy `'reserved'`/`'sold'` with zero real payment. Fixed via
       `20260803190100_restrict_create_reservation_transaction_to_service_role.sql`
       (`REVOKE ALL ... FROM PUBLIC, anon, authenticated`, confirmed via `has_function_privilege`).
    3. Also self-discovered and fixed: `CREATE OR REPLACE FUNCTION` with an added trailing
       parameter created a _second overload_ of `create_reservation_transaction` instead of
       replacing it (Postgres matches on full parameter list). Dropped the stale 11-arg overload
       (`20260803184849` live / folded into `20260803000000_add_payment_type_to_reservations.sql`
       locally) so only one signature exists.
  - **Operational follow-up:** full-price charges (e.g. $3,000) will always trip the existing
    Stripe Radar rule that challenges transactions >$250 — worth revisiting that threshold in the
    Stripe Dashboard for domestic full payments (see `docs/payments/payments-architecture.md` §5).
  - **Not yet fixed (flagged only, not in scope):** `get_advisors` also surfaced pre-existing,
    lower-severity findings unrelated to this session — RLS enabled with no policy on
    `inquiries`/`litters`/`parents`/`puppies`/`reservations`, several functions with a mutable
    `search_path`, `pgcrypto` installed in `public`, and public storage buckets (`puppies`,
    `reviews`) allowing object listing. Worth a dedicated security-hardening pass later.
  - Verification: `npm run lint`/`typecheck` clean; Vitest 691/691 passed; Playwright 26/27 passed
    (1 pre-existing flaky test under local parallel load, unrelated to this feature — passes on
    retry, matches CI's existing `retries: 2`). Code changes not yet committed/pushed to git; the
    live DB migrations above are already applied regardless of git commit state.

- **Completed (Aug 2, 2026)**: Expanded the site's consent-managed analytics into a measurable
  SEO-to-lead funnel.
  - Restored automatic GA4 page views; the previous root configuration disabled them without a
    manual page-view replacement.
  - Fixed Meta Pixel configuration by reading the deployed `NEXT_PUBLIC_META_PIXEL_ID`, added
    App Router page-view tracking, and mapped standard Meta conversion events.
  - Added `view_item` on puppy profiles, `generate_lead` after successful contact inquiries,
    `begin_checkout`/reservation diagnostics on Stripe intent, and checkout-error diagnostics.
  - GA4 browser client/session identifiers now flow through validated Stripe metadata into the
    server-side `deposit_paid` event for stronger conversion attribution.
  - Removed Google/Meta preconnects before consent. GA4, Meta Pixel, and their events continue to
    load only after an explicit analytics opt-in.
  - Live browser verification found and corrected the legacy Meta queue's conflicting version
    shape. The production page now loads the expected `fbevents.js` plus Meta's pixel-specific
    configuration script without the earlier version-conflict warning.
  - Deployed to Vercel production as `dpl_7tgABYv8WPhBoPSbFC7sQQRuQmW8`; the primary domain was
    aliased to the ready deployment. Live `/api/health` reports analytics `ok` with both `ga4` and
    `meta_pixel`; overall health remains `degraded` only because `NEXT_PUBLIC_CONTACT_HOURS` is
    not explicitly set and the documented fallback schedule is in use.
  - Verification: production build passed; `VITEST_MAX_THREADS=4 npm run verify` passed docs,
    links, lint, typecheck, Vitest (676 passed, 4 skipped), and Playwright (25 passed, 2 skipped).

- **Completed (Aug 2, 2026)**: Restored a more personal breeder voice to the owner guide's BOAS
  section while retaining veterinarian-led evaluation, individualized treatment language, surgical
  risk context, and the authoritative American College of Veterinary Surgeons reference.
  - Deployed to Vercel production as `dpl_BxEhR3WnQ6jdsEpmHwWWP9Xh4y3T`; the primary domain was
    aliased to the ready deployment and the live article HTML contains the updated authorial copy.
  - Verification: `npm run verify` passed documentation checks, lint, typecheck, Vitest (668
    passed, 4 skipped), and Playwright (25 passed, 2 skipped).
- **Diagnostic Update (Aug 2, 2026)**: Completed the post-deployment Search Console and Google
  Business Profile audit without changing settings or requesting indexing.
  - Performance, last 28 days vs previous 28 days: clicks `6 vs 7` (-14.3%), impressions
    `257 vs 223` (+15.2%), CTR `2.3% vs 3.1%` (-0.8 pp), and average position `11.5 vs 13.3`
    (improved by 1.8 positions).
  - Performance, last 3 months vs previous 3 months: clicks `19 vs 13` (+46.2%), impressions
    `716 vs 276` (+159.4%), CTR `2.7% vs 4.7%` (-2.0 pp), and average position `13.7 vs 8.1`.
    The broader three-month query footprint added many low-volume, lower-ranking queries; the
    rolling 28-day position is improving.
  - Last-28-day pages: home `4 clicks / 34 impressions / position 2.9`; Huntsville
    `2 / 90 / 9.4`; Birmingham `0 / 52 / 12.5`; puppies `0 / 42 / 8.5`; locations
    `0 / 24 / 11.2`; dry-food article `0 / 32 / 17.1`. The dry-food article improved by 8.6
    positions; Birmingham improved by 2.5 positions despite fewer impressions.
  - Important queries: `french bulldogs for sale huntsville al` held position `8.9` with 15
    impressions; the exact-domain brand query fell from 34 to 13 impressions and position 5.7 to
    7.2; `english bulldogs for sale near me` improved from position 11 to 7.5; several new generic
    and nutrition queries appeared with small samples.
  - Page indexing increased from the previous 11 to 15 indexed URLs; 8 remain excluded (5
    intentional `noindex`, 3 crawled/not indexed). The three crawled/not-indexed examples are the
    high-carb article plus old Pearl and Duke puppy URLs. Pearl and Duke now correctly return 404;
    the updated high-carb article returns 200 and passed a live indexability test but remains
    outside the index.
  - Both new owner-education articles are indexed. Cullman and Decatur are not yet in the index
    immediately after deployment, but both passed live URL tests as available/indexable with valid
    breadcrumbs. No indexing request was submitted.
  - `/sitemap.xml` is successful, was read Aug 2, and reports 29 discovered pages. Core Web Vitals
    has insufficient 90-day field data for both mobile and desktop. Links reports 0 external and
    154 internal links.
  - Search Console reports 0 invalid breadcrumb items (9 valid), 0 invalid review snippets (1
    valid), 0 non-HTTPS URLs, no manual actions, and no security issues.
  - The owner account contains an `Exotic Bulldog Legacy` Business Profile at the Falkville
    address, but it is `Verification required`, `Not publicly visible`, and absent for an exact
    Maps brand search. Maps instead returns the unrelated `Legacy Exotic Bulldogs` profile.
  - GBP category (`Dog breeder`), business phone, SMS, and website are correct. Missing items are
    description, opening date, social profiles, service area, main hours, cover image, logo, and
    business photos. Confirm whether the Falkville address should be publicly displayed before
    starting verification.
- **Completed (Aug 2, 2026)**: Added the third post-audit local SEO package for Cullman and
  Decatur.
  - Deployed the complete three-part post-audit SEO package to Vercel production as deployment
    `dpl_14SFiEpCu9nfjKhoNzE8ZUpoYn7k`; `https://exoticbulldoglegacy.com` is aliased to the ready
    deployment.
  - Live verification returned HTTP 200 for the home, location hub, both new city pages, both new
    articles, `sitemap.xml`, and `robots.txt`; the missing-puppy regression URL returned a real HTTP 404. Cullman/Decatur canonicals and FAQ schema, both articles' `BlogPosting` schema, and every
    new sitemap URL were present in production.
  - Added indexable `/locations/cullman-al` and `/locations/decatur-al` pages with unique local
    intent, pickup/delivery guidance, nearby service areas, owner resources, and FAQs. The copy
    accurately describes Falkville as the operating location and does not imply storefronts in
    either city.
  - Expanded the Alabama location hub from two to four city pages, rewrote its metadata/H1/intro
    around statewide search intent, and added Cullman/Decatur links to the sitewide footer.
  - Statically generated every indexable city route with `dynamicParams = false` and published
    city-specific `FAQPage` structured data alongside the existing local-business schema.
  - Kept Madison within the Huntsville page and Falkville within the home/business entity rather
    than creating thin, overlapping city pages. Additional city expansion should wait for the next
    28-day Search Console comparison.
  - Browser verification covered the Alabama hub plus both new city pages; canonical URLs,
    headings, four-city navigation, FAQ schema, and responsive presentation were present with no
    browser-console errors.
  - Verification: targeted location/sitemap/footer tests passed (34/34); `npm run verify` passed
    documentation checks, lint, typecheck, Vitest (668 passed, 4 skipped), and Playwright (25
    passed, 2 skipped); `npx next build` passed with all four city routes statically generated.
- **Completed (Aug 2, 2026)**: Shipped the second post-audit article and internal-linking SEO
  package.
  - Rewrote the two July 21 article SEO titles/descriptions around clearer search intent and set
    truthful `updatedAt` timestamps; article headers, `BlogPosting.dateModified`, and local-post
    sitemap dates now use the revision date.
  - Corrected the public article date formatter from Russian to English for the English-language
    site.
  - Added natural, contextual links from both new articles to `/locations/huntsville-al`,
    `/locations/birmingham-al`, `/locations`, and relevant commercial/policy pages.
  - Added a reusable owner-resource section to both city pages, linking families back to the new
    owner guide, potty-training guide, and health/deposit policies.
  - Replaced unsafe certainty around brachycephalic airway surgery with veterinarian-led guidance
    and an authoritative American College of Veterinary Surgeons reference; also softened absolute
    claims around heat, swimming, skin-fold care, vaccination exposure, and bladder timelines.
  - Removed unnecessary client-component boundaries from all three custom local articles. The
    `/blog/[slug]` production route fell from 14.3 kB to 1.57 kB and First Load JS from 125 kB to
    112 kB.
  - Verification: targeted sitemap/article/location tests passed (16/16); `npm run verify` passed
    link checks, lint, typecheck, Vitest (648 passed, 4 skipped), and Playwright (25 passed, 2
    skipped); `npx next build` passed with all four article slugs statically generated.
- **Completed (Aug 2, 2026)**: Shipped the first post-audit technical SEO package.
  - Stabilized sitemap output: static and location URLs no longer claim a new `lastModified` value
    on every render; puppy, Sanity, and local-post URLs retain their real source dates.
  - Added `BlogPosting` and `BreadcrumbList` structured data to every article page, including
    canonical URLs, publisher/author identity, images, categories, and published/modified dates.
  - Projected Sanity `_updatedAt` into article data and added optional `updatedAt` support to the
    local-post registry.
  - Replaced the deleted `/images/tatiana-author.jpg` reference with the existing optimized
    `/images/tatiana-author.webp` asset.
  - Removed the puppy-detail streaming boundary that converted `notFound()` into a soft 404;
    missing puppy URLs now return a real HTTP 404. Added E2E regression coverage for the status.
  - Verification: targeted SEO tests passed (45/45); `npm run verify` passed link checks, lint,
    typecheck, Vitest (642 passed, 4 skipped), and Playwright (25 passed, 2 skipped). The production
    build passed and statically generated all four blog articles. Repository-wide Prettier remains
    blocked only by pre-existing untracked `.claude/settings.local.json` and `NewBlogPosts.md`; all
    files changed in this package were formatted.
- **Completed (Jul 21, 2026)**: Added a new blog category "Bulldog Owner School" with two local
  articles, fixing a single-article rendering bug in the process.
  - New `lib/blog/local-posts.ts` entries: `ultimate-guide-for-new-bulldog-owners` (featured,
    `category: 'Care'`, `categoryLabel: 'Bulldog Owner School'`) and `puppy-potty-training-101`
    (same category/label, not featured). Existing `dry-food-vs-raw-diet-bulldogs` entry changed
    from `featured: true` to `featured: false` so the featured hero slot is unambiguous.
  - Reused the existing `PostCategory` union value `'Care'` with a custom `categoryLabel` display
    override (same pattern as `Nutrition`/`'Bulldog Nutrition'`) instead of extending the
    Sanity-backed union type or the `blog-client.tsx` filter-chip array.
  - Fixed `app/(site)/(chrome)/blog/[slug]/page.tsx`: it previously hardcoded
    `<DryFoodVsRawDietBulldogs />` as the only local-post renderer regardless of slug. Replaced
    with a `LOCAL_POST_COMPONENTS: Record<string, ComponentType>` slug lookup so any number of
    local articles can be added going forward.
  - New components: `components/blog/ultimate-guide-for-new-bulldog-owners.tsx` and
    `components/blog/puppy-potty-training-101.tsx`, built in the same visual system as the
    nutrition article (philosophy/key-idea/warning callouts, checklist grids, horizontal/vertical
    flow diagrams with `ArrowRight`/`ArrowDown`). Cross-linked to each other and to
    `/blog/dry-food-vs-raw-diet-bulldogs`, `/puppies`, `/contact`, `/faq`.
  - Source photos moved from `public/images/BulldogsOnTheCouch.jpg` /
    `public/images/PuppyPupping.jpg` into `public/images/blog/ultimate-guide-for-new-bulldog-owners.jpg`
    and `public/images/blog/puppy-potty-training-101.jpg`; `.webp`/`.avif` variants were
    auto-generated by `npm run optimize-images` during `npm run build`.
  - Known pre-existing issue (not caused by this change, not fixed): `public/images/tatiana-author.jpg`
    is missing/deleted in the working tree, so the author avatar is broken on all blog article
    pages, old and new.
  - `npm run lint`, `npm run typecheck`, and `npm run test` (640 passed, 4 skipped) all passed.
    `npm run build` succeeded and statically generated both new slugs. Verified visually via
    Chrome browser automation: `/blog` listing (featured hero + category badges + card images),
    both new article pages end-to-end (hero, callouts, grids, flow diagrams, CTA, cross-links),
    and confirmed the original `dry-food-vs-raw-diet-bulldogs` article still renders correctly
    after the component-map refactor.
- **Completed (Jul 21, 2026)**: Marked Latte inactive, published Sachi and Sunny, and added a
  sire photo for Ace in live Supabase.
  - Updated live Supabase `puppies` record `2b1d183d-e764-4e82-9798-49020f7fa7a6` slug `latte`
    from `status='available'` to `status='sold'` (matches the pattern used for Cash/Gravy)
  - Inserted live Supabase `puppies` record `0e670613-451b-4025-8cba-c3f42b0a8f02` with slug
    `sachi`, `status='sold'` (listed unavailable by design), `price_usd=2700`, `sex='female'`,
    `breed='french_bulldog'`, `color='Lilac & Tan'`, no `birth_date`
    - Uploaded 3 gallery photos (`public/images/Sachi1-3.jpg`) and 1 dam photo
      (`public/images/Jessica.jpg`) to Supabase Storage bucket `puppies`
    - Dam: Jessica, 23 lb, Black & Tan. Sire: Ace (renamed from initial placeholder "Ice"), 30 lb,
      Cream — sire photo (`public/images/Ace.jpg`) uploaded and linked after the user flagged the
      missing image
  - Inserted live Supabase `puppies` record `937babe3-8165-45b4-9332-cecac31649e5` with slug
    `sunny`, `status='available'`, `price_usd=3000`, `birth_date='2026-06-22'`, `sex='female'`,
    `breed='french_bulldog'`, `color='Cream'`
    - Uploaded 3 gallery photos (`public/images/Sunny1-3.jpg`) to Supabase Storage bucket `puppies`
    - Reused the already-uploaded Jessica (dam) and Ace (sire) Storage photo URLs and lineage
      metadata from the Sachi record — same parents, same notes
  - Data-only Supabase updates; no application code changed. Did not rerun `npm run verify` for
    these changes (consistent with prior data-only puppy status/publish entries in this log)
- **Completed (Jul 10, 2026)**: Marked Cash inactive in live Supabase.
  - Updated live Supabase `puppies` record `5efc2019-e2e2-4b6d-ae2e-b5bf1a77164e` slug
    `cash` from `status='available'` to `status='sold'`
  - Kept `is_archived=false` so `/puppies/cash` remains public and indexable
  - Set `sold_at='2026-07-10T20:11:29.955722+00:00'`
  - Verified `/puppies/cash` returns `200`, title is `Cash | Exotic Bulldog Legacy`, visible
    page text includes `Unavailable`, reservation/deposit CTAs are absent, and no `noindex` is
    present
  - Did not rerun `npm run verify` for this data-only Supabase update; previous contact-number
    verification already passed earlier in the session
- **Completed (Jul 10, 2026)**: Split public contact phone usage into business and personal numbers.
  - Business phone is `+1 (772) 404-4470` / `+17724044470` for call, SMS, NAP, footer, email fallback, and schema
  - Personal phone is `+1 (772) 777-9442` / `+17727779442` for WhatsApp and Telegram-facing contact surfaces
  - Added `NEXT_PUBLIC_PERSONAL_PHONE` support while keeping `NEXT_PUBLIC_WHATSAPP` as the WhatsApp digits source/fallback
  - `npm run verify` passed docs sync, link check, lint, typecheck, and Vitest (`640` passed, `4` skipped), then failed at Playwright in sandbox with `listen EPERM`; elevated `npm run e2e` passed (`24` passed, `2` skipped)
- **Diagnostic Update (Jul 7, 2026)**: Vercel project is now linked through `npx vercel@latest`.
  - User authenticated successfully as `nepod77-3372`
  - Active Vercel team is `nepodymka-andriis-projects`
  - Repository is linked to `nepodymka-andriis-projects/dogs-website`
  - `.vercel/repo.json` still records project `dogs-website`
    (`prj_o2XKGn57o9GAQ1Yrj7tkaV24wf8i`) under org/team
    `team_b5KHgghutvTGJGMjKnW0ybMj`
  - `.env.local` now contains `VERCEL_OIDC_TOKEN`; `.env*` and `.vercel` are ignored by git
  - Global `vercel` command is now installed at
    `/Users/andriinepodymka/.nvm/versions/node/v20.19.5/bin/vercel`
  - Installed CLI version is `54.21.0`
  - `vercel whoami --token "$VERCEL_TOKEN"` cannot run inside this Codex process because
    `VERCEL_TOKEN` is not present in the process environment; plain `vercel whoami` exits
    successfully but does not print the username in this non-interactive command session
- **Diagnostic (Jul 7, 2026)**: Reviewed Stripe deposit amount override path.
  - Code default remains `DEFAULT_STRIPE_DEPOSIT_AMOUNT_CENTS = 30000` (`$300`) in
    `lib/payments/stripe-deposit.ts`
  - `$1` live-test checkout was enabled by setting server-only Vercel env
    `STRIPE_DEPOSIT_AMOUNT_CENTS=100`
  - To restore live Stripe checkout to `$300`, set Vercel env
    `STRIPE_DEPOSIT_AMOUNT_CENTS=30000` for the active environment(s), or remove the env override
    so code falls back to the default
  - Codex process cannot inspect/update Vercel env values directly because `VERCEL_TOKEN` is not
    present in its environment, though the global `vercel` CLI is installed
  - User screenshot confirms `STRIPE_DEPOSIT_AMOUNT_CENTS` exists only for `Production`; CLI
    updates for `preview` and `development` correctly fail with "not found"
  - User then updated `STRIPE_DEPOSIT_AMOUNT_CENTS` for `Production` via Vercel CLI and started
    `vercel deploy --prod`; the temporary Vercel deployment URL is protected by Vercel SSO, while
    the public production domain remains reachable
- **Diagnostic (Jul 7, 2026)**: Checked local Vercel CLI/project connection state.
  - Global `vercel` command is not available in the current shell PATH (`command not found`)
  - `npm exec vercel -- --version` produced no output within 60 seconds and was interrupted
  - Local `.vercel/repo.json` links this repository directory to Vercel project `dogs-website`
    (`prj_o2XKGn57o9GAQ1Yrj7tkaV24wf8i`) under org/team `team_b5KHgghutvTGJGMjKnW0ybMj`
  - Standard `.vercel/project.json` is not present; this appears to be repository/project
    metadata rather than a currently usable local CLI installation
- **Completed (Jul 6, 2026)**: Marked Gravy unavailable while keeping the profile public.
  - Updated live Supabase `puppies` record `29e43947-4049-42f4-9165-0c952a0d57f3` slug
    `gravy` from `status='available'` to `status='sold'`
  - Kept `is_archived=false` so `/puppies/gravy` remains public and indexable
  - Verified `/puppies/gravy` returns `200`, title is `Gravy | Exotic Bulldog Legacy`, visible
    page text includes `Unavailable`, and no `noindex` is present
  - `npm run verify` passed docs sync, link check, lint, typecheck, and Vitest (`640` passed,
    `4` skipped), then failed at Playwright in sandbox with `listen EPERM`; elevated
    `npm run e2e` passed (`24` passed, `2` skipped)
- **Completed (Jul 6, 2026)**: Published Dory as a live available puppy listing.
  - Inserted live Supabase `puppies` record `cf380769-0be0-437b-bede-98d24d6a09eb` with slug
    `dory`, `status='available'`, `price_usd=4000`, `birth_date='2026-05-10'`,
    `breed='french_bulldog'`, `sex='female'`, and `color='Dark Merle'`
  - Added all seven Dory photos from `public/images/Dory1.jpeg` through `Dory7.jpeg`
  - Uploaded the seven Dory JPEGs to Supabase Storage bucket `puppies` and updated `photo_urls`
    to the public Storage URLs so production can render photos immediately
  - Verified `/puppies/dory` returns `200`, title is `Dory | Exotic Bulldog Legacy`, no `noindex`
    is present, and the first Storage image returns `200 image/jpeg`
  - `npm run verify` passed docs sync, link check, lint, typecheck, and Vitest (`640` passed,
    `4` skipped), then failed at Playwright in sandbox with `listen EPERM`; elevated
    `npm run e2e` passed (`24` passed, `2` skipped)
- **Completed (Jul 6, 2026)**: Published Latte as a live available puppy listing.
  - Inserted live Supabase `puppies` record `2b1d183d-e764-4e82-9798-49020f7fa7a6` with slug
    `latte`, `status='available'`, `price_usd=6000`, `birth_date='2026-05-10'`,
    `breed='french_bulldog'`, `sex='female'`, and `color='Chocolate Merle'`
  - Added all five Latte photos from `public/images/Latte1.jpg` through `Latte5.jpg`
  - Uploaded the five Latte JPEGs to Supabase Storage bucket `puppies` and updated `photo_urls`
    to the public Storage URLs so production can render photos immediately
  - Verified `/puppies/latte` returns `200`, title is `Latte | Exotic Bulldog Legacy`, no
    `noindex` is present, and the first Storage image returns `200 image/jpeg`
  - `npm run verify` passed docs sync, link check, lint, typecheck, and Vitest (`640` passed,
    `4` skipped), then failed at Playwright in sandbox with `listen EPERM`; elevated
    `npm run e2e` passed (`24` passed, `2` skipped)
- **Completed (Jul 6, 2026)**: Published Cash as a live available puppy listing.
  - Inserted live Supabase `puppies` record `5efc2019-e2e2-4b6d-ae2e-b5bf1a77164e` with slug
    `cash`, `status='available'`, `price_usd=3000`, `birth_date='2026-05-10'`,
    `breed='french_bulldog'`, `sex='male'`, and `color='Rojo Merle'`
  - Added all five Cash photos from `public/images/Cash1.jpg` through `Cash5.jpg`
  - Uploaded the five Cash JPEGs to Supabase Storage bucket `puppies` and updated `photo_urls`
    to the public Storage URLs so production can render photos immediately
  - Verified `/puppies/cash` returns `200`, title is `Cash | Exotic Bulldog Legacy`, no
    `noindex` is present, and the first Storage image returns `200 image/jpeg`
  - `npm run verify` passed docs sync, link check, lint, typecheck, and Vitest (`640` passed,
    `4` skipped), then failed at Playwright in sandbox with `listen EPERM`; elevated
    `npm run e2e` passed (`24` passed, `2` skipped)
- **Completed (Jul 2, 2026)**: Added Vercel Web Analytics tracking.
  - Installed `@vercel/analytics@2.0.1`
  - Added `<Analytics />` from `@vercel/analytics/next` to the root `app/layout.tsx`
  - Kept existing consent-managed GA4/Meta Pixel analytics provider unchanged
  - `npm run verify` passed docs sync, link check, lint, typecheck, Vitest (`640` passed, `4` skipped), and Playwright (`24` passed, `2` skipped)
  - `npm run build` passed; the build image optimization step also regenerated several `.webp` assets
- **Diagnostic (Jul 6, 2026)**: Supabase MCP endpoint is reachable but not active in this Codex session.
  - `https://mcp.supabase.com/mcp` returns `401 Unauthorized` without a Bearer token, confirming the remote MCP service is online
  - Tool discovery exposes Context7, Google Drive, GitHub, Chrome DevTools, Playwright, and node REPL MCP tools, but no Supabase MCP namespace/tools
  - Supabase CLI `2.70.4` is installed and can list the linked `vsjsrbmcxryuodlqscnl / exotic-bulldog` project with network access
  - Local Supabase stack is not running because Docker daemon is unavailable
- **Config Update (Jul 6, 2026)**: Project Supabase MCP config now scopes the remote server to the live project in read-only mode.
  - `.codex/config.toml` uses `https://mcp.supabase.com/mcp?project_ref=vsjsrbmcxryuodlqscnl&read_only=true`
  - Added `bearer_token_env_var = "SUPABASE_ACCESS_TOKEN"` so the token stays outside the repository
  - User still needs to provide `SUPABASE_ACCESS_TOKEN` to the Codex process and restart Codex before Supabase MCP tools appear
- **Diagnostic (Jul 6, 2026)**: Rechecked Supabase MCP authorization in the current Codex session.
  - `.codex/config.toml` still contains the Supabase MCP server configuration with `bearer_token_env_var = "SUPABASE_ACCESS_TOKEN"`
  - Current shell environment reports `SUPABASE_ACCESS_TOKEN=missing` without exposing token contents
  - Tool discovery for `Supabase` returns `0` tools, so Supabase MCP is still not active in this running session
  - `npm run verify` passed docs sync, link check, lint, typecheck, and Vitest (`640` passed, `4` skipped), then failed at Playwright because the sandbox could not bind `0.0.0.0:3000` (`listen EPERM`)
- **Auth Note (Jul 6, 2026)**: Supabase CLI browser login cannot run inside this non-TTY Codex command session.
  - `npx supabase login` exits with `Cannot use automatic login flow inside non-TTY environments`
  - Use a browser-created Supabase access token via `SUPABASE_ACCESS_TOKEN` or `npx supabase login --token <token>`
- **Completed (Jul 2, 2026)**: Verified the live nutrition article SEO/indexing checklist and tightened internal linking.
  - Production checks passed for `/blog/dry-food-vs-raw-diet-bulldogs`, `/blog`, and `/sitemap.xml` (`200` responses)
  - Confirmed the live article has H1, title/meta description, canonical, loaded article image/alt, no `noindex`, `/blog` listing visibility, and sitemap inclusion
  - Added an explicit `/policies` CTA link inside the local nutrition article so the article links to `/puppies`, `/contact`, `/faq`, `/policies`, and `/locations`
  - Added regression coverage for the local article H1 and required internal links
  - `npm run verify` passed docs sync, link check, lint, typecheck, and Vitest (`640` passed, `4` skipped); Playwright initially failed in sandbox with `listen EPERM` on port 3000, an elevated e2e run had one `networkidle` timeout, then the isolated admin retry and full elevated `npm run e2e` passed (`24` passed, `2` skipped)
- **Completed (Jul 2, 2026)**: Replaced the local nutrition blog article image with the provided bulldog raw-food photo.
  - Target article: `/blog/dry-food-vs-raw-diet-bulldogs`
  - Replaced/regenerated `public/images/blog/dry-food-vs-raw-diet-bulldogs.jpg`, `.webp`, and `.avif`
  - Applied `PuppyHealt.md` checklist fixes: descriptive main image alt, `Bulldog Nutrition` article badge label, and JSX `<strong>` formatting instead of visible Markdown `**`
  - `npm run verify` passed through docs sync, link check, lint, typecheck, and Vitest (`639` passed, `4` skipped); Playwright initially failed in sandbox with `listen EPERM` on port 3000, then elevated e2e exposed stale `.next` ENOENT overlays; after clearing `.next`, elevated `npm run e2e` passed (`24` passed, `2` skipped)
  - Commit `06f8b39` pushed to `origin/main`
- **Completed (Jul 2, 2026)**: Coded manifesto blog post "Dry Food vs. Raw Diet for Bulldogs" directly in the codebase.
  - Custom React layout with two high-fidelity flowcharts (kibble cycle vs. raw diet benefits).
  - Responsive symptoms checklist grid and info callouts.
  - Merged local posts registry with Sanity CMS blog archive dynamically.
  - Dynamic integration in `/blog` list pages, related articles mapping, and `sitemap.ts`.
  - Typecheck, formatting, and linting checks verified successfully.
- **Completed (Jun 18, 2026)**: Crisp live chat is disabled by default.
  - `NEXT_PUBLIC_CRISP_ENABLED=false` prevents the loader and Crisp preconnect from rendering
  - The mobile `Let's Chat` action becomes a normal `/contact` link while chat is disabled
  - Re-enable by setting `NEXT_PUBLIC_CRISP_ENABLED=true` with a valid
    `NEXT_PUBLIC_CRISP_WEBSITE_ID`, then redeploy
  - Production build passed; generated HTML does not reference the Crisp script or preconnect
  - `npm run verify` passed (`639` Vitest tests, `4` skipped; `24` Playwright tests, `2` skipped)
  - Commit `32d6054` is deployed to `origin/main`
- **Completed (Jun 18, 2026)**: Restored sold puppy profiles as public, non-reservable listings.
  - Keep `status='sold'` as the database/payment status and display it publicly as
    `Unavailable`
  - Stop automatic archiving of sold puppies; reserve `is_archived` for intentional manual hiding
  - Supabase migration restored real sold profiles and kept the technical `test` record archived
  - Removed the daily auto-archive cron job and `archive_sold_puppies_after_30_days()` function
  - Keep sold profiles indexable, included in the main catalog and sitemap, with active listings
    sorted first
  - Historical prices, photos, lineage, and details remain visible; reservation actions stay blocked
  - `npm run verify` passed docs, links, lint, typecheck, and Vitest (`637 passed`, `4 skipped`);
    sandboxed Playwright could not bind port 3000, then elevated `npm run e2e` passed (`23 passed`,
    `3 skipped`)
  - Removed fake test puppies Duddy and CHARLIE from production, including 5 canceled test
    reservations, 3 unprocessed test webhook events, and 11 Storage objects
- **IN PROGRESS**: `NEXT_PUBLIC_PROMO_DISABLED=true` set in Vercel but promo modal still showing.
  - Debug logging added to `components/home/promo-gate.tsx` (commit `3baf367`, main)
  - Need to check browser console on production to diagnose root cause
  - Suspected cause: env variable not embedded in bundle (client component), or missing redeploy without build cache
  - **TODO**: Remove debug logs once issue is resolved
- **Recent Update (Jun 5, 2026)**: Local SEO/service-area copy corrections implemented.
  - Homepage pickup copy now says `near Falkville, just outside Cullman, Alabama` and no longer risks Montgomery/Falkville conflict
  - Homepage FAQ preview copy now uses `near Falkville, Alabama by appointment`
  - Birmingham location FAQ deposit copy is locked to `$300` and fake local testimonials are replaced by an honest `Birmingham Families` note linking to `/reviews` and `/contact`
  - `/locations` now explains the Falkville/Cullman base, North Alabama service area, $300 deposit flow, pickup/delivery process, and links to `/puppies`, `/contact`, `/faq`, and `/policies`
  - `/puppies` hero now includes Falkville/Cullman local context and links to `/locations`, `/faq`, and `/contact`
  - City location empty states now use city-specific wording for future availability, reservation timing, and pickup/delivery options
  - Targeted Vitest passed for homepage, `/locations`, `/locations/[slug]`, and `/puppies` page coverage
  - `npm run verify` passed docs sync, link check, lint, typecheck, and Vitest (`637 passed`, `4 skipped`), then failed at Playwright with `Process from config.webServer exited early`; user intentionally skipped rerunning the long e2e cycle
- **Recent Update (Jun 3, 2026)**: Added server-side reservation guard for live Stripe rollout.
  - New `RESERVATIONS_DISABLED` server env flag blocks payment checkout/order creation even if public UI is bypassed
  - `NEXT_PUBLIC_RESERVATIONS_DISABLED` still controls public UI and also participates in the server guard
  - Stripe checkout action now returns `RESERVATIONS_DISABLED` before puppy lookup or Stripe API calls
  - PayPal create-order and capture routes now return `503` before PayPal API calls while reservations are disabled
  - Added targeted regression coverage for the guard, Stripe checkout action, and PayPal routes
  - `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` passed
  - `npm run verify` passed through docs sync, link check, lint, typecheck, and Vitest; Playwright initially failed in sandbox with `listen EPERM` on port 3000, then `npm run e2e` passed with elevated permissions (24 passed, 2 skipped)
- **Recent Update (Jun 3, 2026)**: Added server-only Stripe deposit amount override for live payment testing.
  - New `STRIPE_DEPOSIT_AMOUNT_CENTS` env defaults to `30000` and can temporarily be set to `100` for a $1 live Stripe checkout
  - Config is server-only, validates positive integer cents, and enforces Stripe's USD minimum of 50 cents
  - Stripe Checkout line item and puppy detail Stripe deposit UI now use the same server-side amount
  - Webhook handlers were not changed; completed, failed, expired, and refunded events continue through existing handlers
  - `npm run format`, `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` passed
- **Recent Fix (Apr 27, 2026)**: Production content audit copy issues corrected in repo.
  - Birmingham location FAQ deposit normalized from `$500` to `$300`
  - Visible pickup wording normalized to `Falkville` on FAQ, policies, about CTA, and home FAQ preview copy
  - `/locations` intro now says `local logistics, delivery options, and city-specific FAQs.`
  - Added regression coverage for `/locations`, `/locations/birmingham-al`, and `/locations/huntsville-al`
  - Confirmed `/puppies` still renders the `Pickup & Delivery Options for Alabama Buyers` block on the production page path
- **Recent Fix (Apr 27, 2026)**: Homepage SEO metadata and global schema descriptions no longer reference Montgomery.
  - Homepage metadata description now says `appointment pickup in Falkville`
  - Shared `BUSINESS_PROFILE.description` now says `breeding program in Falkville, Alabama`
  - Organization and LocalBusiness JSON-LD inherit the corrected Falkville description from `BUSINESS_PROFILE`
  - Product schema fallback description in `lib/seo/structured-data.ts` also now uses Falkville for consistency
  - Confirmed local env address is already `Falkville, AL`, so global schema address on production should not fall back to the Montgomery default
- **SEO Fixes (Jun 14, 2026)**: Comprehensive SEO audit and fixes applied.
  - **Title duplication bug fixed** (10 files): page-level titles included "Exotic Bulldog Legacy" which the root layout template (`%s | Exotic Bulldog Legacy`) then appended again. Removed brand suffix from all page titles — `page.tsx`, `faq/page.tsx`, `blog/page.tsx`, `about/page.tsx`, `reviews/page.tsx`, `policies/page.tsx`, `contact/page.tsx`, `puppies/[slug]/page.tsx` (404 case), `puppies/[slug]/reserved/page.tsx`, `blog/[slug]/page.tsx`.
  - **FAQPage JSON-LD added to homepage**: `getFaqSchema(faqs)` now injected via `<JsonLd>` in `Home()` component so the 3 homepage FAQ items appear in Google rich snippets.
  - **postalCode fixed**: `DEFAULT_ADDRESS.postalCode` in `lib/config/business.ts` was `36117` (Montgomery) instead of `35622` (Falkville). Fixed fallback and corresponding test fixtures.
  - **Duplicate Organization schema removed**: `about/page.tsx` and `blog/page.tsx` were calling `getOrganizationSchema()` manually but root layout already injects it globally. Removed the redundant `<JsonLd>` calls and unused imports.
  - **OG image 404 fixed**: Default OG image was `/reviews/sarah-charlie.webp` (and related `/reviews/…` paths in `business.ts`, `structured-data.ts`, `images.ts`) but `public/reviews/` does not exist — actual files are under `public/images/reviews/`. Corrected all paths. Default OG image changed to `/images/home/hero/puppy-play.webp` (proper hero photo instead of customer review photo).
  - All test fixtures in `lib/seo/metadata.test.ts` and `lib/seo/structured-data.test.ts` updated to match corrected values.
  - Files changed: `lib/seo/metadata.ts`, `lib/utils/images.ts`, `lib/config/business.ts`, `lib/seo/structured-data.ts`, `app/(site)/(chrome)/page.tsx` (+8 page files), `lib/seo/metadata.test.ts`, `lib/seo/structured-data.test.ts`.
- **Recent Fix (Apr 27, 2026)**: Final stale source cleanup completed for `/locations` metadata and shared business fallback locality.
  - `/locations` metadata description now says `Browse Alabama service-area pages for pickup logistics, delivery options, and city-specific FAQs.`
  - Shared `DEFAULT_ADDRESS.addressLocality` in `lib/config/business.ts` now defaults to `Falkville`
  - Updated structured-data test fixtures to match the Falkville fallback address
- **Recent Feature**: `NEXT_PUBLIC_PROMO_DISABLED` env flag added (Feb 6, 2026) — commit `292bb0d` in main
- **Recent Optimization**: Lighthouse Mobile performance improvements (Feb 6, 2026) — PR #11 merged to main:
  - ✅ Localized transparenttextures.com texture (~300ms LCP improvement)
  - ✅ Removed 10 redundant PNG files (3.68MB freed from repository)
  - ✅ Updated TypeScript target ES2017 → ES2019 (~6-8KB bundle reduction)
- **Recent Fix**: Admin puppy status dropdown now correctly displays updated values after page refresh (Feb 1, 2026).
- **Recent Fix**: Critical Stripe webhook early return bug fixed (Jan 10, 2026).
- **Recent Enhancement**: "You may also love" section now shows only available puppies (Feb 1, 2026).
- **SEO Audit Finding (Mar 10, 2026)**: repository review does not show a global `noindex` tag in `app/layout.tsx`; default metadata explicitly sets `robots.index/follow=true`.
- **SEO Audit Finding (Mar 10, 2026)**: puppy detail pages only set `noIndex: true` when a requested puppy slug is missing, which suggests Search Console `Excluded by 'noindex'` could be caused by stale/invalid puppy URLs rather than a site-wide meta tag.
- **SEO Audit Finding (Mar 10, 2026)**: internal navigation and puppy cards already use `next/link`, so the current codebase does not match the `div onClick + router.push()` crawlability anti-pattern.
- **SEO Fix (Mar 10, 2026)**: added `/reviews` to `app/sitemap.ts` so the reviews page is explicitly advertised in the XML sitemap.
- **Verification (Mar 10, 2026)**: `npm run verify` passed docs sync, link checks, lint, typecheck, and Vitest suite; Playwright failed with `Process from config.webServer exited early`.
- **Verification (Apr 27, 2026)**:
  - `npm run lint` now passes after fixing the pre-existing unused props in `app/(site)/(chrome)/blog/[slug]/page.test.tsx`
  - `npm run typecheck` passed
  - `npm run build` passed after rerunning with network access because `/blog/[slug]` static generation fetches Sanity during page-data collection
  - SEO metadata/global schema cleanup also passed `npm run typecheck`, `npm run lint`, and `npm run build` (build required network-enabled rerun for Sanity-backed blog page data)
  - `/locations` metadata and shared fallback locality cleanup also passed `npm run typecheck`, `npm run lint`, and `npm run build` (build again required network-enabled rerun for Sanity-backed blog page data)
  - `npm run format` passes after reformatting `app/api/paypal/capture/route.test.ts`, `app/opengraph-image.tsx`, `ArticlePage.html`, `BlogPage.html`, and `lib/reservations/create.test.ts`
- **Infra**: Next.js 15, Tailwind v4, Supabase, Stripe/PayPal integration stable.
- **Reservations**: Added public and server-side disable flags for reservation UX and payment entrypoints (live Stripe rollout in progress).
- **Intro**: Added an env flag to skip the intro screen.
- **Promo**: Added an env flag to disable the promotional modal.

## Branch State (Jun 18, 2026)

| Branch | Latest commit | Notes                            |
| ------ | ------------- | -------------------------------- |
| `main` | `32d6054`     | Crisp disabled; synced to origin |

## Active Workstream

- Meta Conversions API integration added (Aug 3, 2026): consent-gated browser/server events now share `event_id` for deduplication. `PageView`, `ViewContent`, `Contact`, `Lead`, `InitiateCheckout`, and `reserve_click` (Aug 6, 2026) are wired up. `Purchase` is declared as a supported standard event but is **not yet fired anywhere** (client or webhook handlers) — deliberately deferred, see Aug 6, 2026 Current Status entry. The server token is never exposed to the browser; email/phone support is SHA-256 hashed before transmission.
- `/api/analytics/meta` endpoint accepts allowlisted standard events plus a small custom-event allowlist (currently just `reserve_click`) after the `exoticbulldoglegacy_consent=granted` cookie is present. Browser delivery uses `keepalive` so outbound WhatsApp/contact navigation does not silently drop the server copy.

- Debugging `NEXT_PUBLIC_PROMO_DISABLED` not taking effect on production.
- Pausing reservation UI via `NEXT_PUBLIC_RESERVATIONS_DISABLED` and server payment entrypoints via `RESERVATIONS_DISABLED`.
- Skipping intro screen via `NEXT_PUBLIC_INTRO_DISABLED`.
- Investigating Search Console SEO warnings around `noindex` exclusions and low internal-link counts.
- Sitemap completeness updated to include `/reviews`.
- Sold puppy visibility now uses status for availability and manual archive only for hiding.

## Risks & Issues

- **Promo debug code in main**: `components/home/promo-gate.tsx` has temporary console.log statements — must be removed after fix.
- **Docs Drift**: Manual updates to `llms.txt` and `CHANGELOG.md` required until automation is built.
- **Complexity**: Payment flows (atomic reservations + idempotency) are complex; rely on `REPORT_STRIPE_WEBHOOKS.md` for context.

## Next Steps

1. Deploy the Aug 6, 2026 Meta CAPI fix (see Current Status), confirm `NEXT_PUBLIC_META_PIXEL_ID` and `META_CONVERSION_API_TOKEN` are present in the Vercel Production environment, then verify Browser + Server event sources merge (not double-count) in Meta Events Manager → Test Events. Implementing a `Purchase` event (client + Stripe/PayPal webhook handlers) was deliberately deferred to a separate task.

1. Check browser console on production to see `[PromoGate]` log output.
1. Based on result:
   - If `undefined` → redeploy Vercel with cleared build cache, verify env var is set for Production environment.
   - If `true` but modal still shows → investigate `PromoModal` component for separate disable logic.
1. Remove debug `console.log` from `components/home/promo-gate.tsx` once fixed.
1. Sync `dev` with `main` after fix: `git checkout dev && git merge main && git push`.
1. Deploy server-side reservation guard, keep `NEXT_PUBLIC_RESERVATIONS_DISABLED=true` and `RESERVATIONS_DISABLED=true`, then switch both to `false` only when live Stripe webhook verification is confirmed. **Live Stripe webhook verification is now confirmed (Aug 4, 2026, see Current Status)** — flipping the kill switches off is a business decision for the user, not done automatically here.
1. Turn off intro in `.env.local` when ready to hide the splash screen.
1. Compare Search Console excluded puppy URLs against current sitemap output to confirm whether missing/retired puppy slugs are generating `noindex` pages.
1. Inspect live rendered HTML for `/puppies` and several puppy detail URLs to confirm Googlebot can see `<a href=\"/puppies/...\">` links in production source.
1. Resubmit updated sitemap in Google Search Console after deploy so `/reviews` is recrawled faster.
1. Confirm the Vercel deployment for `32d6054` completed and verify the Crisp bubble is absent in
   production.
1. Reconnect/authenticate the Supabase MCP integration in Codex, preferably scoped to
   `project_ref=vsjsrbmcxryuodlqscnl` and `read_only=true`, then restart the session and verify
   Supabase MCP tools appear in tool discovery.
