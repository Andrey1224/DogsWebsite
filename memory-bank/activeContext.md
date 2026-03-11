# Active Context

## Current Goal

- **P0**: Adopt Memory Bank standards for AI context persistence.
- **P1**: Unify documentation entry points to reduce duplication.
- **P2**: Automate documentation integrity (link checking).
- **P3**: Temporarily pause customer reservations until Stripe customer setup is complete.
- **P4**: Disable intro screen so the home page loads immediately.
- **P5**: Disable promotional modal on production via env variable.

## Current Status

- **IN PROGRESS**: `NEXT_PUBLIC_PROMO_DISABLED=true` set in Vercel but promo modal still showing.
  - Debug logging added to `components/home/promo-gate.tsx` (commit `3baf367`, main)
  - Need to check browser console on production to diagnose root cause
  - Suspected cause: env variable not embedded in bundle (client component), or missing redeploy without build cache
  - **TODO**: Remove debug logs once issue is resolved
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
- **Infra**: Next.js 15, Tailwind v4, Supabase, Stripe/PayPal integration stable.
- **Reservations**: Added a site-wide disable flag for reservation UX (Stripe setup in progress).
- **Intro**: Added an env flag to skip the intro screen.

## Branch State (Feb 6, 2026)

| Branch | Latest commit | Notes                                      |
| ------ | ------------- | ------------------------------------------ |
| `main` | `3baf367`     | Debug logs in PromoGate — remove after fix |
| `dev`  | `1b4595e`     | 1 doc-only commit ahead of main            |

## Active Workstream

- Debugging `NEXT_PUBLIC_PROMO_DISABLED` not taking effect on production.
- Pausing reservation UI via `NEXT_PUBLIC_RESERVATIONS_DISABLED`.
- Skipping intro screen via `NEXT_PUBLIC_INTRO_DISABLED`.
- Investigating Search Console SEO warnings around `noindex` exclusions and low internal-link counts.
- Sitemap completeness updated to include `/reviews`.

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
5. Enable/disable reservations via env when Stripe customer setup is ready.
6. Turn off intro in `.env.local` when ready to hide the splash screen.
7. Compare Search Console excluded puppy URLs against current sitemap output to confirm whether missing/retired puppy slugs are generating `noindex` pages.
8. Inspect live rendered HTML for `/puppies` and several puppy detail URLs to confirm Googlebot can see `<a href=\"/puppies/...\">` links in production source.
9. Resubmit updated sitemap in Google Search Console after deploy so `/reviews` is recrawled faster.
