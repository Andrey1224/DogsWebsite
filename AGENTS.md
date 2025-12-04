# Repository Guidelines

## Project Structure & Module Organization

- Next.js app router lives in `app/` (routes, server actions, metadata); shared styling in `app/globals.css`.
- Reusable UI in `components/`; domain/service logic and helpers in `lib/` and `types/`; middleware at root `middleware.ts`.
- Data layer artifacts in `supabase/` (migrations/seeds); scripts for tooling in `scripts/` (image optimization, deployment validation).
- Tests live in `tests/` (a11y, e2e, fixtures, setup) and co-located `*.test.ts(x)` files (e.g., `app/page.test.tsx`); Playwright config in `playwright.config.ts`, Vitest setup in `vitest.setup.ts`.
- Assets under `public/`; coverage and Playwright artifacts in `coverage/` and `test-results/`.
- `new-ui/` contains legacy JSX prototypes kept for reference—avoid wiring them into the Next.js runtime without review.

## Build, Test, and Development Commands

- `npm run dev` — start Next.js on :3000; requires `.env.local` from `.env.example`.
- `npm run build` — optimize images then compile for production; run before deploying.
- `npm run lint`, `npm run typecheck`, `npm run format:fix` — ESLint (no warnings), TS `strict`, and Prettier autofix.
- `npm run test` / `npm run test:watch` — Vitest unit/component suites (jsdom).
- `PLAYWRIGHT_MOCK_RESERVATION=true npm run e2e` — Playwright flows with mocked checkout; clear env vars to hit real gateways.
- `npm run verify` — full quality gate; `npm run validate-deployment` checks env + runtime readiness; `npm run supabase:types` regenerates typed clients after schema changes.

## Coding Style & Naming Conventions

- TypeScript-first; prefer server components unless client-side state/effects are needed.
- Prettier: 2-space indent, semicolons, single quotes, 100-col width; run `npm run format:fix` before pushing.
- Components/hooks in PascalCase/camelCase; files match default exports (`components/PuppyCard.tsx`), tests follow `*.test.tsx`/`*.spec.ts`.
- Use `lib/` for pure logic and `components/` for rendering; keep API routes slim and delegate to services.

## Testing Guidelines

- Vitest coverage thresholds enforced (global lines ≥40%, functions ≥70%; higher for `lib/reservations`, `lib/analytics`, `lib/inquiries`); ensure new code meets targets.
- Place shared fixtures under `tests/fixtures` and helpers under `tests/helpers`; prefer factories over hand-built objects.
- Keep Playwright specs in `tests/e2e`; run against `npm run dev` and capture console output for failures.
- Add accessibility checks (jest-axe/axe-core) when touching forms or interactive components.

## Commit & Pull Request Guidelines

- Follow the existing pattern of concise Conventional-style subjects (`feat: …`, `fix: …`, `chore: …`); one concern per commit.
- PRs: include a short summary, linked issue, screenshots for UI changes, and note any env/secret additions; request review for changes touching payments/Supabase.
- Ensure CI-equivalent checks pass locally (`lint`, `typecheck`, `test`, `e2e`, `build`) and update docs (`README.md`, `SPRINT_PLAN.md`) when behavior shifts.
- Never commit secrets; keep `.env.local` local and refresh keys before recording videos or screenshots.
