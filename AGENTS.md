# Repository Guidelines

## Project Structure & Module Organization

Next.js routes live under `app/`, server actions stay alongside their routes (e.g., `app/contact/actions.ts`), and shared UI belongs in `components/`. Domain helpers sit in `lib/` (`lib/inquiries/` for validation/rate limits, `lib/captcha/` for hCaptcha, `lib/config/contact.ts` for contact data). Keep Supabase migrations in `supabase/migrations/`, assets in `public/`, and Playwright specs in `tests/e2e/`. Core root docs are limited to `README.md`, `CLAUDE.md`, `AGENTS.md`, `Spec1.md`, `SPRINT_PLAN.md`, and `MIGRATIONS.md`, while the detailed library now lives in `docs/` (see `docs/README.md` for the index, ADRs in `docs/admin/`, payment notes in `docs/payments/`, sprint history in `docs/history/sprints/`, and archived artifacts in `docs/archive/`).

## Build, Test, and Development Commands

- `npm run dev` — Launch the sandboxed Next.js dev server with local creds.
- `npm run lint` — ESLint + Tailwind plugin; warnings fail CI.
- `npm run test` — Vitest + React Testing Library unit/component suites.
- `npm run e2e` — Playwright catalog/contact flows (set `HCAPTCHA_BYPASS_TOKEN`).
- `npm run build` — Production build matching Vercel.

## Coding Style & Naming Conventions

# Repository Guidelines

## Project Structure & Module Organization

- Next.js routes reside in `app/`, with feature folders such as `app/puppies/[slug]` for details and colocated server actions.
- Shared UI lives in `components/`; domain helpers are grouped under `lib/` (e.g., `lib/reservations`, `lib/supabase`), while global config stays in `lib/config`.
- Supabase migrations are tracked in `supabase/migrations/`; assets belong in `public/`; Playwright specs live in `tests/e2e/`; colocated unit specs use `*.test.ts(x)` beside source.

## Build, Test, and Development Commands

- `npm run dev` — Next.js dev server with local env.
- `npm run lint` — ESLint with `next/core-web-vitals`, fails on warnings.
- `npm run typecheck` — `tsc --noEmit` for strict typing.
- `npm run test` / `npm run test:watch` — Vitest + React Testing Library suites.
- `npm run e2e` — Playwright specs (set `NEXT_PUBLIC_HCAPTCHA_BYPASS_TOKEN`).
- `npm run build` / `npm run start` — production build and serve.
- `npm run verify` — Aggregated lint + typecheck + unit + e2e.
- Supabase CLI is **never** run by agents/CI; the maintainer regenerates types locally via `npm run supabase:types` when needed.
- Reservation E2E uses a mock checkout flag. Set `PLAYWRIGHT_MOCK_RESERVATION=true` (CI already does this) so `createCheckoutSession` returns `/mock-checkout` instead of hitting Stripe; reset to `false` for normal behavior.

## Coding Style & Naming Conventions

- TypeScript strict mode; avoid `any`/double casts in runtime code.
- Prettier config (100 columns, semicolons, single quotes) plus ESLint keep formatting consistent.
- Components use PascalCase, hooks `useCamelCase`, utilities `camelCase.ts`, SQL migrations `snake_case.sql`.
- Favor Tailwind tokens defined in `app/globals.css`; extend palette there before adding ad-hoc CSS.

## Testing Guidelines

- Unit/component tests rely on Vitest + RTL; place specs alongside source (`foo.test.tsx`).
- E2E lives in `tests/e2e/*.spec.ts`; run against production build using Playwright browsers.
- Aim for ≥80% coverage on shared libraries, especially payments/reservations.
- The reservation scenario in `tests/e2e/reservation.spec.ts` is skipped unless `PLAYWRIGHT_MOCK_RESERVATION=true`. Use that env var plus `NEXT_PUBLIC_HCAPTCHA_BYPASS_TOKEN` for automated runs.

## Commit & Pull Request Guidelines

- Follow Conventional Commits: `feat(app): add sticky contact bar`.
- Every PR needs: concise description, linked issue/ticket, screenshots or terminal output for UI/backend changes, and confirmation that `lint`, `test`, and `e2e` ran.
- Main branch is protected; merge only via green PRs (CI runs lint, typecheck, tests, build).
- Document notable scope shifts in the active sprint report (e.g., `SPRINT_PLAN.md` entry).

## Security & Configuration Tips

- Secrets stay in `.env.local`; update `.env.example` whenever new variables appear.
- Use service-role Supabase keys only server-side; ensure `NEXT_PUBLIC_*` is safe for clients.
- Supabase migrations apply through SQL files only; never edit schema manually in production.

## Agent Workflow Notes

- Treat `lib/supabase/database.types.ts` as source of truth; do not re-run Supabase CLI or modify `.supabase` config.
- When tasks require schema updates, coordinate with the maintainer for regeneration rather than invoking CLI commands yourself.

## Testing Guidelines

Place colocated specs beside source with a `.test.ts`/`.test.tsx` suffix; end-to-end flows stay in `tests/e2e/*.spec.ts`. Mock GA4/Meta Pixel in analytics tests and keep shared fixtures in `test-utils/`. Target ≥80% coverage on shared libraries, and treat failing lint/unit/e2e checks as blockers before review.

## Commit & Pull Request Guidelines

Adopt Conventional Commits (`feat(app): add sticky contact bar`). Every PR should include a scope summary, linked ticket, screenshots or terminal output for UI/back-end changes, and confirmation that `lint`, `test`, and `e2e` ran. Require at least one reviewer, green CI, and log notable scope shifts in the active `SPRINTx_REPORT.md`.

## Security & Configuration Tips

Store secrets in `.env.local`, update `.env.example` when new variables are introduced, and sync with Vercel/GitHub secrets. Only use service-role Supabase keys and `HCAPTCHA_BYPASS_TOKEN` locally. Keep large media in Supabase buckets, not Git. When contact info changes, refresh all `NEXT_PUBLIC_CONTACT_*` variables so the contact bar, Crisp, and analytics stay consistent.
