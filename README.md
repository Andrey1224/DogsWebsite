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
- `npm run e2e` — Playwright smoke flow (requires `npm run dev`).

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
