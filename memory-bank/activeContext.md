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

## Current Status

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

## Branch State (Jun 18, 2026)

| Branch | Latest commit | Notes                            |
| ------ | ------------- | -------------------------------- |
| `main` | `32d6054`     | Crisp disabled; synced to origin |

## Active Workstream

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

1. Check browser console on production to see `[PromoGate]` log output.
2. Based on result:
   - If `undefined` → redeploy Vercel with cleared build cache, verify env var is set for Production environment.
   - If `true` but modal still shows → investigate `PromoModal` component for separate disable logic.
3. Remove debug `console.log` from `components/home/promo-gate.tsx` once fixed.
4. Sync `dev` with `main` after fix: `git checkout dev && git merge main && git push`.
5. Deploy server-side reservation guard, keep `NEXT_PUBLIC_RESERVATIONS_DISABLED=true` and `RESERVATIONS_DISABLED=true`, then switch both to `false` only when live Stripe webhook verification is confirmed.
6. Turn off intro in `.env.local` when ready to hide the splash screen.
7. Compare Search Console excluded puppy URLs against current sitemap output to confirm whether missing/retired puppy slugs are generating `noindex` pages.
8. Inspect live rendered HTML for `/puppies` and several puppy detail URLs to confirm Googlebot can see `<a href=\"/puppies/...\">` links in production source.
9. Resubmit updated sitemap in Google Search Console after deploy so `/reviews` is recrawled faster.
10. Confirm the Vercel deployment for `32d6054` completed and verify the Crisp bubble is absent in
    production.
11. Reconnect/authenticate the Supabase MCP integration in Codex, preferably scoped to
    `project_ref=vsjsrbmcxryuodlqscnl` and `read_only=true`, then restart the session and verify
    Supabase MCP tools appear in tool discovery.
