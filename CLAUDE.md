# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
**For full context, see [docs/llms.txt](docs/llms.txt) and [AGENTS.md](AGENTS.md).**

## Memory Bank workflow (required)

At the start of any coding session:

1. Read `memory-bank/activeContext.md`
2. Read `memory-bank/systemPatterns.md`
3. Use `docs/llms.txt` as the doc map

Before opening a PR / finishing a task:

- Update `memory-bank/activeContext.md` (what changed + next steps)
- Update `memory-bank/progress.md` if a milestone moved
- Update `memory-bank/systemPatterns.md` if a new rule/decision emerged

### Tech Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Supabase (PostgreSQL + Storage) · Stripe & PayPal · Vitest + Playwright · GA4/Meta Pixel · Resend email · hCaptcha

## Build & Development Commands

```bash
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build (auto-runs image optimization)
npm run lint         # ESLint (zero warnings policy)
npm run typecheck    # TypeScript strict mode
npm run test         # Vitest unit/component tests
npm run test:watch   # Vitest watch mode
npm run e2e          # Playwright E2E (requires dev server running)
npm run verify       # Run all checks: lint + typecheck + test + e2e
```

**Run a single test:**

```bash
npx vitest run path/to/file.test.ts           # Single unit test file
npx playwright test tests/e2e/foo.spec.ts     # Single E2E test file
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
   - This pulls merge commits back into `dev` to keep branches aligned

**Pre-commit Hooks:**

- Husky + lint-staged run automatically on `git commit`
- Auto-formats TypeScript/JavaScript files with Prettier
- Runs ESLint with `--fix` on staged files
- Formats JSON, Markdown, and CSS files

**Important:** Never commit directly to `main`. Always work in `dev` and merge via PR.

## Architecture Overview

### Data Flow

- **Catalog**: `/puppies`, `/puppies/[slug]` — ISR with 60s revalidation
- **Static Pages**: `/about`, `/faq`, `/policies`, `/reviews` — static generation with JSON-LD schemas
- **Contact**: `components/contact-form.tsx` → `app/contact/actions.ts` → Supabase `inquiries` table (Zod validation, rate limiting, hCaptcha)
- **Analytics**: Consent-gated GA4/Meta Pixel via `useAnalytics().trackEvent`

### Key Components

- **Layout**: `SiteHeader`, `SiteFooter`, `ContactBar` (sticky)
- **Providers**: `ThemeProvider` → `AnalyticsProvider` → page content
- **Puppy Display**: `PuppyCard`, `PuppyGallery`, `PuppyFilters`
- **SEO**: `JsonLd`, `Breadcrumbs` (auto JSON-LD), dynamic `robots.ts`/`sitemap.ts`

### Admin Panel (`/admin/*`)

Protected by `middleware.ts` with session-based auth (`lib/admin/session.ts`).

**Puppies CRUD** (`/admin/puppies`):

- Key files: `lib/admin/puppies/queries.ts`, `app/admin/(dashboard)/puppies/actions.ts`
- File uploads: Client-side direct uploads via signed URLs (60s validity) to bypass 1MB Server Action limit
- Slug protection: Read-only after creation to preserve URLs
- Breed priority: Use `puppy.breed` first, fallback to parent breed for backward compatibility
- Parent metadata: Direct fields (`sire_name`, `dam_name`, 8 parent notes) without parent records

**Reviews Moderation** (`/admin/reviews`):

- Key files: `lib/reviews/admin-queries.ts`, `app/admin/(dashboard)/reviews/actions.ts`
- Database field mapping: `authorName`→`author_name`, `body`→`story`, `authorLocation`→`location`
- Requires `SUPABASE_SERVICE_ROLE` to bypass RLS and view pending reviews

### Payments

**Payment Flow:**

- **Stripe**: Checkout Sessions in `app/puppies/[slug]/actions.ts` → webhook fulfillment via `lib/stripe/webhook-handler.ts`
  - Handles: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `charge.refunded`
- **PayPal**: Smart Buttons → `/api/paypal/create-order` and `/api/paypal/capture` → webhook fulfillment via `lib/paypal/webhook-handler.ts`
  - Handles: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.REFUNDED`
- **Reservation**: `ReservationCreationService` in `lib/reservations/create.ts` with atomic operations and race condition protection
- **Status Updates**: Webhooks automatically transition reservations from `'pending'` → `'paid'` via `ReservationQueries.updateStatus()` immediately after creation
- **Refunds**: Both Stripe and PayPal webhook handlers process refund events, update reservation status to `'refunded'`, and send email notifications via `lib/emails/refund-notifications.ts`
- **Expiry**: Pending reservations auto-expire after 15 minutes via Supabase `pg_cron` (no external cron needed)
- **Idempotency**: Multi-layer protection via `lib/reservations/idempotency.ts` using `webhook_events` table

**Admin Reservations Dashboard** (`/admin/reservations`):

- Key files: `lib/reservations/queries.ts`, `app/admin/(dashboard)/reservations/actions.ts`
- View all reservations with filtering by status, payment provider, date range
- Detect payment status mismatches (stuck in pending with payment IDs)
- Manual status updates with audit logging via `ReservationQueries.adminUpdateStatus()`
- Protected by admin session auth

### Database Schema

**Core tables**: `puppies` (catalog), `reservations` (deposits), `inquiries` (leads), `reviews` (testimonials), `webhook_events` (audit)

**Reservation Status Lifecycle**:

- `'pending'` → Initial state after payment intent created (expires in 15 minutes)
- `'paid'` → Webhook confirmed payment and updated status
- `'refunded'` → Payment refunded by admin or customer request
- `'cancelled'` → Manually cancelled by admin
- `'expired'` → Auto-expired by pg_cron after 15 minutes

**Key patterns**:

- `puppies.breed` takes priority over parent breed for filtering/display
- `reservations.external_payment_id` stores Stripe Payment Intent ID or PayPal Capture ID
- `reservations.payment_provider` is `'stripe'` or `'paypal'`
- `webhook_events` table prevents duplicate processing via unique constraint on `(provider, event_id)`
- Migrations in `supabase/migrations/`, seed data in `supabase/seeds/`
- Treat `lib/supabase/database.types.ts` as source of truth for types
- Type definitions in `lib/reservations/types.ts` for reservation domain logic

## File Organization

```
app/                    # Next.js App Router pages & API routes
  admin/(dashboard)/    # Protected admin routes
  api/                  # Webhooks, health checks
  puppies/[slug]/       # Puppy detail pages
components/             # Shared React components
lib/                    # Business logic & utilities
  admin/                # Admin-specific queries
  supabase/             # DB client, queries, types
  seo/                  # Metadata, structured data
tests/                  # Unit & E2E tests
supabase/               # Migrations & seeds
```

## Testing Notes

- **E2E consent handling**: Use `acceptConsent(page)` helper from `tests/e2e/helpers/consent.ts`
- **hCaptcha bypass**: Set `HCAPTCHA_BYPASS_TOKEN` env var for automated tests
- **Playwright mock mode**: `PLAYWRIGHT_MOCK_RESERVATION=true` for payment flow tests without real gateways
- **Webhook handler tests**: Mock patterns in `lib/stripe/webhook-handler.test.ts` and `lib/paypal/webhook-handler.test.ts`:
  - Use chainable Supabase query builder mocks (supports multiple `.eq()` calls and `.maybeSingle()`)
  - Mock email notification functions from `lib/emails/*`
  - Mock `ReservationQueries` methods: `getByPayment()`, `updateStatus()`, `update()`
  - Mock `ReservationCreationService.createReservation()` with success/error scenarios
  - Use `vi.fn().mockResolvedValue()` for async operations, `vi.fn().mockRejectedValue()` for error cases

## Theming

Theme tokens in `app/globals.css`. Use `useTheme()` hook and Tailwind utilities (`bg-bg`, `bg-card`, `text-muted`, `border-border`). No hard-coded hex values.

## Coding Conventions

- TypeScript strict mode; avoid `any`
- Components: `PascalCase`, hooks: `useCamelCase`, utilities: `camelCase.ts`, migrations: `snake_case.sql`
- Conventional Commits: `feat(scope): message`
- Secrets in `.env.local`, update `.env.example` when adding new vars

## Environment Variables

**Email Configuration:**

- `OWNER_EMAIL` — Private email where notifications are SENT TO (inquiry alerts, deposit notifications)
- `NEXT_PUBLIC_CONTACT_EMAIL` — Public email that customers SEE (shown on site, in email templates)
- `RESEND_FROM_EMAIL` — From address for outgoing emails (must be verified in Resend)

**Contact Information:**

- All `NEXT_PUBLIC_CONTACT_*` variables are visible in browser (public)
- Phone format: E.164 (`+12055551234`)
- WhatsApp: digits only, no + (`12055551234`)
- Telegram: username without @ (`exoticbulldoglegacy`)

**Testing:**

- `HCAPTCHA_BYPASS_TOKEN` / `NEXT_PUBLIC_HCAPTCHA_BYPASS_TOKEN` — Bypass captcha in E2E tests
- `PLAYWRIGHT_MOCK_RESERVATION=true` — Mock payment flows for E2E tests

## Important Caveats

- Do NOT use `ssr: false` with `next/dynamic` in Server Components (Next.js 15 restriction)
- Do NOT re-run Supabase CLI or modify `.supabase` config — coordinate schema updates with maintainer
- Service-role keys (`SUPABASE_SERVICE_ROLE`) only for server-side code
