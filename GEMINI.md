# Gemini Project Context

This file serves as the primary instructional context for Gemini agents working on this repository. It consolidates the project overview, architecture, development commands, and coding standards.
**Refer to [docs/llms.txt](docs/llms.txt) for the complete documentation index and [AGENTS.md](AGENTS.md) for workflows.**

## Memory Bank workflow (required)

At the start of any coding session:

1. Read `memory-bank/activeContext.md`
2. Read `memory-bank/systemPatterns.md`
3. Use `docs/llms.txt` as the doc map

Before opening a PR / finishing a task:

- Update `memory-bank/activeContext.md` (what changed + next steps)
- Update `memory-bank/progress.md` if a milestone moved
- Update `memory-bank/systemPatterns.md` if a new rule/decision emerged

## Project Overview

**Exotic Bulldog Legacy** is a high-performance full-stack web application for a premium bulldog breeder. The project is designed to provide a rich user experience, secure payment processing, and a robust administration system.

The application acts as a digital catalog for available puppies, enabling potential buyers to browse listings, view detailed information, and place deposits securely. It integrates with several third-party services for payments, analytics, communication, and security.

### Core Technologies

- **Framework**: [Next.js 15.5](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode)
- **UI**: [React 19](https://react.dev/) (Server and Client Components)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL + RLS)
- **Payments**: [Stripe](https://stripe.com/) & [PayPal](https://www.paypal.com/)
- **Testing**: [Vitest](https://vitest.dev/) (Unit/Component) & [Playwright](https://playwright.dev/) (E2E)
- **Linting/Formatting**: [ESLint](https://eslint.org/) & [Prettier](https://prettier.io/)
- **Analytics**: Google Analytics (GA4) & Meta Pixel (Consent Mode v2)
- **Email**: [Resend](https://resend.com/) + [@react-email](https://react.email/)
- **Security**: [hCaptcha](https://www.hcaptcha.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Feedback**: [Sonner](https://sonner.emilkowal.ski/) (Toasts)

---

## Building and Running

### Prerequisites

- **Node.js**: v20.x LTS or higher
- **npm**: v10+

### Development Commands

- `npm run dev`: Start the development server on `http://localhost:3000`.
- `npm run build`: Build the production application. Automatically runs image optimization.
- `npm run start`: Start the production server.
- `npm run lint`: Run ESLint.
- `npm run format`: Check formatting with Prettier.
- `npm run format:fix`: Fix formatting issues.
- `npm run typecheck`: Run the TypeScript compiler in strict mode.
- `npm run test`: Run Vitest unit and component tests.
- `npm run test:watch`: Run Vitest in watch mode.
- `npm run e2e`: Run Playwright end-to-end tests.
- `npm run verify`: Run all quality checks (lint, typecheck, test, e2e).
- `npm run optimize-images`: Optimize static images in `/public`.
- `npm run validate-deployment`: Validate production deployment health.
- `npm run supabase:types`: Generate TypeScript types from Supabase schema.

---

## Development Conventions

### Project Architecture

#### Directory Structure

- `app/`: Next.js App Router pages, API routes, and global styles.
- `components/`: React components (organized into subdirectories like `admin`, `home`, `puppy-detail`).
- `lib/`: Utilities, Supabase clients, service modules, and business logic.
- `supabase/`: Database migrations, seeds, and configuration.
- `tests/`: Unit tests and Playwright E2E specs.
- `scripts/`: Maintenance, optimization, and validation scripts.
- `docs/`: Extensive documentation on features, database, and planning.
- `types/`: Custom TypeScript type definitions.
- `public/`: Static assets (images, icons, etc.).

#### Data Flow & State

- **Data Fetching**: Primarily uses Server Components for SEO and performance.
- **Mutations**: Uses Server Actions for form submissions and data updates.
- **State**: Managed via URL state and React state (`useState`, `useReducer`).
- **Validation**: Strict schema validation using [Zod](https://zod.dev/).

### Coding Standards

- **TypeScript**: Strict mode is enforced. No `any`. Use generated Supabase types.
- **Styling**: Tailwind CSS v4 utility classes.
- **Naming**:
  - Components: `PascalCase`
  - Hooks: `useCamelCase`
  - Utilities: `camelCase.ts`
  - Migrations: `snake_case.sql`

### Testing Guidelines

- **Unit/Component Tests**: Vitest + React Testing Library. Files: `*.test.tsx`.
- **E2E Tests**: Playwright. Located in `tests/e2e/`.
- **Accessibility**: A11y tests included in Playwright and Vitest suites.

---

## Key Architectural Patterns

- **Admin Panel**: Protected by middleware. CRUD for puppies, reviews, and settings.
- **Payment Processing**: Stripe and PayPal integrations with robust webhook handling and idempotency.
- **Reviews System**: Public submission with hCaptcha and photo uploads via signed Supabase URLs.
- **Performance**: LCP optimized (~414ms). Uses `fetchPriority="high"` and lazy loading for third-party scripts.
- **SEO**: Advanced JSON-LD (LocalBusiness, Product, FAQPage). Dynamic sitemap and robots.txt.
- **Security**: hCaptcha on forms, RLS on Supabase, and CSP headers.

For more detailed documentation on specific subsystems, refer to the `docs/` directory.

---

## Recent Updates

### 2026-01-10: Critical Stripe Webhook Bug Fix

**Problem Fixed**: Early return bug in webhook handler that caused paid reservations to be canceled after 15 minutes.

**Issue Summary**:

- Stripe payments succeeded and success emails were sent
- But reservations remained in `pending` status
- After 15 minutes, `pg_cron` auto-canceled the reservation
- Root cause: `createWebhookEvent()` and `markProcessing()` were never called when existing reservation was found

**Changes Made**:

1. **lib/webhooks/webhook-events-server.ts**
   - `markProcessing()` now throws error instead of returning `false`
   - Ensures webhook events are always properly tracked

2. **lib/stripe/webhook-handler.ts**
   - Moved webhook event creation to the **beginning** of `createReservationFromSession()`
   - Added logic to mark existing `pending` reservations as `paid`
   - Removed duplicate webhook event creation code

3. **lib/stripe/webhook-handler.test.ts**
   - Updated mock for `markProcessing` (now returns `void`)
   - Added test for existing pending reservation scenario

**Result**:

- ✅ 604 tests passing
- ✅ All TypeScript checks passing
- ✅ Zero ESLint warnings
- ✅ Reservations now properly marked as `paid` after successful Stripe payments
- ✅ No more auto-cancellation of paid reservations

**Documentation**: See `REPORT_STRIPE_WEBHOOKS.md` section E for detailed analysis.
