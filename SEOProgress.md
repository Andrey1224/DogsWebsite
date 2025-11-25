# SEO Progress Log

Date: 2025-02-04

## Snapshot

- Audit focus: page weight (images), titles/H1 keywords for "bulldog puppies"/"available", local NAP visibility, analytics/pixel wiring, inline styles/iframes, backlinks/social.
- Media hotspots addressed: hero/about originals were multi-MB; converted to WebP/AVIF (hero ~205KB, about spotlights ~218KB/~96KB).

## Task Tracker

- [x] Review audit + identify heavy assets and SEO gaps.
- [x] Update home metadata/H1/H2 to emphasize available bulldog puppies, deposits, pickup/delivery.
- [x] Add visible NAP block (name, address, phone) aligned with LocalBusiness schema.
- [x] Wire/verify analytics env values (GA4/Meta Pixel) via existing `AnalyticsProvider`.
- [x] Optimize large images to WebP/AVIF and swap hero/spotlight sources to compressed variants.
- [x] Re-run quick manual checks (lint clean; awaiting Lighthouse/PSI after deploy/refresh).

## Updates (2025-02-04)

- Home page: metadata title/description now emphasize bulldog puppies in Alabama, deposit/pickup options; added logistics section (deposit + pickup/delivery) with keyworded H2 and CTAs; FAQ headline mentions deposit/pickup.
- Footer: map overlay now shows name + city/state (keeps street private for visitors) with tel link; LocalBusiness schema still uses full address from env for SEO.
- Images: ran `npm run optimize-images`; swapped hero image to `/hero/french-bulldog-hero.webp`; about spotlights now use compressed `.webp` versions.
- Analytics: set `NEXT_PUBLIC_GA_MEASUREMENT_ID` and `META_PIXEL_ID` in `.env.local`; activation via consent + `AnalyticsProvider`.
- Logistics copy now notes you can schedule a visit/video call before placing a deposit.
- Next: optional PSI/Lighthouse run against deployed build once updated; verify map pin reflects Falkville coordinates.
