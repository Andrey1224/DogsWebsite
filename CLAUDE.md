# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
3. When ready for production, create a Pull Request from `dev` → `main`
4. After PR approval and merge, pull latest changes: `git pull origin main`

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

- **Stripe**: Checkout Sessions in `app/puppies/[slug]/actions.ts` → webhook fulfillment via `lib/stripe/webhook-handler.ts`
- **PayPal**: Smart Buttons → `/api/paypal/create-order` and `/api/paypal/capture`
- **Reservation**: `ReservationCreationService` with atomic operations and race condition protection
- Email notifications sent on successful deposit

### Database Schema

**Core tables**: `puppies` (catalog), `reservations` (deposits), `inquiries` (leads), `reviews` (testimonials), `webhook_events` (audit)

**Key patterns**:

- `puppies.breed` takes priority over parent breed for filtering/display
- Migrations in `supabase/migrations/`, seed data in `supabase/seeds/`
- Treat `lib/supabase/database.types.ts` as source of truth for types

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

## Theming

Theme tokens in `app/globals.css`. Use `useTheme()` hook and Tailwind utilities (`bg-bg`, `bg-card`, `text-muted`, `border-border`). No hard-coded hex values.

## Coding Conventions

- TypeScript strict mode; avoid `any`
- Components: `PascalCase`, hooks: `useCamelCase`, utilities: `camelCase.ts`, migrations: `snake_case.sql`
- Conventional Commits: `feat(scope): message`
- Secrets in `.env.local`, update `.env.example` when adding new vars

## Important Caveats

- Do NOT use `ssr: false` with `next/dynamic` in Server Components (Next.js 15 restriction)
- Do NOT re-run Supabase CLI or modify `.supabase` config — coordinate schema updates with maintainer
- Service-role keys (`SUPABASE_SERVICE_ROLE`) only for server-side code
