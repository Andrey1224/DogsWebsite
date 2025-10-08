# Exotic Bulldog Level — Sprint Workspace

Sprint workspace for Exotic Bulldog Level. Sprint 1 adds the Supabase-driven catalog, detailed puppy pages, and supporting content routes.

## Prerequisites
- Node.js 20+ (repo tested with v24)
- npm 10+
- Optional: Playwright browsers (`npx playwright install`)

## Setup
1. Copy `.env.example` to `.env.local` and populate the following keys:
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
   - `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENV`
   - `NEXT_PUBLIC_CRISP_WEBSITE_ID`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `META_PIXEL_ID`
   - `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`, `HCAPTCHA_SECRET_KEY` (required for the contact form)
   - Optional local/testing bypass: `NEXT_PUBLIC_HCAPTCHA_BYPASS_TOKEN`, `HCAPTCHA_BYPASS_TOKEN`
   - `NEXT_PUBLIC_CONTACT_PHONE`, `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_WHATSAPP`, `NEXT_PUBLIC_TELEGRAM_USERNAME`
   - `NEXT_PUBLIC_SITE_URL` (matches the deployment base URL)
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the local dev server:
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000) to verify the scaffold.
4. Apply the database schema via the Supabase SQL editor or CLI using `supabase/migrations/20241007T000000Z_initial_schema.sql`.

## Quality Gates
- `npm run lint` — Next.js + ESLint (Tailwind aware).
- `npm run typecheck` — TypeScript in `strict` mode.
- `npm run test` — Vitest unit/component suites.
- `npm run e2e` — Playwright flows (catalog filters + contact form; requires `npm run dev`).

CI mirrors these commands in `.github/workflows/ci.yml` so every PR must pass lint, test, and build before merging.

## Reference Docs
- `Spec1.md` — product scope and functional requirements.
- `SPRINT_PLAN.md` — roadmap broken into sprints and DoD.
- `AGENTS.md` — contributor practices, repo structure, and command reference.
- `CLAUDE.md` — agent operating rules (Context7 usage, file ordering).

## Data & Seeding
- Run the schema migration in `supabase/migrations/20241007T000000Z_initial_schema.sql`.
- Seed demo content by executing `supabase/seeds/initial_seed.sql` in the Supabase SQL editor (adds parents, litters, puppies, sample reservations/inquiries).
- Catalog routes (`/puppies`, `/puppies/[slug]`) revalidate every 60s; adjust `revalidate` in route files if content freshness requirements change.

## Contact & Analytics Stack (Sprint 2)
- Contact form (`components/contact-form.tsx`) posts to the server action in `app/contact/actions.ts`, which validates input with Zod, enforces Supabase-backed rate limits, and writes to the `inquiries` table.
- Captcha verification lives in `lib/captcha/hcaptcha.ts`; enable real keys for production or supply the same bypass token (`NEXT_PUBLIC_HCAPTCHA_BYPASS_TOKEN` / `HCAPTCHA_BYPASS_TOKEN`) locally to exercise the flow in tests.
- Crisp chat is injected via `components/crisp-chat.tsx`, sharing availability events with the sticky `ContactBar` and dispatching offline fallbacks to WhatsApp.
- `components/analytics-provider.tsx` wraps the app with a consent-aware GA4/Meta Pixel client. Accept/decline decisions update Consent Mode (`ad_user_data`, `ad_personalization`) and gate tracking for `contact_click`, `form_submit`, `form_success`, and `chat_open` events.
- Production contact info is sourced from `NEXT_PUBLIC_CONTACT_*` variables. Update `.env.local`, `.env.example`, and Vercel/GitHub secrets to keep the contact bar, Crisp copy, and analytics payloads in sync.

## Theming & Tokens
- Light theme palette: `--bg #F9FAFB`, `--bg-card #FFFFFF`, `--text #111111`, `--text-muted #555555`, `--accent #FFB84D`, gradient `--accent-2-start #FF4D79 → --accent-2-end #FF7FA5`, aux navy `--accent-aux #0D1A44`, footer base `#E5E7EB`, borders `rgba(0,0,0,0.08)`, hover tint `rgba(0,0,0,0.04)`.
- Dark theme palette: `--bg #0D1A44`, `--bg-card #1C1C1C`, `--text #FFFFFF`, `--text-muted #D1D5DB`, `--accent #FFB84D`, same gradient, aux gold `#FFD166`, footer base `#0A0F24`, borders `rgba(255,255,255,0.12)`, hover tint `rgba(255,255,255,0.06)`.
- `components/theme-provider.tsx` + `components/theme-toggle.tsx` expose a light/dark/system switch (persisted via `localStorage`) that writes `data-theme="light" | "dark"` on `<html>`. All routes/components should rely on Tailwind utilities derived from these tokens (`bg-bg`, `text-muted`, `border-border`, `.bg-accent-gradient`) instead of hard-coded hex values. Update the palette in `app/globals.css` when brand colors shift.
