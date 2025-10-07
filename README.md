# Exotic Bulldog Level — Sprint Workspace

Sprint 0 stands up the Next.js 15 developer environment for the Exotic Bulldog Level landing experience.

## Prerequisites
- Node.js 20+ (repo tested with v24)
- npm 10+
- Optional: Playwright browsers (`npx playwright install`)

## Setup
1. Copy `.env.example` to `.env.local` and supply Supabase, payments, Crisp, and analytics keys when they are issued.
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
