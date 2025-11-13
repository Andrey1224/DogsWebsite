# Gemini Project Analysis: PuppyWebsite

## Project Overview

This project is a full-stack web application for **Exotic Bulldog Legacy**, a premium bulldog breeder. It's built with a modern tech stack, focusing on a rich user experience, secure payments, and a comprehensive admin system.

The application serves as a digital catalog for available puppies, allowing potential buyers to browse, view details, and make deposits. It integrates with multiple third-party services for payments, analytics, communication, and security.

### Core Technologies

*   **Framework**: [Next.js](https://nextjs.org/) (App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **UI**: [React](https://react.dev/) (Server and Client Components)
*   **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
*   **Payments**: [Stripe](https://stripe.com/) & [PayPal](https://www.paypal.com/)
*   **Testing**: [Vitest](https://vitest.dev/) (Unit/Component) & [Playwright](https://playwright.dev/) (E2E)
*   **Linting**: [ESLint](https://eslint.org/)
*   **Analytics**: Google Analytics (GA4) & Meta Pixel
*   **Email**: [Resend](https://resend.com/)
*   **Security**: [hCaptcha](https://www.hcaptcha.com/)

### Architecture

The project follows a feature-driven structure within the `app/` directory. Key architectural patterns include:

*   **Server Components by default**, with Client Components (`"use client"`) used for interactive UI.
*   **API Routes** in `app/api/` for handling webhooks (Stripe, PayPal) and other server-to-server communication.
*   **Server Actions** for mutations like form submissions and creating payment sessions.
*   **Service modules** in the `lib/` directory for encapsulating business logic (e.g., `lib/reservations`, `lib/stripe`, `lib/supabase`).
*   **Middleware** (`middleware.ts`) for protecting admin routes.
*   **Environment-based configuration** using `.env.local` for sensitive keys and settings.

## Building and Running

### Prerequisites

*   Node.js (v20+)
*   npm (v10+)

### Initial Setup

1.  **Copy Environment Variables**:
    ```bash
    cp .env.example .env.local
    ```
2.  **Populate `.env.local`**: Fill in the required API keys and secrets for Supabase, Stripe, PayPal, etc., as detailed in the `README.md`.
3.  **Install Dependencies**:
    ```bash
    npm install
    ```

### Development

To run the local development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Quality Gates & Testing

This project has a comprehensive set of quality checks.

*   **Run all checks (lint, types, tests)**:
    ```bash
    npm run verify
    ```
*   **Linting**:
    ```bash
    npm run lint
    ```
*   **Type Checking**:
    ```bash
    npm run typecheck
    ```
*   **Unit & Component Tests**:
    ```bash
    npm run test
    ```
*   **End-to-End Tests** (requires the dev server to be running):
    ```bash
    npm run e2e
    ```

### Production

*   **Build**:
    ```bash
    npm run build
    ```
*   **Start Server**:
    ```bash
    npm run start
    ```

## Development Conventions

*   **Styling**: Use Tailwind CSS utility classes. Custom global styles and CSS variables for theming are located in `app/globals.css`.
*   **Components**: Reusable components are located in the `components/` directory. Page-specific components can be co-located with their routes.
*   **Database**: Interact with Supabase using the clients provided in `lib/supabase/`. Server-side logic should use the admin client from `lib/admin/supabase.ts`.
*   **State Management**: Primarily managed via URL state and React state (e.g., `useState`, `useReducer`). There is no global state management library like Redux or Zustand.
*   **SEO**: Metadata is generated dynamically using the `generateMetadata` export in page components. Helper functions for this are in `lib/seo/`.
*   **Security**:
    *   Admin routes are protected via middleware.
    *   Webhook endpoints verify incoming request signatures.
    *   User input is validated using Zod.
*   **Testing**:
    *   Write Vitest tests for components, utility functions, and server-side logic.
    *   Place test files alongside the source files, with a `.test.ts` or `.test.tsx` extension.
    *   Write Playwright E2E tests for critical user flows in the `tests/e2e/` directory.
