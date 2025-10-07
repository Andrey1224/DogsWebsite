# Repository Guidelines

## Sprint Reporting
Document noteworthy decisions and deliverables for each iteration in `SPRINTx_REPORT.md` (e.g., `SPRINT0_REPORT.md`). Keep these reports current so we can trace what shipped and why when we revisit scope.

## Documentation Map
Start with `Spec1.md` for the end-to-end product brief; every sprint traces back to it. `SPRINT_PLAN.md` converts that scope into weekly execution. This `AGENTS.md` covers day-to-day delivery practices, while `CLAUDE.md` records agent operating rules (e.g., when to call Context7). Keep the four files in sync whenever scope or process shifts.

## Project Structure & Module Organization
Planning docs stay at the repo root beside the Next.js app. Keep routes under `app/`, shared UI in `components/`, Supabase utilities in `lib/`, SQL migrations in `supabase/`, automated tests in `tests/`, and static assets in `public/`. Track environment templates in `.env.example`, and store large media in Supabase buckets instead of Git.

## Build, Test, and Development Commands
- `npm install` — install dependencies.
- `npm run dev` — launch the dev server with sandbox credentials.
- `npm run lint` — ESLint + Tailwind rules; warnings fail CI.
- `npm run build` — production bundle mirroring Vercel.
- `npm run test` — Vitest + React Testing Library suites.
- `npm run e2e` — Playwright smoke flow (catalog → detail → reserve).

## Coding Style & Naming Conventions
Use TypeScript `strict` with Prettier defaults (2 spaces, 100 columns). Name components in PascalCase (`PuppyCard.tsx`), hooks as `useCamelCase`, Supabase helpers in `camelCase.ts`, and SQL artifacts in `snake_case.sql`. Favor Tailwind utilities and shadcn/ui patterns; add custom CSS only for reused styles. Colocate page-specific logic under `app/(section)/[slug]/`.

## Environment & Security Notes
Store secrets in `.env.local` (already includes Supabase, Stripe, PayPal, Crisp) and refresh `.env.example` whenever new variables land. Mirror required keys into GitHub/Vercel secrets; keep the service role key server-side only. Document Supabase policy or schema changes in `supabase/migrations/` and review RLS updates during code review. Never commit customer media; reference Supabase storage URLs instead.

## Testing Guidelines
Place Playwright specs in `tests/e2e/*.spec.ts` covering quick-contact CTAs, inquiry submission, and deposit confirmation. Co-locate unit/component tests with a `.test.tsx` suffix and mock GA4/Meta Pixel network calls. Target ≥80% coverage on shared logic and block merges on failing lint, unit, or e2e jobs.

## Commit & Pull Request Guidelines
Adopt Conventional Commits (`feat(app): add sticky contact bar`). Keep messages imperative and scoped. PRs need a concise summary, linked ticket, UI evidence, and a checklist of executed commands (`lint`, `test`, `e2e`). Require at least one reviewer approval and passing CI before merge.
