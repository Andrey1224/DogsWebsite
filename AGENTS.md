# Repository Guidelines

## Sprint Reporting
Document noteworthy decisions and deliverables for each iteration in `SPRINTx_REPORT.md` (e.g., `SPRINT0_REPORT.md`). Keep these reports current so we can trace what shipped and why when we revisit scope.

## Documentation Map
Start with `Spec1.md` for the end-to-end product brief; every sprint traces back to it. `SPRINT_PLAN.md` converts that scope into weekly execution. This `AGENTS.md` covers day-to-day delivery practices, while `CLAUDE.md` records agent operating rules (e.g., when to call Context7). Keep the four files in sync whenever scope or process shifts.

## Project Structure & Module Organization
Planning docs stay at the repo root beside the Next.js app. Keep routes under `app/`, shared UI in `components/`, Supabase utilities in `lib/`, SQL migrations in `supabase/`, automated tests in `tests/`, and static assets in `public/`. Contact flow lives in `components/contact-form.tsx` + `app/contact/actions.ts`, with validation helpers in `lib/inquiries/` and captcha logic in `lib/captcha/`. Environment-driven contact data/links originate from `NEXT_PUBLIC_CONTACT_*` variables and are normalised in `lib/config/contact.ts`, keeping the contact bar, page cards, Crisp copy, and analytics aligned. Track environment templates in `.env.example`, and store large media in Supabase buckets instead of Git.

## Build, Test, and Development Commands
- `npm install` — install dependencies.
- `npm run dev` — launch the dev server with sandbox credentials.
- `npm run lint` — ESLint + Tailwind rules; warnings fail CI.
- `npm run build` — production bundle mirroring Vercel.
- `npm run test` — Vitest + React Testing Library suites.
- `npm run e2e` — Playwright flows (catalog filters + contact form). Requires `HCAPTCHA_BYPASS_TOKEN` for automated submissions.

## Coding Style & Naming Conventions
Use TypeScript `strict` with Prettier defaults (2 spaces, 100 columns). Name components in PascalCase (`PuppyCard.tsx`), hooks as `useCamelCase`, Supabase helpers in `camelCase.ts`, and SQL artifacts in `snake_case.sql`. Favor Tailwind utilities and shadcn/ui patterns; add custom CSS only for reused styles. Colocate page-specific logic under `app/(section)/[slug]/`.

## Environment & Security Notes
Store secrets in `.env.local` (includes Supabase, Stripe, PayPal, Crisp, GA/Pixel, hCaptcha, and `NEXT_PUBLIC_CONTACT_*`). Refresh `.env.example` whenever new variables land and mirror production secrets to Vercel/GitHub. Only use `HCAPTCHA_BYPASS_TOKEN` / `NEXT_PUBLIC_HCAPTCHA_BYPASS_TOKEN` locally; remove them for staging/production so captcha enforcement stays intact. Document Supabase policy or schema changes in `supabase/migrations/` and review RLS updates during code review. Never commit customer media; reference Supabase storage URLs instead.

## Contact & Analytics Flow
- Submissions flow from `components/contact-form.tsx` → `app/contact/actions.ts`. The server action sanitizes with `lib/inquiries/schema.ts`, enforces rate limits via `lib/inquiries/rate-limit.ts`, verifies hCaptcha (`lib/captcha/hcaptcha.ts`), and inserts into Supabase using the service role client. Keep field names aligned across these modules when extending the payload.
- `components/crisp-chat.tsx` injects Crisp, emits `crisp:availability` browser events for `components/contact-bar.tsx`, and dispatches offline messages that link back to WhatsApp. Update `CONTACT_COPY` when marketing copy shifts.
- `components/analytics-provider.tsx` wraps every page with consent-gated GA4/Meta Pixel tracking. Call `useAnalytics().trackEvent` for new telemetry; only events fired inside the provider respect consent state. The consent banner component (`components/consent-banner.tsx`) must remain inside the provider tree.
- When contact numbers/handles change, update `NEXT_PUBLIC_CONTACT_*` values across local `.env`, Vercel, and GitHub Actions secrets—`lib/config/contact.ts` will convert them into the correct formats for every consumer (contact bar, Crisp, analytics).

## Testing Guidelines
Place Playwright specs in `tests/e2e/*.spec.ts`; current coverage includes catalog filters and the contact form (captcha bypass required). Co-locate unit/component tests with a `.test.tsx` suffix—e.g., `lib/inquiries/schema.test.ts`—and mock GA4/Meta Pixel in future suites. Target ≥80% coverage on shared logic and block merges on failing lint, unit, or e2e jobs.

## Commit & Pull Request Guidelines
Adopt Conventional Commits (`feat(app): add sticky contact bar`). Keep messages imperative and scoped. PRs need a concise summary, linked ticket, UI evidence, and a checklist of executed commands (`lint`, `test`, `e2e`). Require at least one reviewer approval and passing CI before merge.
