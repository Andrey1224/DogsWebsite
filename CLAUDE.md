# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Read First (Required Order)

1. **[memory-bank/activeContext.md](memory-bank/activeContext.md)** — Current goal, status, and next steps
2. **[memory-bank/systemPatterns.md](memory-bank/systemPatterns.md)** — Architecture patterns and conventions
3. **[docs/llms.txt](docs/llms.txt)** — Documentation map (source of truth for all docs)
4. **[AGENTS.md](AGENTS.md)** — Repository guidelines and workflows

For deep dives, see:

- **[docs/history/README.md](docs/history/README.md)** — Project history and navigation
- **[docs/payments/payments-architecture.md](docs/payments/payments-architecture.md)** — Payment flows (Stripe/PayPal)
- **[REPORT_STRIPE_WEBHOOKS.md](REPORT_STRIPE_WEBHOOKS.md)** — Webhook deduplication deep dive

## Tech Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Supabase (PostgreSQL + Storage) · Stripe & PayPal · Vitest + Playwright · GA4/Meta Pixel · Resend email · hCaptcha

## Working Style

- **Small Diffs**: Make minimal, focused changes. Avoid refactoring unless requested.
- **Unified Patches**: Prefer unified diff format for changes when communicating.
- **Context First**: Always read files before modifying them.
- **Memory Bank**: Update at end of session (see Definition of Done below).

## Essential Commands

```bash
# Development
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build (auto-runs image optimization)

# Quality Checks (run before committing)
npm run verify       # Run all: lint + typecheck + test + e2e

# Individual checks
npm run lint         # ESLint (zero warnings policy)
npm run typecheck    # TypeScript strict mode
npm run test         # Vitest unit/component tests
npm run test:watch   # Vitest watch mode
npm run e2e          # Playwright E2E (requires dev server running)

# Documentation
npm run check:links  # Verify markdown links in docs/ and memory-bank/

# Single test execution
npx vitest run path/to/file.test.ts           # Single unit test
npx playwright test tests/e2e/foo.spec.ts     # Single E2E test
```

**Node.js 20+ required** (jsdom and @vitejs/plugin-react dependencies).

## Git Workflow

**Branch Strategy:**

- `main` — Production-ready code. Protected branch for stable releases only.
- `dev` — Active development branch. All work happens here.

**Development Process:**

1. Work in the `dev` branch for all changes
2. Commit and push to `dev` regularly: `git push`
3. CI checks run automatically on every push to `dev`
4. When ready for production, create a Pull Request from `dev` → `main`
5. After PR approval and merge:
   - Sync `dev` with `main`: `git checkout dev && git merge main && git push`

**Pre-commit Hooks:**

- Husky + lint-staged run automatically on `git commit`
- Auto-formats TypeScript/JavaScript files with Prettier
- Runs ESLint with `--fix` on staged files
- Formats JSON, Markdown, and CSS files

**Important:** Never commit directly to `main`. Always work in `dev` and merge via PR.

## Testing Configuration

- **E2E consent handling**: Use `acceptConsent(page)` helper from `tests/e2e/helpers/consent.ts`
- **hCaptcha bypass**: Set `HCAPTCHA_BYPASS_TOKEN` env var for automated tests
- **Playwright mock mode**: `PLAYWRIGHT_MOCK_RESERVATION=true` for payment flow tests without real gateways
- **Webhook handler tests**: Mock patterns in `lib/stripe/webhook-handler.test.ts` and `lib/paypal/webhook-handler.test.ts`:
  - Use chainable Supabase query builder mocks (supports multiple `.eq()` calls and `.maybeSingle()`)
  - Mock email notification functions from `lib/emails/*`
  - Mock `ReservationQueries` methods: `getByPayment()`, `updateStatus()`, `update()`
  - Mock `ReservationCreationService.createReservation()` with success/error scenarios
  - Use `vi.fn().mockResolvedValue()` for async operations, `vi.fn().mockRejectedValue()` for error cases

## Important Restrictions

- **Next.js 15**: Do NOT use `ssr: false` with `next/dynamic` in Server Components
- **Supabase**: Do NOT re-run Supabase CLI or modify `.supabase` config — coordinate schema updates with maintainer
- **Secrets**: Service-role keys (`SUPABASE_SERVICE_ROLE`) only for server-side code
- **Zero Warnings**: ESLint must pass with zero warnings (enforced in CI)

## Definition of Done

Before opening a PR or finishing a task:

1. Run `npm run verify` — all checks must pass
2. Update `memory-bank/activeContext.md` (what changed + next steps)
3. Update `memory-bank/progress.md` if a milestone moved
4. Update `memory-bank/systemPatterns.md` if a new rule/decision emerged
5. If documentation changed, run `npm run check:links` to verify links
