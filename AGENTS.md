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
Use TypeScript `strict` and Prettier defaults (2 spaces, ≤100 columns). Components follow PascalCase (`PuppyCard.tsx`), hooks use `useCamelCase`, utilities default to `camelCase.ts`, and SQL stays `snake_case.sql`. Prefer Tailwind tokens defined in `app/globals.css` (`bg-bg`, `.bg-accent-gradient`) and extend the palette there before introducing custom CSS. Colocate feature-specific logic inside `app/(section)/[slug]/` folders to preserve module boundaries.

## Testing Guidelines
Place colocated specs beside source with a `.test.ts`/`.test.tsx` suffix; end-to-end flows stay in `tests/e2e/*.spec.ts`. Mock GA4/Meta Pixel in analytics tests and keep shared fixtures in `test-utils/`. Target ≥80% coverage on shared libraries, and treat failing lint/unit/e2e checks as blockers before review.

## Commit & Pull Request Guidelines
Adopt Conventional Commits (`feat(app): add sticky contact bar`). Every PR should include a scope summary, linked ticket, screenshots or terminal output for UI/back-end changes, and confirmation that `lint`, `test`, and `e2e` ran. Require at least one reviewer, green CI, and log notable scope shifts in the active `SPRINTx_REPORT.md`.

## Security & Configuration Tips
Store secrets in `.env.local`, update `.env.example` when new variables are introduced, and sync with Vercel/GitHub secrets. Only use service-role Supabase keys and `HCAPTCHA_BYPASS_TOKEN` locally. Keep large media in Supabase buckets, not Git. When contact info changes, refresh all `NEXT_PUBLIC_CONTACT_*` variables so the contact bar, Crisp, and analytics stay consistent.
