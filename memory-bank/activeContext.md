# Active Context

## Current Goal

- **P0**: Adopt Memory Bank standards for AI context persistence.
- **P1**: Unify documentation entry points to reduce duplication.
- **P2**: Automate documentation integrity (link checking).
- **P3**: Temporarily pause customer reservations until Stripe customer setup is complete.
- **P4**: Disable intro screen so the home page loads immediately.

## Current Status

- **Recent Optimization**: Lighthouse Mobile performance improvements completed (Feb 6, 2026):
  - ✅ Localized transparenttextures.com texture (~300ms LCP improvement)
  - ✅ Removed 10 redundant PNG files (3.68MB freed from repository)
  - ✅ Updated TypeScript target ES2017 → ES2019 (~6-8KB bundle reduction)
- **Recent Fix**: Admin puppy status dropdown now correctly displays updated values after page refresh (Feb 1, 2026).
- **Recent Fix**: Critical Stripe webhook early return bug fixed (Jan 10, 2026).
- **Recent Enhancement**: "You may also love" section now shows only available puppies (Feb 1, 2026).
- **Docs**: Refactored `docs/history` structure and created `docs/llms.txt`.
- **Infra**: Next.js 15, Tailwind v4, Supabase, Stripe/PayPal integration stable.
- **Reservations**: Added a site-wide disable flag for reservation UX (Stripe setup in progress).
- **Intro**: Added an env flag to skip the intro screen.

## Active Workstream

- Implementing "AI Docs Optimization" plan.
- Integrating `markdown-link-check` into CI verify pipeline.
- Pausing reservation UI via `NEXT_PUBLIC_RESERVATIONS_DISABLED`.
- Skipping intro screen via `NEXT_PUBLIC_INTRO_DISABLED`.

## Risks & Issues

- **Docs Drift**: Manual updates to `llms.txt` and `CHANGELOG.md` required until automation is built.
- **Complexity**: Payment flows (atomic reservations + idempotency) are complex; rely on `REPORT_STRIPE_WEBHOOKS.md` for context.

## Next Steps

1. Install `markdown-link-check`.
2. Verify all markdown links in `docs/` and `memory-bank/`.
3. Plan auto-generation for `docs/llms.txt`.
4. Enable/disable reservations via env when Stripe customer setup is ready.
5. Turn off intro in `.env.local` when ready to hide the splash screen.
