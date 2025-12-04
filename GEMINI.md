# Gemini Project Context

This file serves as the primary instructional context for Gemini agents working on this repository. It consolidates the project overview, architecture, development commands, and coding standards.

## Project Overview

**Exotic Bulldog Legacy** is a full-stack web application for a premium bulldog breeder. The project is designed to provide a rich user experience, secure payment processing, and a robust administration system.

The application acts as a digital catalog for available puppies, enabling potential buyers to browse listings, view detailed information, and place deposits securely. It integrates with several third-party services for payments, analytics, communication, and security.

### Core Technologies

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI**: [React](https://react.dev/) (Server and Client Components)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Payments**: [Stripe](https://stripe.com/) & [PayPal](https://www.paypal.com/)
- **Testing**: [Vitest](https://vitest.dev/) (Unit/Component) & [Playwright](https://playwright.dev/) (E2E)
- **Linting**: [ESLint](https://eslint.org/)
- **Analytics**: Google Analytics (GA4) & Meta Pixel
- **Email**: [Resend](https://resend.com/)
- **Security**: [hCaptcha](https://www.hcaptcha.com/)

---

## Building and Running

### Prerequisites

- **Node.js**: v20.x LTS or higher
- **npm**: v10+

```bash
# Check Node version
node --version
```

### Development Commands

- `npm run dev`: Start the development server on `http://localhost:3000`.
- `npm run build`: Build the production application. This automatically runs image optimization and mirrors the Vercel deployment process.
- `npm run start`: Start the production server.
- `npm run lint`: Run ESLint with Tailwind-aware rules.
- `npm run typecheck`: Run the TypeScript compiler in strict mode.
- `npm run test`: Run Vitest unit and component tests.
- `npm run test:watch`: Run Vitest in watch mode.
- `npm run e2e`: Run Playwright end-to-end tests (requires the dev server to be running).
- `npm run optimize-images`: Optimize static images in `/public`.
- `npm run verify`: Run all quality checks (lint, typecheck, test, e2e).
- `npm run validate-deployment`: Validate production deployment health.

---

## Development Conventions

### Project Architecture

#### Directory Structure

- `app/`: Next.js App Router pages and API routes.
- `components/`: Shared React components.
- `lib/`: Utilities, Supabase clients, and business logic modules.
- `lib/admin/`: Admin-specific utilities and queries.
- `supabase/`: Database migrations and seeds.
- `tests/`: Unit tests and E2E specs.

#### Data Flow & State

- **Data Fetching**: Primarily uses Server Components.
- **Mutations**: Uses Server Actions for form submissions and data updates.
- **State**: Managed via URL state and React state (`useState`, `useReducer`). No global state library (Redux/Zustand) is used.

### Coding Standards

- **TypeScript**: Strict mode is enabled. Avoid `any` and unnecessary casting.
- **Styling**: Use Tailwind CSS utility classes. Define custom colors and design tokens in `app/globals.css`.
- **Naming**:
  - Components: `PascalCase`
  - Hooks: `useCamelCase`
  - Utilities: `camelCase.ts`
  - Migrations: `snake_case.sql`

### Testing Guidelines

- **Unit/Component Tests**: Use Vitest + React Testing Library. Place test files alongside source files (e.g., `foo.test.tsx`).
- **E2E Tests**: Use Playwright. Tests are located in `tests/e2e/`. Use shared helpers (like `acceptConsent(page)`) to handle common UI elements.
- **Coverage**: Aim for ≥80% coverage on shared logic.

### Git & Contribution

- **Commit Messages**: Follow Conventional Commits (e.g., `feat(app): add sticky contact bar`).
- **PR Requirements**: concise description, screenshots for UI changes, and confirmation that `npm run verify` passes.
- **Secrets**: Store secrets in `.env.local`. Never commit keys to the repository.

---

## Key Architectural Patterns

- **Admin Panel**: Protected by middleware. Supports full CRUD for puppies and reviews. Uses client-side direct uploads to Supabase Storage.
- **Payment Processing**: Integration with Stripe Checkout Sessions and PayPal Smart Buttons. Uses webhooks for fulfillment and `ReservationCreationService` for atomic updates.
- **SEO**: Dynamic `robots.txt` and `sitemap.xml`. JSON-LD structured data for Organization, LocalBusiness, and Products.
- **Performance**: Image optimization via `next/image` and build scripts. Dynamic imports for below-fold components. Crisp chat loaded via `requestIdleCallback`.

For more detailed documentation on specific subsystems, refer to the `docs/` directory.
