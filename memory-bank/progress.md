# Project Progress

## Milestones

- [x] **Sprint 0-5**: Core platform, payments, admin, SEO, testing coverage (Completed Feb 2025).
- [x] **LCP Optimization**: Achieved ~500ms improvement (Jan 2025).
- [x] **Reviews MVP**: Public reviews with photo uploads (Feb 2025).
- [x] **Payment Enhancements**: Automated refunds, Admin Dashboard, Critical Stripe Fix (Jan 2026).
- [x] **Public Sold Puppy Profiles**: Keep sold listings viewable and indexable while blocking
      reservations (Jun 2026).
- [x] **Optional Crisp Chat**: Disable the unused third-party chat and prevent its client script
      from loading (Jun 2026).
- [x] **Payment Reliability & Pay Full**: Ship full-payment checkout, durable webhook failure
      handling, unified reservation integrity, safe refund/cancel release, and payment-safe expiry
      cron (Aug 2026).
- [ ] **AI Context Standards**: Memory Bank adoption & Docs Linting (In Progress).
- [x] **Meta Ads Launch Readiness**: Real `/privacy`+`/terms`, accurate reservation-process copy,
      softened marketing/medical claims, restructured puppy-detail CTAs, non-opt-in contact form
      (Aug 2026, on `dev`, not yet merged to `main`).

## Recent Wins

- Added two high-quality interactive "Bulldog Owner School" blog posts ("Bringing a Puppy Home" and "How to Choose a Healthy Bulldog Puppy") with integrated SEO metadata, robust local routing, and internal FAQ cross-linking.
- Fixed admin puppy status dropdown not reflecting database updates after page refresh.
- Fixed critical Stripe webhook bug preventing "paid" status updates.
- Consolidated fragmented history files into `docs/history/`.
- Established `docs/llms.txt` as the documentation source of truth.
- Replaced automatic sold-puppy archiving with explicit manual archive controls.
- Removed fake Duddy/CHARLIE listings and their test payment data and Storage assets.
- Disabled Crisp by default while retaining an environment-variable re-enable path.
- Published the local "Dry Food vs. Raw Diet for Bulldogs" manifesto article with custom
  responsive diagrams, checklist callouts, SEO metadata, sitemap integration, and the provided
  nutrition image.
- Added Vercel Web Analytics via `@vercel/analytics/next` in the root layout.
- Hardened Stripe and PayPal post-capture flows so failures are persisted and alerted, while
  reservation/puppy state transitions share one database integrity contract.
- Verified the payment contract against a production-derived local Supabase copy with real
  Postgres concurrency tests and signed Stripe test-mode webhooks, including full refunds and the
  second-payment/no-reservation failure path.
- Migrated Google Analytics 4 to Advanced Consent Mode v2, enabling cookieless pings prior to
  consent while maintaining strict blocking of Meta Pixel and Meta Conversions API until explicit
  Accept.
- Hardened the consent-managed analytics stack: removed the `navigator.webdriver` auto-Accept
  path (consent is now always user-driven), added a shared PII/URL sanitizer
  (`lib/analytics/safe-url.ts`, `lib/analytics/sensitive-params.ts`) used by GA4, Meta, and a new
  Vercel Analytics `beforeSend`, hardened `/api/analytics/meta` with a same-origin check and a
  `customData` allowlist, and added a `resetConsent()`-backed "Privacy settings" control in the
  footer (PR #15, merged to `main` as `500e6fc`).
- Verified the live Stripe integration end-to-end on the client's real account (Aug 4, 2026): two
  real $1 charges (deposit + pay-in-full) against disposable, archived-after test puppy records
  confirmed reservation creation, correct `paid`/`reserved`/`sold` state transitions, and delivery
  of both customer and real-owner (`mosss73@myyahoo.com`) emails. Also confirmed the Vercel
  production deployment already runs live Stripe keys and has its own independent live webhook
  endpoint — no production config changes were needed. See `memory-bank/activeContext.md`
  (Aug 4, 2026 entry) for the full writeup, including a race-condition gotcha when testing with
  `stripe listen --live` locally while production is also live.
- Fixed the Meta Pixel/Conversions API event-count mismatch Meta flagged in its own diagnostics
  (Aug 6, 2026): `reserve_click` now dedupes with a shared `event_id` between Browser Pixel and
  Server CAPI (previously browser-only), and server CAPI's Pixel ID resolution falls back to
  `META_PIXEL_ID` the same way the browser Pixel already did, closing a gap where a missing
  `NEXT_PUBLIC_META_PIXEL_ID` could silently no-op every CAPI call. Shipped via PR #16, merged to
  `main` as `e756861`, confirmed `READY` in production. See `memory-bank/activeContext.md`
  (Aug 6, 2026 entry) for the full root-cause writeup.
- Prepared the site for a Meta ads launch on Sunny/Dory (Aug 10, 2026, `dev` only): split
  `/policies` into real `/privacy`+`/terms`, rewrote the reservation-process copy sitewide to
  match the actual human-approval flow, softened unverified marketing/medical claims, restructured
  puppy-detail CTAs to lead with "Apply"/"Schedule a Video Call" ahead of the Stripe deposit step,
  and removed the contact form's implicit future-litters marketing opt-in. Confirmed the Meta
  Pixel's `localhost` "traffic permission settings" warning is expected domain-restriction
  behavior, not a blocker — production delivery was independently verified via Meta Test Events.
  See `memory-bank/activeContext.md` (Aug 10, 2026 entry) for the full writeup, the CI locator fix
  that followed, and the list of facts still needing the owner's confirmation before ad spend.

## Known Debt

- **Manual Docs Sync**: `public/llms.txt` relies on `npm run docs:sync-llms`.
- **Automated E2E Coverage**: Browser checkout remains mocked in CI; the signed Stripe CLI sandbox
  flow is currently a documented manual verification rather than an automated CI job.
- **Analytics follow-ups**: see `docs/planning/ANALYTICS_BACKLOG.md` — re-sanitizing Meta CAPI
  `sourceUrl` server-side with a domain restriction, and strengthening the PII filter to catch
  substring-matched keys and nested objects.
- **Meta `Purchase` event not implemented**: declared as a supported standard event in
  `lib/analytics/meta-conversions-api.ts`, but no client or webhook code path fires it yet.
  Deliberately deferred (Aug 6, 2026) since it would require touching the Stripe/PayPal webhook
  handlers — see `memory-bank/activeContext.md` (Aug 6, 2026 entry).
- **CI/CD follow-ups**: see `docs/planning/CICD_BACKLOG.md` — caching Playwright browser binaries
  and parallelizing lint/typecheck/unit-test jobs. (The two highest-value fixes — dropping
  `optimize-images` from CI's build step and deduping push/pull_request runs — already shipped in
  `13eae01`.)
- **Meta ads launch — facts still needing the owner's confirmation** (Aug 10, 2026 pass): real
  Telegram handle; whether the existing 12-month health guarantee scope in `/terms` is still
  accurate; exact balance-payment timing/method; Dory's `birth_date` and her missing
  `sire_name`/`dam_name` in Supabase; and `sire_health_notes`/`dam_health_notes = "Health tested"`
  on Sunny/Dory (needs exact replacement wording plus separate explicit permission before any
  production DB write). None of these are published as on-site placeholders. See
  `memory-bank/activeContext.md` (Aug 10, 2026 entry) for detail.
