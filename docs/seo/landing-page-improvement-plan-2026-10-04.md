# SEO Landing Page Improvement Plan

**Site:** Exotic Bulldog Legacy  
**Prepared:** October 4, 2026  
**Evidence window:** Google Search Console, July 3–October 2, 2026  
**Scope:** Planning only. No production copy, metadata, Search Console settings, or indexing state
was changed while preparing this document.

## Executive decision

The site does not need another broad technical SEO rewrite. Its technical foundation is healthy,
and the clearest near-term opportunity is to improve pages that Google already shows between
positions 11 and 25—especially `/puppies`, Birmingham, Cullman, and the nutrition cluster.

The plan is therefore:

1. Make `/puppies` satisfy the "available puppies in Alabama" intent immediately.
2. Improve Huntsville carefully because it is already close to page one.
3. Strengthen Birmingham and Cullman with unique, verifiable local information and real customer
   proof rather than templated city-name copy.
4. Reframe the two nutrition articles around the queries Google already associates with them,
   while fact-checking medical claims and avoiding exaggerated language.
5. Publish new articles only when their intent is not already covered. The next separate research
   project is `French Bulldog Colors & Genetics: What Buyers Should Know`.

This plan is based on current Search Console measurements, the actual production content, the
local article registry, and Google's published guidance—not on keyword-volume guesses.

## Evidence and interpretation rules

### Property baseline

| Metric           | July 3–October 2, 2026 |
| ---------------- | ---------------------: |
| Clicks           |                     45 |
| Impressions      |                  1,680 |
| CTR              |                   2.7% |
| Average position |                   16.8 |

Google defines CTR as clicks divided by impressions and specifically recommends reviewing low-CTR
pages, their titles/descriptions, and the queries that trigger them. Google also recommends
focusing on trends in clicks and impressions rather than reacting to average position alone.
See [Search Console performance guidance](https://support.google.com/webmasters/answer/17010961)
and [performance metric definitions](https://support.google.com/webmasters/answer/7576553).

The property is still low-volume. A movement of one or two clicks is not enough to prove that an
SEO change worked. Each implementation batch below must be evaluated over a complete 28-day
window, preferably after Google has recrawled the page.

The visible query rows do not add up to every page's impression total because Search Console
withholds some query-level data for privacy. Page totals are therefore the primary baseline;
visible queries are directional evidence for intent.

### Priority-page baseline

| Page                       | Clicks | Impressions |   CTR | Avg. position | Decision                                           |
| -------------------------- | -----: | ----------: | ----: | ------------: | -------------------------------------------------- |
| `/puppies`                 |      1 |         218 | 0.46% |          11.0 | Highest on-site opportunity                        |
| `/locations/huntsville-al` |      9 |         385 | 2.34% |          11.1 | Near page one; controlled changes only             |
| `/locations/birmingham-al` |      1 |         214 | 0.47% |          22.5 | Strengthen relevance and local proof               |
| `/locations/cullman-al`    |      2 |         219 | 0.91% |          24.9 | Strengthen internal prominence and local proof     |
| `/locations/decatur-al`    |      0 |          77 |    0% |          35.3 | Monitor; light support only for now                |
| High-Carb article          |      1 |         156 | 0.64% |          17.7 | Improve intent match and trust                     |
| Raw vs. Kibble article     |      2 |          63 | 3.17% |          13.2 | Preserve traction; improve accuracy and usefulness |
| Healthy Puppy Guide        |      2 |          22 | 9.09% |           7.5 | Leave stable                                       |

The homepage is already healthy at 20 clicks, 202 impressions, and position 6.7. It should not be
rewritten broadly. Its role in this plan is to pass clearer internal-link context to Cullman and
the primary puppies page.

## Why these changes are evidence-based

Google states that title links are a major element people use to decide whether to click. Titles
should be descriptive, concise, unique, and aligned with the visible main heading. Google may use
the `<title>`, H1, prominent page text, and link anchor text when generating a title link.
See [Google's title-link guidance](https://developers.google.com/search/docs/appearance/title-link).

Google primarily creates snippets from visible page content and may use the meta description when
it better summarizes the page. This is why the opening paragraph and meta description proposed
below must communicate the same specific value.
See [Google's snippet guidance](https://developers.google.com/search/docs/appearance/snippet).

Google recommends descriptive contextual internal links and says every important page should be
linked from at least one other relevant page. This plan therefore specifies both source pages and
anchor language rather than adding generic "Learn more" links.
See [Google's link best practices](https://developers.google.com/search/docs/crawling-indexing/links-crawlable).

For local visibility, Google says local results are mainly based on relevance, distance, and
prominence. Complete business information, genuine reviews, and links/references to the business
can contribute to prominence; there is no paid shortcut to better local ranking.
See [Google Business Profile local-ranking guidance](https://support.google.com/business/answer/7091).

Google also asks whether content demonstrates first-hand experience, contains original value,
clearly identifies who created it, and avoids exaggerated or shocking headings. Those principles
are especially important for breeder, health, nutrition, and genetics content.
See [Google's people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).

## Page plan: `/puppies`

> **Status (Oct 4, 2026): Batch 1 deployed to production and verified.** The restructured
> `/puppies` page (availability-first hierarchy, Nippet as the current available puppy, process
> block, FAQs, contextual links) is live on `exoticbulldoglegacy.com`. Production canonical, title,
> H1, meta description, and HTTPS were all confirmed correct; Breadcrumbs structured data is valid.
> The sitemap is `Success` and includes both `/puppies` and `/puppies/nippet`; `/puppies` is
> indexed in Google, its URL Inspection Live Test passed, and Request Indexing was submitted once
> on October 4, 2026. `/puppies/nippet` is already indexed (last crawl October 4, 2026, 8:28 PM).
> Do not resubmit the sitemap or request indexing again for this batch — only re-request if the
> page's content materially changes. See the "`/puppies` SEO restructure — Batch 1" entry in
> `memory-bank/activeContext.md` for the full implementation summary and verification results.

### Evidence

- 218 impressions, one click, 0.46% CTR, average position 11.0.
- Visible queries include `exotic bulldog puppy` (position 8.6), `english bulldog exotic`
  (10.7), `exotic bulldog breeder` (12.0), and local puppy queries at lower positions.
- The current `<title>` is `French & English Bulldog Puppies`.
- The current H1 emphasizes `current & past puppies`, although a searcher landing from a
  commercial query usually wants to know what is available now.
- Available, reserved, sold, and upcoming puppies currently share one grid when the default
  filter is `all`.

### Search intent to satisfy

`Available French and English Bulldog puppies in Alabama`, followed by trustworthy health,
availability, price, application, pickup, and delivery information.

### Recommended metadata and heading

**Proposed title**

```text
Available French & English Bulldog Puppies in Alabama
```

The root metadata template will append the brand automatically; do not add it manually.

**Proposed meta description**

```text
Browse available French and English Bulldog puppies in Alabama. View current profiles, health details, pricing, and Falkville-area pickup or delivery options.
```

**Proposed H1**

```text
Available French & English Bulldog Puppies in Alabama
```

### Content and layout changes

1. Put an `Available Now` section before every other puppy status.
2. Put `Upcoming Litters` second when records exist.
3. Move reserved and sold dogs into a clearly labeled `Past Puppies` or `Previously Placed`
   section below the commercial content. Sold profiles may remain public and indexable under the
   project's existing sold-puppy strategy; archived profiles must remain excluded.
4. Add a server-rendered availability summary immediately below the H1. It must reflect real data
   and must not promise inventory that does not exist.
5. Keep the current cards, pricing, status labels, and Product markup. Do not manufacture ratings,
   health claims, scarcity, or urgency.
6. Add a short visible process block after the available cards:

```text
How the process works
1. Review the current puppy profile and available records.
2. Contact us to ask questions and schedule a video call or visit.
3. After buyer approval and a signed contract, the deposit reserves the puppy.
4. Coordinate Falkville-area pickup or an approved delivery option.
```

7. Add four page-specific visible FAQs: current availability, what records come with a puppy,
   when the deposit is paid, and pickup/delivery. Reuse only verified policy language.
8. Make the primary CTA specific: `View available puppies` when available puppies exist and
   `Ask about upcoming litters` when none exist.

### Suggested opening copy

```text
Browse available French and English Bulldog puppies raised near Falkville, Alabama. Each current
profile shows the puppy's availability, photos, temperament notes, pricing when published, and
available health information. Families from Huntsville, Birmingham, Cullman, Decatur, and nearby
communities can arrange pickup by appointment or ask about approved delivery options.
```

### Internal links to add or strengthen

- Homepage → `/puppies`: `available French and English Bulldog puppies`.
- Cullman page → `/puppies`: `available Bulldog puppies near Cullman`.
- Birmingham page → `/puppies`: `current French and English Bulldog puppies`.
- Huntsville page → `/puppies`: `available Bulldog puppies for Huntsville families`.
- Future Cost article → `/puppies`: `current puppy profiles and published prices`.
- Future Color Genetics article → `/puppies`: `available French Bulldog puppies`.

### Acceptance criteria

- Available puppies are visible before sold/reserved puppies without requiring a filter change.
- One H1; unique title and description; self-canonical; no `noindex`.
- All status labels match database state.
- Every visible puppy card links to a 200-status detail page.
- Structured data continues to validate; no fake review or availability data.
- Mobile CTA and cards remain unobstructed by the contact bar.

### Measurement target

After at least 28 complete days and 150 impressions: CTR above 1.5% and average position entering
the top 10 are directional success targets. They are not guarantees.

## Page plan: Huntsville

### Evidence

- 385 impressions, nine clicks, 2.34% CTR, average position 11.1.
- `french bulldogs for sale huntsville al`: 45 impressions, position 8.8, no clicks.
- Additional visible intent includes `bulldog puppies near me`, `english bulldogs for sale near
me`, `frenchie puppies for sale near me`, and local pickup.
- The existing title already matches the target well: `French & English Bulldog Puppies Near
Huntsville, AL`.

### Decision

Do not replace the URL or broadly rewrite this page. It is the strongest location page and is near
page one. Keep the title for the first test; align the H1, opening copy, and snippet more tightly
with current availability and pickup intent.

### Proposed H1

```text
French & English Bulldog Puppies Near Huntsville, Alabama
```

Keep `Rocket City` in supporting copy rather than substituting it for the primary search language.

### Proposed meta description

```text
Browse available French and English Bulldog puppies near Huntsville, AL. Review current profiles, health records, Falkville-area pickup, and delivery options.
```

### Content changes

1. Replace generic claims about Huntsville families "trusting" the breeder unless supported by
   real Huntsville customer evidence.
2. Lead with verifiable facts: Falkville-area pickup, approximate drive time, appointments, current
   puppies, and available records.
3. Add a compact `Available for Huntsville families` block using the same live available-puppy
   query as the existing cards.
4. Add one genuine Huntsville/Madison-area customer story when available. Include the person's
   approved first name, city, puppy, and a link to the review source where appropriate.
5. Keep military scheduling language only if the business genuinely provides the described
   flexibility. Do not imply a Redstone Arsenal affiliation.
6. Add a contextual paragraph linking to the Healthy Puppy Guide and future Cost article.

### Measurement rule

Because this page already produces clicks, deploy Huntsville separately from the other city pages.
Compare 28 days before/after. Success means the exact Huntsville query remains top 10 while CTR
improves, or the page average moves from about 11 toward the first page without losing clicks.

## Page plan: Birmingham

> **Status (Oct 5, 2026): Batch 2B deployed to production, verified, and submitted for recrawl;
> post-change measurement pending.**
> Implemented per `docs/seo/tasks/birmingham-location-page-batch-2b-2026-10-05.md` (the final,
> owner-approved brief — its copy, FAQ, and internal links supersede the draft suggestions below).
> Replaced the unverified "families have been trusting" and "we ship nationwide" claims and the
> broad "health-tested puppies" language with qualified, verifiable copy; rewrote the FAQ to 5
> items (availability, distance, delivery, deposit, health information) with visible text generated
> from the same data as the `FAQPage` JSON-LD; added a "Before You Choose a Puppy" block with the 5
> required contextual links (`/puppies`, the health-test guide, `/reviews`, `/contact`, `/terms`);
> and added a per-location "Available Bulldog Puppies for Birmingham Families" section
> heading/intro (new optional `availableHeading`/`availableIntro` fields on `Location`, defaulting
> to the prior generic copy for Huntsville/Cullman/Decatur, which were not changed). The $300
> deposit figure was checked against `lib/payments/deposit.ts` (`DEFAULT_FIXED_DEPOSIT = 300`) and
> `/terms` and is consistent. See the "Birmingham Batch 2B" entry in `memory-bank/activeContext.md`
> for the full implementation summary, changed files, and test results. Implementation commit
> `2c19cb3` was merged through PR `#26` as merge commit `75014e1`. Production validation passed:
> HTTP 200, expected title/meta/H1/self-canonical/indexability, Nippet, internal links, five visible
> FAQs, matching `FAQPage` JSON-LD, and Breadcrumbs were confirmed. Search Console Live Test passed
> October 5 at 12:51 PM Central Time and Request Indexing was accepted once. Do not resubmit. Use
> October 6–November 2 as the first 28-complete-day measurement window and review it on or after
> November 3, 2026.

### Evidence

- 214 impressions, one click, 0.47% CTR, average position 22.5.
- `french bulldogs for sale birmingham al`: position 33.
- Other visible queries show stronger positions for generic `near me`, breeder, pickup, and Bulldog
  sale intent.
- The title is already descriptive, but the hero copy contains broad trust and health-testing
  statements that should be supported or softened.

### Recommended metadata and heading

Keep the existing title for the first batch:

```text
French & English Bulldog Puppies Near Birmingham, AL
```

**Proposed H1**

```text
French & English Bulldog Puppies Near Birmingham, Alabama
```

**Proposed meta description**

```text
Browse French and English Bulldog puppies available near Birmingham, Alabama. Compare current profiles and plan Falkville-area pickup or approved delivery.
```

### Suggested replacement hero copy

```text
Exotic Bulldog Legacy serves Birmingham-area families from our pickup area near Falkville,
Alabama. Browse current French and English Bulldog puppy profiles, review the available health and
reservation information, and contact us before planning pickup or delivery. Families in Hoover,
Homewood, Vestavia Hills, Mountain Brook, Pelham, and nearby communities can use the same
appointment process.
```

### Content changes

1. Add a clear Birmingham-to-Falkville planning block using verified travel information and a
   qualification that traffic and starting point affect travel time.
2. Keep airport/flight-nanny claims only when currently offered; confirm them with the owner before
   publication.
3. Add a genuine Birmingham-area review when one is available. The current placeholder should not
   be upgraded into invented social proof.
4. Put current available puppies before generic owner resources.
5. Add internal links from `/puppies`, `/locations`, the future Cost article, and one relevant
   owner guide. Use descriptive Birmingham anchors.
6. Keep the Birmingham FAQ specific to distance, current availability, appointment pickup,
   records, and the actual reservation sequence.

### Measurement target

After a full 28-day post-recrawl window and at least 150 impressions: improve average position by
five or more places and CTR above 1.25%. Review query mix before making a second title change.

## Page plan: Cullman

### Evidence

- 219 impressions, two clicks, 0.91% CTR, average position 24.9.
- This is the nearest major location page to the Falkville pickup area.
- The page already has the strongest factual local copy of the city pages: approximate mileage,
  drive time, no-public-storefront clarification, I-65 context, nearby communities, and pickup
  preparation.
- The homepage highlights Birmingham and Huntsville but does not give Cullman an equivalent
  destination card.

### Decision

The next improvement should not be a longer block of generic Cullman keywords. The page needs
stronger internal prominence and genuine local proof.

### Metadata

Keep the current title and H1 during the first test:

```text
Bulldog Puppies Near Cullman, Alabama
French & English Bulldog Puppies Near Cullman, Alabama
```

The current meta description is also already aligned with the page. Avoid changing all three
signals without evidence.

### Content and authority changes

1. Add a homepage/service-area card for Cullman with the anchor `Bulldog puppies near Cullman`.
2. Add a direct Cullman link in the pickup section of `/puppies`.
3. Link Falkville/Cullman context from the About page where naturally relevant.
4. Add one real Cullman County customer review or puppy-home story when available.
5. Complete and verify the Google Business Profile using the same business name, phone, website,
   and accurate service-area/address presentation used on the site.
6. Obtain a small number of genuine, accurate local/industry references rather than bulk directory
   links. Examples may include a real veterinary relationship, local chamber/community listing,
   breeder organization, or event—only when the relationship actually exists.
7. Keep the no-public-storefront clarification. Do not imply that the business has a walk-in
   Cullman location.

### Measurement target

Evaluate internal-link and GBP/local-proof work over at least 6–8 weeks. A five-position
improvement or sustained CTR above 1.5% at similar impression volume is a useful early signal.

## Page plan: Decatur

### Evidence and decision

Decatur has 77 impressions, no clicks, and average position 35.3. Query-level evidence is still
too sparse for a dedicated rewrite.

For now:

- add one descriptive link from `/locations` and, where appropriate, Huntsville-area content;
- keep the existing accurate Falkville/Decatur travel and pickup information;
- do not create another Decatur article;
- reassess after the page reaches 100–150 impressions or receives a clear non-branded query
  cluster.

## Article plan: High-Carb Commercial Dog Food Risks

### Evidence

- 156 impressions, one click, 0.64% CTR, average position 17.7.
- Visible queries include `high carb dog food` (20.8), `high carb foods for dogs` (40.6), `are
carbs bad for dogs` (44.0), `good carbohydrates for dogs` (11.0), and `dog food low in
carbohydrates` (15.0).
- The current article contains health statements that must be checked against reliable veterinary
  or peer-reviewed sources before optimizing them for wider visibility.

### Proposed SEO title

```text
Are Carbs Bad for Dogs? High-Carb Dog Food Risks
```

### Proposed meta description

```text
Are carbohydrates bad for dogs? Learn what carbs do, when a high-carb diet may be a concern, how to read a dog-food label, and what to discuss with your vet.
```

### Required content changes

1. Add a cautious 40–60 word direct answer near the top. Do not claim that every carbohydrate or
   every commercial diet harms dogs.
2. Define carbohydrate sources and distinguish ingredient type, overall calories, processing,
   individual intolerance, and complete-and-balanced nutrition.
3. Fact-check claims about grains, allergies, yeast, blood sugar, microbiome, and obesity. Remove
   or qualify statements that exceed the supporting evidence.
4. Cite primary research, veterinary organizations, or veterinary nutrition specialists.
5. Add visible FAQs based on current queries:
   - Are carbohydrates bad for every dog?
   - What are common carbohydrate sources in dog food?
   - How can I compare carbohydrate-heavy foods?
   - When should I speak with my veterinarian?
6. Link to Raw vs. Kibble and the future practical Feeding Schedule article without presenting
   breeder opinion as individualized veterinary advice.

### Measurement target

After at least 100 new impressions: CTR above 1.5% and movement toward position 15. Also monitor
whether the page begins matching the intended carbohydrate queries rather than unrelated terms.

## Article plan: Raw vs. Kibble for Bulldogs

### Evidence

- 63 impressions, two clicks, 3.17% CTR, average position 13.2.
- Visible queries include `raw food diet for bulldogs`, `bulldog raw diet`, `what does a bulldog
eat`, and `best dry food for bulldogs`.
- The article already has better CTR than the site average. Preserve its URL and existing internal
  links.
- The current H1 uses the absolute phrase `How Industrial Kibble Destroys the Bulldog Microbiome`,
  which is stronger than the evidence and conflicts with Google's recommendation to avoid
  exaggerated or shocking titles.

### Proposed H1/title direction

```text
Raw vs. Kibble for Bulldogs: Benefits, Risks & Questions to Ask Your Vet
```

### Required content changes

1. Replace absolute anti-kibble claims with a balanced comparison of nutritional adequacy,
   preparation, contamination risk, convenience, cost, and veterinary considerations.
2. Add a comparison table that helps a real owner make a decision rather than declaring one diet
   universally correct.
3. Clearly separate the breeder's first-hand feeding experience from general medical guidance.
4. Add accurate authorship/reviewer information. Do not invent veterinary review credentials.
5. Link to the future Feeding Schedule article for portions and meal timing instead of expanding
   this page into a second all-purpose feeding guide.
6. Preserve the page's existing links to Puppies, FAQ, Terms, Locations, and High-Carb Risks.

### Measurement rule

This page already earns clicks. Make the accuracy/trust update as one isolated release and monitor
for 28 days. Do not change its URL.

## Pages to leave stable

### Healthy Puppy Guide

Position 7.5 and CTR about 9% are healthy early signals. Do not split its `Questions to Ask Before
Choosing a Bulldog Puppy` section into a competing standalone article. When the Color Genetics
article is published, add one contextual link from the DNA-testing section.

### Homepage

Position 6.7 and CTR near 10% do not justify a broad rewrite. Only add the Cullman service-area
link/card and ensure the current available puppy remains easy to reach.

### French vs. English Bulldog

This page was published October 4 and has not had a fair measurement window. Do not revise it
based on immediate GSC absence. Inspect it after Google has crawled/indexed it and then allow at
least 28 days of performance data.

## Internal-link map

| Source                | Destination             | Recommended anchor/context                     |
| --------------------- | ----------------------- | ---------------------------------------------- |
| Homepage              | Cullman                 | `Bulldog puppies near Cullman`                 |
| Homepage              | Puppies                 | `available French and English Bulldog puppies` |
| Puppies               | Cullman                 | `Cullman pickup details`                       |
| Puppies               | Birmingham              | `Birmingham pickup and delivery`               |
| Puppies               | Huntsville              | `Huntsville pickup and delivery`               |
| Huntsville            | Healthy Puppy Guide     | `how to review Bulldog health tests`           |
| Birmingham            | Healthy Puppy Guide     | `DNA tests and veterinary checks`              |
| High-Carb             | Raw vs. Kibble          | `compare raw food and kibble for Bulldogs`     |
| Raw vs. Kibble        | Future Feeding Schedule | `Bulldog puppy feeding schedule`               |
| Healthy Puppy Guide   | Future Color Genetics   | `French Bulldog color genetics`                |
| Future Color Genetics | Puppies                 | `current French Bulldog puppies`               |

Anchors should remain natural and must not be repeated mechanically across every page.

## Owner facts required before implementation

The code agent must not guess or copy competitor claims. Confirm the following with the owner:

- which health records are supplied for each litter and puppy;
- which parent tests are available and how they vary by breeding pair;
- whether flight-nanny and ground-delivery services are currently offered;
- actual pickup workflow and when the private address is disclosed;
- current deposit amount and sequence;
- approved first name/city/text for any local testimonial;
- any real veterinary, club, community, or local-business relationships;
- pricing language used in the future Cost article;
- named author and any qualified medical reviewer for nutrition/genetics content.

## Implementation sequence

### Batch 0 — Baseline and owner confirmation

- Save the GSC page/query baselines in a dated report.
- Confirm the owner facts listed above.
- Capture current live title, snippet, H1, canonical, structured data, and screenshots for each
  target page.

### Batch 1 — `/puppies`

- Implement availability-first hierarchy, title/H1/meta, process block, contextual links, and
  page-specific FAQs.
- Run unit, accessibility, E2E, sitemap, structured-data, and production build checks.
- Deploy alone and record the deployment date.

### Batch 2 — Location pages

- Huntsville: controlled H1/opening/meta test; implemented and deployed October 5, 2026.
- Birmingham: rewritten hero and strengthened local pickup context; deployed and submitted for
  recrawl October 5, 2026.
- **Next implementation step — Batch 2C, Cullman:** strengthen internal prominence from the
  homepage, `/puppies`, `/locations`, and About; preserve the existing URL/title/H1 during the
  first test; add genuine local proof only when available. Prepare a separate evidence-based brief
  before changing code.
- Decatur: internal-link support only unless more data arrives.

### Batch 3 — Nutrition trust and intent

- Fact-check and revise High-Carb.
- Reframe Raw vs. Kibble without changing its URL.
- Add author/reviewer/source presentation appropriate to health-related content.

### Batch 4 — New content

- Research and write `French Bulldog Colors & Genetics: What Buyers Should Know` as a separate
  project.
- After that, consider the non-overlapping article queue: practical Bulldog puppy feeding
  schedule, crate training, Bulldog puppy cost in Alabama, and safe pre-vaccination socialization.

## Release and Search Console procedure

For each batch:

1. Validate the production page and sitemap after deployment.
2. Use URL Inspection and run one Live Test.
3. Request indexing once only when the page is new or materially changed and the live test passes.
4. Do not repeatedly submit the sitemap or indexing request.
5. Record the deployment and crawl dates.
6. Compare the next complete 28 days with the preceding 28 days.

Evaluate clicks, impressions, CTR, query relevance, and inquiry actions together. Search Console
impressions are not unique visitors, and ranking improvement without more qualified inquiries may
indicate a conversion problem rather than another SEO problem.

## Definition of done

- Every proposed claim is verified by the owner or a reliable source.
- Each page has one clear intent, one H1, unique metadata, self-canonical, indexable robots, useful
  visible content, and descriptive internal links.
- Local pages contain genuinely different local value, not city-name substitution.
- Available puppy data is accurate and generated from the live database.
- No fake testimonials, affiliations, health testing, guarantees, scarcity, or delivery claims.
- Medical/nutrition/genetics content uses reliable sources and separates experience from medical
  advice.
- Tests and production validation pass.
- Deployment date and GSC follow-up date are recorded in the SEO plan.

## Next research project: French Bulldog Color Genetics

Do not draft this article from competitor summaries. The research phase should prioritize:

- French Bull Dog Club of America color guidance and breed standard;
- AKC breed-standard terminology;
- UC Davis Veterinary Genetics Laboratory explanations of coat-color loci/tests;
- peer-reviewed evidence for specific health associations, with careful distinction between a
  color gene, a linked condition, and general French Bulldog health risk;
- the breeder's own documented experience and original photographs;
- buyer questions shown in Google, including standard versus rare colors, whether color determines
  health, what a color panel can prove, and which health tests are separate from color testing.

The intended original format is a visual `coat-color decoder`: begin with a fictional buyer looking
at a color label, then walk through what the label says, what DNA can confirm, what it cannot
confirm, and which documents matter more than the marketing name. Include myth-versus-fact cards,
a simple locus glossary, a buyer checklist, and a final `health before color` decision path. Exact
claims and design should be finalized only after the source audit.
