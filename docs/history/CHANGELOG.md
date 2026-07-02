# Project Changelog

Unified timeline of features, optimizations, and bugfixes.

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
