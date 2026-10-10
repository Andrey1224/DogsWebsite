# Batch 2B — Birmingham Location Page SEO Brief

**Site:** Exotic Bulldog Legacy  
**Target URL:** `https://exoticbulldoglegacy.com/locations/birmingham-al`  
**Prepared:** October 5, 2026  
**Status:** Deployed and production-verified on October 5, 2026; awaiting post-change measurement
**Scope:** Birmingham page only. Do not change Huntsville, Cullman, or Decatur in this batch.

## Objective

Improve the existing Birmingham landing page for people searching for French and English Bulldog
puppies near Birmingham, Alabama. The page should answer the commercial questions immediately:
what puppies are currently available, where pickup happens, which delivery options may be
available, what information is shown in each puppy profile, and how to contact the breeder.

This is an evidence-based SEO test, not a guaranteed ranking change. Preserve the URL and measure
the page after deployment against the baseline below.

## Pre-change Search Console baseline

Evidence window: July 3–October 2, 2026.

| Metric                                   |                  Baseline |
| ---------------------------------------- | ------------------------: |
| Clicks                                   |                         1 |
| Impressions                              |                       214 |
| CTR                                      |                     0.47% |
| Average position                         |                      22.5 |
| `french bulldogs for sale birmingham al` | approximately position 33 |

Record the deployment and recrawl dates before starting the post-change measurement window.

## Production and Search Console record

- Implementation commit: `2c19cb3`
- PR: `#26` (`dev` → `main`)
- Merge commit: `75014e1`
- Production deployment and verification: October 5, 2026
- Production result: PASS — HTTP 200; expected title, meta description, H1, self-canonical,
  indexable robots state, current Nippet card, contextual links, five visible FAQs, matching
  `FAQPage` JSON-LD, and valid Breadcrumbs were confirmed.
- Sitemap: the live `sitemap.xml` is reachable and contains
  `/locations/birmingham-al`.
- Existing Google index status: URL is on Google; the index view still reflected the previous
  crawl from August 5, 2026 at the time of verification.
- Search Console Live Test: PASS on October 5, 2026 at 12:51 PM Central Time; URL available to
  Google, page can be indexed, and one valid Breadcrumbs item detected.
- Request Indexing: submitted once and accepted on October 5, 2026. Do not resubmit for this
  release.
- Search Console displayed a temporary sitemap-processing message in the historical URL-inspection
  details. The live sitemap itself remained available and contained the URL, so this was not a
  deployment blocker.

Measurement should use the next 28 complete days after deployment (October 6–November 2, 2026).
Review the first complete comparison on or after November 3, 2026. Do not change Birmingham again
during that window unless a material technical, legal, inventory, or business-information error is
found.

## Target search intent

Use these phrases naturally where they help a visitor understand the page. Do not create a keyword
list on the live page and do not repeat them mechanically.

- French Bulldog puppies near Birmingham, AL
- English Bulldog puppies near Birmingham
- Bulldog puppies for sale near Birmingham
- Bulldog breeder near Birmingham
- available Bulldog puppies
- Birmingham puppy pickup and delivery
- Bulldog puppies near Hoover, Homewood, Vestavia Hills, Mountain Brook, Pelham, and Trussville

## Content principles

- Keep the breeder's warm, confident voice. The copy may be persuasive and distinctive.
- Approximate travel language is acceptable when clearly qualified by starting point, route, and
  traffic.
- Do not invent inventory, testimonials, affiliations, parent health-test results, guarantees, or
  unconditional delivery availability.
- Exact deposit amounts, payment sequence, contract terms, and health-guarantee language must stay
  consistent with the current application, Terms page, and reservation configuration.
- Breeder experience may be presented as breeder experience. Do not convert opinion into a
  universal veterinary or medical conclusion.

## Metadata and primary heading

Preserve the URL and self-canonical:

```text
/locations/birmingham-al
```

Keep the current title for this test:

```text
French & English Bulldog Puppies Near Birmingham, AL
```

Use this H1:

```text
French & English Bulldog Puppies Near Birmingham, Alabama
```

Use this meta description:

```text
Browse French and English Bulldog puppies available near Birmingham, Alabama. View current profiles and plan Falkville-area pickup, ground transport, or approved delivery.
```

## Hero copy

Replace the current hero paragraph with:

```text
Looking for a French or English Bulldog puppy near Birmingham? Exotic Bulldog Legacy is based near Falkville, Alabama, roughly an hour from much of the Birmingham metro depending on your starting point and traffic. Browse current puppy profiles, pricing, temperament notes, and available health information, then contact us to arrange pickup by appointment or discuss delivery options.
```

Keep the visible nearby-area context for:

- Hoover
- Homewood
- Vestavia Hills
- Mountain Brook
- Pelham
- Trussville

Remove or rewrite these existing statements:

- `Metro Birmingham families have been trusting Exotic Bulldog Legacy` — do not imply established
  Birmingham social proof without an approved real review.
- Broad `health-tested puppies` language — describe the records available for the specific puppy
  or breeding pair instead of implying an identical panel for every dog.
- `We ship nationwide` — retain only if a current business policy explicitly confirms nationwide
  service. Otherwise describe ground transport and flight nanny delivery as options that may be
  arranged.

## Available-puppy section

Reuse the shared real-data implementation:

```ts
getFilteredPuppies({ status: 'available' });
```

Requirements:

- Render only puppies returned by the available-only query.
- At implementation time, the current production result should include Nippet and link to
  `/puppies/nippet`; do not hard-code her identity into production copy.
- Continue using the shared `PuppyCard` component.
- When no puppies are available, show an honest `/contact` CTA for future availability.
- Do not duplicate or fork the Supabase query logic for Birmingham.

Section heading:

```text
Available Bulldog Puppies for Birmingham Families
```

Supporting copy:

```text
Current French and English Bulldog puppy profiles are updated as availability changes. Open a profile to review photos, pricing, temperament notes, and available health information.
```

## Pickup and delivery copy

### Pickup by Appointment

```text
Our pickup area is near Falkville, approximately an hour from much of the Birmingham metro depending on the starting point, route, and traffic. Contact us to arrange an appointment before traveling. The private pickup address is shared according to our reservation and safety process.
```

### Ground Transport

```text
Ground transport or an agreed meet-up may be available for Birmingham-area families depending on timing, distance, and puppy readiness. Confirm the arrangement and cost before placing a deposit.
```

### Flight Nanny Delivery

```text
Professional in-cabin flight nanny delivery may be arranged when available. Birmingham-Shuttlesworth International Airport or another agreed airport can be discussed before scheduling. Puppies do not travel in cargo, and delivery cost and timing must be confirmed in advance.
```

Do not promise unconditional delivery directly to BHM. Keep `may be arranged`, `can be discussed`,
and the requirement to confirm timing and cost.

## Birmingham FAQ

Visible FAQ text and `FAQPage` JSON-LD must be generated from the same data and match exactly.

### What Bulldog puppies are currently available near Birmingham?

```text
The available-puppy section on this page uses our current puppy records. Open a profile to review the puppy's status, photos, published price, temperament notes, and available health information. Availability may change when a puppy is reserved.
```

### How far is Exotic Bulldog Legacy from Birmingham?

```text
Our pickup area is near Falkville, approximately an hour from much of the Birmingham metro. Actual driving time depends on your starting point, route, and traffic. Contact us before traveling to arrange an appointment.
```

### Can a puppy be delivered to Birmingham?

```text
Pickup near Falkville is available by appointment. Depending on timing, distance, and puppy readiness, we may also arrange ground transport, an agreed meet-up, or professional in-cabin flight nanny delivery. Confirm availability, timing, and cost before placing a deposit.
```

### What deposit is required to reserve a puppy?

```text
A $300 non-refundable deposit reserves an approved available puppy and is applied to the final purchase price. Review the current deposit terms and complete the buyer-approval process before submitting payment.
```

Before publishing, compare `$300` with the active reservation configuration and Terms page. If the
amount or sequence differs, stop and report the inconsistency instead of publishing conflicting
information.

### What health information is available with a puppy?

```text
Available health information can vary by puppy and breeding pair. Ask to review the records available for the specific puppy and parents. Puppies receive age-appropriate veterinary care before going home, and the applicable health-guarantee terms are provided in the signed contract.
```

## Contextual internal links

Add a compact `Before You Choose a Puppy` block with natural surrounding sentences and these links:

| Anchor                                           | Destination                                       |
| ------------------------------------------------ | ------------------------------------------------- |
| `See available Bulldog puppies`                  | `/puppies`                                        |
| `Learn how to review Bulldog health tests`       | `/blog/choose-healthy-bulldog-puppy-health-tests` |
| `Read puppy-family reviews`                      | `/reviews`                                        |
| `Contact us about Birmingham pickup or delivery` | `/contact`                                        |
| `Review deposit and delivery terms`              | `/terms`                                          |

Do not add a Birmingham testimonial until the owner confirms that it is genuine and approved for
publication.

## Implementation constraints

- Prefer updating Birmingham data in `lib/data/locations.ts` and reuse the shared location template.
- Do not change other location records as part of this batch.
- Preserve one H1, self-canonical, indexability, Breadcrumb structured data, and FAQ structured data.
- Preserve the current live-data puppy cards and honest empty state.
- Do not create another Birmingham URL or change the existing slug.
- Do not add keyword-stuffed hidden text.

## Tests and verification

Update or add tests that verify:

- exactly one H1 with the required Birmingham heading;
- expected title, meta description, self-canonical, and no `noindex`;
- Birmingham, Falkville, and nearby-community context is visible;
- the page requests `getFilteredPuppies({ status: 'available' })`;
- an available puppy card links to its real `/puppies/{slug}` URL;
- the empty state links to `/contact`;
- all required contextual links are present;
- visible FAQ answers and `FAQPage` JSON-LD match;
- the old `families have been trusting` claim is absent;
- an unconditional nationwide-delivery claim is absent;
- an unconditional promise of direct BHM delivery is absent;
- Huntsville, Cullman, and Decatur data remain unchanged.

Run:

```text
targeted location tests
npm run test
npm run lint
npm run typecheck
npm run check:links
npm run build
relevant Playwright smoke tests
desktop and mobile visual QA
git diff --check
```

## Documentation after implementation

When implementation is complete but not deployed:

1. Mark the Birmingham section in
   `docs/seo/landing-page-improvement-plan-2026-10-04.md` as implemented on `dev`, not deployed,
   not indexed, and not measured.
2. Add a concise implementation entry to `memory-bank/activeContext.md`.
3. Record the changed files, final copy, test results, unresolved business facts, and commit hash.

After the combined SEO release is deployed:

1. Record the common deployment date and the Birmingham commit hash.
2. Verify production HTTP status, title, description, H1, canonical, robots, puppy data, internal
   links, FAQ/Breadcrumb schema, and mobile presentation.
3. Run one Search Console Live Test and submit one Request Indexing request if the live test passes.
4. Record the live-test and request dates.
5. Compare the next 28 complete days with the baseline. Do not repeatedly request indexing.

## Definition of done

- The page answers current availability, pickup, delivery, deposit, and health-information questions
  without forcing the visitor to search elsewhere.
- Birmingham wording is useful and natural rather than a city-name substitution template.
- Inventory and exact commercial terms come from current project data and policy.
- No fabricated testimonial, affiliation, health guarantee, or unconditional delivery promise is
  introduced.
- Automated checks and desktop/mobile visual QA pass.
- Implementation and later deployment/measurement dates are documented.
