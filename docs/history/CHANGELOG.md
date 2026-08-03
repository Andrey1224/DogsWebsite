# Project Changelog

Unified timeline of features, optimizations, and bugfixes.

## [2026-08-02] GA4 & Meta Conversion Funnel

- **GA4 Page Views**: Restored automatic GA4 page-view collection after the root provider had
  disabled it without supplying a manual replacement.
- **Meta Pixel**: Aligned the application with the deployed `NEXT_PUBLIC_META_PIXEL_ID`, added
  SPA-aware `PageView` tracking, and kept all third-party analytics behind explicit consent.
- **Funnel Analytics**: Added standard `view_item`, `generate_lead`, and `begin_checkout` events,
  plus reservation and checkout-error diagnostics.
- **Meta Events**: Mapped site actions to the standard `ViewContent`, `Lead`, `Contact`, and
  `InitiateCheckout` events while retaining custom events where no standard event exists.
- **Attribution**: Forwarded GA4 client/session identifiers through Stripe metadata so the
  server-side `deposit_paid` event can be attributed to the originating browser session.
- **Privacy**: Removed unconditional analytics preconnects so Google and Meta are not contacted
  before the visitor grants analytics consent.

## [2026-08-02] Cullman & Decatur Local SEO Pages

- **Deployment**: Published the complete three-part post-audit SEO package to Vercel production
  and verified the primary domain, new pages, structured data, sitemap, robots file, and real 404
  behavior on the live site.
- **Local SEO**: Added unique, indexable Cullman and Decatur service-area pages with honest local
  pickup/delivery copy, nearby communities, owner resources, and city-specific FAQs.
- **SEO**: Expanded the Alabama service-area hub and sitewide footer from two to four city links.
- **Structured Data**: Added `FAQPage` schema to every city page.
- **Indexing**: City pages are now explicitly pre-rendered from the indexable location registry,
  with unknown location slugs disabled.
- **Strategy**: Avoided overlapping Madison and Falkville pages; further city expansion will be
  evaluated against the next 28-day Search Console data set.

## [2026-08-02] Article SEO, Safety, and Internal Linking

- **SEO**: Reworked metadata and modification dates for the two new owner-education articles.
- **SEO**: Added contextual article links to Huntsville, Birmingham, and Alabama service-area
  pages, plus reverse links from both city pages to the owner resources.
- **Content Safety**: Replaced absolute medical and puppy-development claims with cautious,
  veterinarian-led guidance and an authoritative ACVS airway reference.
- **Localization**: Public article dates now render in English instead of Russian.
- **Performance**: Converted static custom article bodies from client to server components,
  reducing `/blog/[slug]` First Load JS from 125 kB to 112 kB.

## [2026-08-02] Technical SEO Hardening

- **SEO**: Article pages now publish complete `BlogPosting` and breadcrumb structured data.
- **SEO**: Static and location sitemap entries no longer report artificial modification dates.
- **Indexing**: Missing puppy detail URLs now return a real HTTP 404 instead of a soft 404.
- **Content**: Repaired the blog author avatar by using the existing optimized WebP asset.
- **Testing**: Added sitemap, structured-data, article-page, and HTTP-status regression coverage.

## [2026-07-10] Split Business and Personal Contact Numbers

- **Content**: Business phone is now used for call, SMS, NAP/footer contact, email fallback, and
  structured data.
- **Content**: Personal phone is now used for WhatsApp and Telegram-facing contact surfaces.
- **Testing**: Added E2E assertions to keep call/SMS on the business number and WhatsApp on the
  personal number.

## [2026-07-02] Vercel Web Analytics

- **Analytics**: Added `@vercel/analytics` and rendered the official Next.js `<Analytics />`
  component from the root app layout so Vercel can collect visitors and page views.
- **Compatibility**: Existing consent-managed GA4/Meta Pixel tracking remains unchanged.

## [2026-07-02] Local Manifesto Blog Post & PortableText Polish

- **Feature**: Created local blog posts registry to allow custom-coded blog layouts.
- **Content**: Integrated the "Dry Food vs. Raw Diet for Bulldogs" manifesto article with premium responsive diagrams, symptom grids, and custom advice cards.
- **Beautification**: Polished global `BlogPortableText` renderer to render premium blockquotes with Quote icons, custom orange bullet lists, and glowing advice tip boxes.
- **Bugfix**: Fixed a blog-client grid rendering bug that caused other featured articles to vanish when multiple featured posts existed.
- **Integration**: Integrated local post dynamically with sitemaps, search filtering, page pre-rendering (`generateStaticParams`), and related articles mapping.

## [2026-06-18] Optional Crisp Live Chat

- **Performance**: Crisp is disabled by default and its preconnect/client script are not requested.
- **Configuration**: Set `NEXT_PUBLIC_CRISP_ENABLED=true` with a valid Website ID to restore chat.
- **UX**: The mobile chat CTA links to the contact page while live chat is disabled.

## [2026-06-18] Public Sold Puppy Profiles

- **Feature**: Sold puppies remain visible in the main catalog and on indexable detail pages.
- **UX**: Public status is displayed as `Unavailable`, while historical prices and media remain
  visible.
- **Database**: Removed the 30-day auto-archive job; `is_archived` now represents manual hiding
  only.
- **Cleanup**: Permanently removed fake Duddy and CHARLIE listings, their canceled test
  reservations, unprocessed webhook records, and uploaded test images.

## [2026-01-09] Automated Refunds & Admin Dashboard

- **Fix**: Reservations now auto-transition to `paid` immediately via webhook.
- **Feature**: Automated refund processing for Stripe and PayPal.
- **Feature**: Admin Reservations Dashboard with status filters and manual overrides.

## [2025-02-17] Test Coverage Initiative

- **Type**: 🧪 Testing
- **Impact**: Coverage increased from ~21% to **52.57%** lines.
- **Ref**: [Sprint 5 Report](./sprints/sprint-5-report.md)

## [2025-02-10] Reviews System MVP

- **Type**: 🚀 Feature
- **Context**: Sprint 4 / Features
- **Ref**: [Sprint 4 Report](./sprints/sprint-4-report.md)

## [2025-01-25] LCP Optimization & E2E Fixes

- **Type**: ⚡ Optimization
- **Impact**: LCP improved by 500ms–1.3s.
- **Ref**: [LCP Deep Dive](./archive/2025-01-25-lcp-optimization-e2e-fixes.md)

# Aug 3, 2026 — Meta Conversions API and event deduplication

- Added a consent-gated Meta Conversions API endpoint for standard website events.
- Added shared browser/server `event_id` values so Meta deduplicates Pixel and server copies.
- Added keepalive delivery for Contact and other navigation events.
- Restricted the public endpoint to an explicit event allowlist and kept the access token server-only.
- Added tests covering disabled credentials, SHA-256 normalization/hashing, deduplication IDs, and secret isolation.
