# System Patterns

## Architecture

- **Framework**: Next.js 15 (App Router), React 19, TypeScript (Strict).
- **Styling**: Tailwind CSS v4.
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS).
- **Payments**: Dual-provider (Stripe + PayPal).
  - **Pattern**: Atomic reservations via `create_reservation_transaction` RPC.
  - **Idempotency**: `webhook_events` table + application-level checks.
- **State**: URL-driven state for lists; Server Actions for mutations.

## Conventions

- **Components**: `PascalCase`. Prefer Server Components. Client components only for interactivity.
- **Hooks**: `useCamelCase`.
- **Tests**: Vitest for unit/integration, Playwright for E2E.
- **Docs**:
  - History in `docs/history/`.
  - Architecture decisions in `docs/archive/` or specific feature docs.
  - Context map in `docs/llms.txt`.

## Anti-Patterns

- **Do NOT**: Use `any` type.
- **Do NOT**: Commit secrets to `.env`.
- **Do NOT**: Skip `npm run verify` before push.
- **Do NOT**: Duplicate business logic in API routes; use `lib/` services.
