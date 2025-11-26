# SEO Progress Log

Date: 2025-02-10

## Snapshot

- Focus: LCP/Speed Index on mobile, image weight, below-the-fold JS, Crisp loading, preconnects, schema/NAP completeness.
- Media hotspots addressed: hero/about already WebP/AVIF (hero ~205 KB); kept compression targets ≤400 KB.

## Task Tracker

- [x] Review audit + confirm heavy assets/SEO gaps.
- [x] Update home metadata/H1/H2 to emphasize available bulldog puppies, deposits, pickup/delivery.
- [x] Add visible NAP block (name, address, phone) aligned with LocalBusiness schema.
- [x] Wire/verify analytics env values (GA4/Meta Pixel) via existing `AnalyticsProvider`.
- [x] Optimize large images to WebP/AVIF and swap hero/spotlight sources to compressed variants.
- [x] Dynamic-import below-the-fold blocks (FAQ, Reviews), defer Crisp via idle + client-only loader.
- [x] Remove redundant hero preload; confirm preconnects (crisp, transparenttextures).
- [x] Re-run Lighthouse/PSI (mobile) after deploy refresh.

## Updates (2025-02-10)

- Dynamic imports: `FaqAccordion`, `FeaturedReviewsCarousel`, Crisp loader moved client-only; initial bundle trimmed by ~100–200 KB JS.
- Hero: kept `priority` `next/image` with `fill`/`sizes`; removed manual `<link rel="preload">` to rely on Next preload; blur placeholder intact.
- Preconnects verified: `client.crisp.chat`, `transparenttextures.com` in `<head>`.
- Performance (PageSpeed mobile): 84 → 90; LCP 4.1s → 3.3s; Speed Index 4.5s → 1.7s; TBT/CLS unchanged good; SEO 100.
- Analytics: GA4 + Meta Pixel live with consent gating; server-side GA4 still gated on `GA4_API_SECRET` if/when provided.
- SEO structure: title/H1/H2/CTA aligned to “bulldog puppies / available / deposit / pickup”; NAP + LocalBusiness/Organization/Product/FAQ JSON-LD intact.
- Images: WebP/AVIF compression maintained; no oversized assets on hero/about.

## Next (optional)

- Infra: add `GA4_API_SECRET`/`META_CONVERSION_API_TOKEN` when ready for server-side events; add SPF TXT in DNS (out of repo) for mail.
- Perf (nice-to-have): tune browserslist to drop legacy polyfills (~12 KB), consider AVIF everywhere and critical CSS only if chasing 95–98 score.
