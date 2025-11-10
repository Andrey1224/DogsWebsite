# Repository Guidelines

## Project Structure & Module Organization
Next.js routes live under `app/`, with shared UI in `components/` and reusable logic in `lib/`. Contact intake flows through `components/contact-form.tsx` → `app/contact/actions.ts`, while validation, captcha, and rate limiting sit in `lib/inquiries/` and `lib/captcha/`. Keep Supabase SQL migrations inside `supabase/migrations/`, static assets in `public/`, and Playwright specs in `tests/e2e/`. Planning docs (`Spec1.md`, `SPRINT_PLAN.md`, `SPRINTx_REPORT.md`) stay at the repo root alongside this guide.

## Build, Test, and Development Commands
- `npm run dev` — start the sandboxed Next.js dev server.
- `npm run lint` — ESLint + Tailwind plugin; warnings block CI.
- `npm run test` — Vitest and React Testing Library suites.
- `npm run e2e` — Playwright catalog + contact scenarios; set `HCAPTCHA_BYPASS_TOKEN`.
- `npm run build` — production build mirroring Vercel.

## Coding Style & Naming Conventions
Use TypeScript `strict`, Prettier defaults (2 spaces, ≤100 columns), and Tailwind utilities mapped to the theme tokens in `app/globals.css`. Components use PascalCase (`PuppyCard.tsx`), hooks use `useCamelCase`, Supabase helpers stick to `camelCase.ts`, and SQL files remain `snake_case.sql`. Extend theme colors centrally before adding custom CSS, and colocate page-specific code within `app/(section)/[slug]/` folders.

## Testing Guidelines
Unit and component specs use `.test.ts(x)` next to the source, while cross-page flows belong in `tests/e2e/*.spec.ts`. Mock GA4/Meta Pixel when asserting analytics hooks. Target ≥80% coverage on shared utilities, and block merges on failing lint, unit, or e2e runs. Record new fixtures under `test-utils/` to avoid duplication.

## Commit & Pull Request Guidelines
Follow Conventional Commits (`feat(app): add sticky contact bar`). Each pull request needs a summary, linked ticket, screenshots or terminal output when UI changes, and a checklist of `lint`, `test`, and `e2e` runs. Require at least one reviewer plus green CI before merging, and document notable scope decisions in the current `SPRINTx_REPORT.md`.

## Security & Configuration Tips
Keep secrets in `.env.local`, mirror required keys to `.env.example`, and sync with Vercel/GitHub secrets. Only use `HCAPTCHA_BYPASS_TOKEN` and service-role Supabase keys locally. Large media should land in Supabase storage; do not commit binaries beyond lightweight marketing assets. When contact info changes, update `NEXT_PUBLIC_CONTACT_*` so the bar, cards, Crisp, and analytics stay consistent.
