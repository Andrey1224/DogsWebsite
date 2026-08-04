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

## Recent Wins

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

## Known Debt

- **Manual Docs Sync**: `public/llms.txt` relies on `npm run docs:sync-llms`.
- **Automated E2E Coverage**: Browser checkout remains mocked in CI; the signed Stripe CLI sandbox
  flow is currently a documented manual verification rather than an automated CI job.
- **Analytics follow-ups**: see `docs/planning/ANALYTICS_BACKLOG.md` — re-sanitizing Meta CAPI
  `sourceUrl` server-side with a domain restriction, and strengthening the PII filter to catch
  substring-matched keys and nested objects.
