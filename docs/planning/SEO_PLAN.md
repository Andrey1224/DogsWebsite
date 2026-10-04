# SEO Plan and Progress Log

Last updated: 2026-09-19

Operational owner checklist: [Breeder SEO Checklist](../seo/BREEDER_SEO_CHECKLIST.md)

## Current SEO baseline

The original post-publish baseline uses complete Google Search Console data through September 6, 2026. A follow-up verification on September 13 uses complete data through September 11.

| Metric           | Jul 13–Aug 9 | Aug 10–Sep 6 |                                Change |
| ---------------- | -----------: | -----------: | ------------------------------------: |
| Clicks           |           11 |           15 |                                  +36% |
| Impressions      |          354 |          588 |                                  +66% |
| CTR              |         3.1% |         2.6% |                -0.5 percentage points |
| Average position |         14.0 |         22.6 | broader, lower-ranking query coverage |

There is no evidence of a sitewide penalty or technical SEO collapse. The visible peak and drop
were dominated by August 11, when the site received 132 impressions and no clicks; 107 impressions
came from /locations/cullman-al at an average position around 28. Excluding that day, the latest
period still had approximately 29% more impressions than the preceding period.

The technical post-publish baseline is healthy:

- The live sitemap contains 35 unique URLs.
- All six target blog posts appear once in the sitemap and blog listing.
- All six target articles are now indexed. Google crawled both September articles on September 8.
- No further Request Indexing action is required for either September article.
- Article HTTP status, title, description, canonical, OpenGraph, image alt text, BlogPosting
  schema, robots directives, and mobile readability passed production checks.

The next SEO gains should come from local authority, real customer trust, and targeted work on
pages that already receive relevant impressions—not another broad technical rewrite.

### Follow-up verification — September 13, 2026

Search Console data was complete through September 11, so the two September 8 articles had only
about three days of measurable post-publication data. No site or Search Console settings were
changed during the review.

| Metric           | Jul 18–Aug 14 | Aug 15–Sep 11 |                                Change |
| ---------------- | ------------: | ------------: | ------------------------------------: |
| Clicks           |            11 |            15 |                                  +36% |
| Impressions      |           537 |           501 |                                   -7% |
| CTR              |          2.0% |          3.0% |                 +1.0 percentage point |
| Average position |          18.0 |          23.5 | broader, lower-ranking query coverage |

The latest seven complete days (September 5–11) produced 167 impressions versus 102 in the
preceding seven days (+64%), while clicks changed from 5 to 2. CTR fell from 4.9% to 1.2% and
average position moved from 21.2 to 25.4. This is not evidence of a sitewide penalty: Google
expanded lower-ranking visibility, especially on US desktop searches and the Huntsville,
Cullman, Birmingham, Decatur, and main locations pages.

The article cluster produced 29 impressions in the latest seven days versus 15 in the preceding
seven days. The two new articles have the following early signals:

| Article                                   | Index status | Impressions | Average position |
| ----------------------------------------- | ------------ | ----------: | ---------------: |
| bringing-puppy-home-first-weeks           | Indexed      |           6 |             18.7 |
| choose-healthy-bulldog-puppy-health-tests | Indexed      |           5 |             10.2 |

For both new articles, URL Inspection confirmed:

- URL is on Google and Page is indexed.
- Sitemap discovery through https://exoticbulldoglegacy.com/sitemap.xml.
- Successful fetch by Googlebot Smartphone on September 8, 2026 at 2:47 PM.
- Crawling and indexing are allowed.
- User-declared and Google-selected canonical both resolve to the inspected URL.
- One valid Breadcrumbs item is detected.

Additional Search Console health checks:

- Sitemap: Success, last read September 11, 35 discovered URLs.
- Production sitemap contains all six articles exactly once; the local-over-Sanity deduplication
  remains effective.
- Breadcrumbs: 0 invalid, 13 valid. Review snippets: 0 invalid, 1 valid.
- HTTPS: 0 non-HTTPS URLs. Manual actions: none. Security issues: none.
- Core Web Vitals has insufficient field data for both mobile and desktop; this is not an error.
- The Page Indexing overview is stale (last updated September 3). Direct URL Inspection is the
  authoritative status for the September articles.

The only follow-up indexing candidate is `/terms`: it is currently reported as Discovered —
currently not indexed, but a September 13 live test confirmed that it is available to Google and
can be indexed. Request Indexing was not submitted. This is low priority because it is a legal
page, not a search landing page.

Nine unavailable puppy profiles are also listed as Discovered — currently not indexed. They are
linked from `/puppies` and included in the sitemap. Do not mass-submit them for indexing. Decide
later whether unavailable profiles should remain indexable portfolio pages or be consistently
removed from the sitemap and marked noindex.

### Follow-up verification — September 19, 2026

The latest seven available days show a positive quality shift but lower reach. Clicks increased
from 1 to 3, CTR improved from 0.6% to 2.5%, and average position improved from 27.5 to 8.3, while
impressions declined from 167 to 120. All three clicks came from commercial location pages:
Huntsville produced two and `/locations` produced one.

The rolling 28-day comparison remains slightly negative: 13 versus 15 clicks, 517 versus 570
impressions, 2.5% versus 2.6% CTR, and average position 20.7 versus 19.3. This is mixed, low-volume
data rather than evidence of a penalty. No broad code or metadata changes should be made before
the post-October 6 checkpoint.

Article signals for the latest 28 days:

- `dry-food-vs-raw-diet-bulldogs`: 2 clicks and 17 impressions versus 0 clicks and 10 impressions;
- `high-carb-commercial-dog-food-risks`: 48 impressions versus 72, with no clicks;
- `choose-healthy-bulldog-puppy-health-tests`: 12 new impressions;
- `bringing-puppy-home-first-weeks`: 8 new impressions;
- `puppy-potty-training-101`: 2 impressions versus 45;
- `ultimate-guide-for-new-bulldog-owners`: 1 impression versus 21.

Search Console health remains good. The sitemap was read on September 18, reports Success, and
contains 35 discovered URLs. The indexing report last updated September 13 and lists 25 indexed
and 14 not indexed URLs; the excluded group contains only old puppy profiles and `/terms`, not the
new articles. HTTPS reports 16 secure URLs and no critical issues. Manual Actions and Security
Issues both report no issues. Core Web Vitals still lacks sufficient field data, which is not an
error. No Search Console actions were submitted during this review.

Detailed snapshot: `SEO-GSC-report-2026-09-19.md`.

## Next actions

### P0 — owner and local-business work

- [ ] Confirm whether the Exotic Bulldog Legacy Google Business Profile is verified and publicly
      visible. Verification is in progress as of September 19, 2026; complete it before starting
      another broad SEO development task.
- [ ] Complete the Business Profile with accurate business category, service area, hours,
      description, website, phone, logo, cover image, and real business/puppy photos.
- [ ] Keep the same NAP identity across the website, Google Business Profile, Facebook, and any
      legitimate directories: Exotic Bulldog Legacy, the confirmed Falkville/service-area
      presentation, one primary phone number, and https://exoticbulldoglegacy.com/.
- [ ] Create a repeatable, non-incentivized review request process for real customers using the
      official Google review link or QR code. Reply to every genuine review.
- [ ] Earn 3–5 accurate local citations and a small number of genuine local or industry
      references. Do not buy bulk directory submissions or low-quality backlinks.

### P1 — Search Console checkpoints

#### September 22, 2026

- [x] Inspect /blog/bringing-puppy-home-first-weeks (completed early on September 13).
- [x] Inspect /blog/choose-healthy-bulldog-puppy-health-tests (completed early on September 13).
- [x] Record index status, sitemap detection, last crawl, Google-selected canonical, impressions,
      and early query data.
- [x] Confirm that repeated Request Indexing is not required.
- [x] Record the early trend checkpoint (completed September 19; see
      `SEO-GSC-report-2026-09-19.md`).
- [ ] Do not repeat technical URL Inspection unless an article disappears from performance or its
      index status changes.

#### After October 6, 2026

- [ ] Compare the latest 28 complete days with the preceding 28 complete days.
- [ ] Measure clicks, impressions, CTR, and average position for the whole property.
- [ ] Review local/commercial pages separately from article pages.
- [ ] Compare branded and non-branded queries.
- [ ] Use GA4 to measure organic users, puppy-page engagement, inquiries, and deposits; Search
      Console impressions are not unique visitors.
- [ ] Save the new dated snapshot beside the existing SEO reports.

### P1 — targeted page improvements after the October checkpoint

Do not change all pages simultaneously. Use the next complete data set to select one priority page
at a time.

1. Huntsville is the first commercial candidate. The latest 28-day snapshot had 103 impressions,
   2 clicks, and average position 14.8. If it remains worse than position 15 or receives no clicks
   despite at least 75 impressions, audit its title, snippet, opening copy, unique local value,
   available-puppy links, contact path, and internal anchors.
2. The /puppies page is the second candidate. The latest snapshot had 61 impressions, no clicks,
   and average position 15.3. Review search intent and snippet only if this persists for a complete
   28-day window.
3. Review Birmingham and Decatur when either page reaches at least 100 impressions while remaining
   worse than position 25. Strengthen real local information before changing metadata repeatedly.
4. Review a title and meta description when a page has at least 50 impressions, an average top-10
   position, and CTR below 2%.

Any location-page update must use confirmed, useful local information such as the real
pickup/delivery process, travel context from Falkville, video-call or visit procedure, available
puppies, and relevant FAQs. Do not create city pages that differ only by a city name.

### P2 — content development

- [ ] Let the two September articles accumulate indexing and query data before publishing a large
      new batch.
- [ ] Prioritize improvements to articles already showing traction:
  - dry-food-vs-raw-diet-bulldogs: 2 clicks and 17 impressions in the Sep 19 snapshot;
  - high-carb-commercial-dog-food-risks: 48 impressions but no clicks; wait for a complete
    window before testing its snippet;
  - puppy-potty-training-101 and ultimate-guide-for-new-bulldog-owners: recent impressions fell
    sharply, so monitor through the Oct 6 checkpoint before changing content.
- [ ] Publish new articles only when they answer a real buyer/owner question and add first-hand
      breeder experience, original photos, accurate authorship, trustworthy sources, and useful
      links to the next customer step.
- [ ] Maintain the completed article clusters and add contextual links when a genuinely related
      article or commercial page is published.

## Decision rules

Open a new code/content task when at least one of these conditions is met:

1. Sitewide impressions decline by more than 25% in two consecutive weekly comparisons and
   average position also worsens by more than three positions.
2. A high-intent page meets one of the page-specific thresholds above.
3. A future article is still not indexed 14 days after sitemap discovery and an initial indexing
   request.
4. Search Console reports a new canonical, robots, sitemap, structured-data, manual-action, or
   security problem.
5. GA4 shows organic traffic growing without corresponding inquiries, indicating a conversion
   experience problem rather than a ranking problem.

Do not react to one day, one week, or a change of only one or two clicks at the current traffic
volume.

## Work ownership

| Area                                                                 | Owner                           |
| -------------------------------------------------------------------- | ------------------------------- |
| Business Profile verification and factual business information       | Business owner                  |
| Genuine customer review requests and replies                         | Business owner                  |
| Local citations and real partnerships                                | Business owner with SEO support |
| Search Console checkpoints and trend reports                         | SEO review task                 |
| Metadata, page copy, internal links, schema, and analytics fixes     | Code agent after evidence       |
| Medical, legal, pricing, delivery, guarantee, and partnership claims | Owner approval required         |

## Completed work not to repeat

- Blog metadata, self-canonicals, OpenGraph article type, BlogPosting schema, image alt text, and
  mobile article spacing were corrected and verified.
- Nutrition, care, health, FAQ, and commercial internal links were added.
- Local-over-Sanity post deduplication is applied to sitemap, blog listing, static params, and
  related posts.
- The sitemap succeeds and contains each target article once.
- Repeated indexing requests are not required.
- Both September articles are indexed, self-canonical, sitemap-discovered, and already receiving
  impressions.

## Current report references

- [Google Search Console audit — Aug 19](../../Google-Search-Console-Audit-2026-08-19.md)
- [Live GSC trend report — Sep 9](../../SEO-GSC-report-2026-09-09.md)
- [Post-publish GSC verification — Sep 13](../../SEO-GSC-report-2026-09-13.md)
- [GSC trend and health check — Sep 19](../../SEO-GSC-report-2026-09-19.md)
- [Historical GSC and SEO audit — Sep 9](../../Exotic_Bulldog_Legacy_GSC_SEO_Audit_2026-09-09.md)

---

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
