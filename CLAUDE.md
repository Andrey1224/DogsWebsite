# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start the development server on localhost:3000
- `npm run build` - Build the production application (mirrors Vercel deployment)
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint with Tailwind-aware rules (warnings fail CI)
- `npm run typecheck` - Run TypeScript compiler in strict mode
- `npm run test` - Run Vitest unit and component tests
- `npm run test:watch` - Run Vitest in watch mode
- `npm run e2e` - Run Playwright end-to-end tests (requires `npm run dev`)
- `npm run validate-deployment` - Validate production deployment health

### Testing Requirements
- Use `HCAPTCHA_BYPASS_TOKEN` environment variable for automated contact form testing
- E2E tests cover catalog filtering and contact form submission
- Target ≥80% test coverage on shared logic

## Project Architecture

### Technology Stack
- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Database**: Supabase (PostgreSQL + Row Level Security)
- **Storage**: Supabase Storage for media files
- **Analytics**: GA4 + Meta Pixel with consent management
- **Chat**: Crisp widget integration
- **Payments**: Stripe Checkout Sessions + PayPal Smart Buttons
- **Testing**: Vitest + React Testing Library + Playwright

### Key Architectural Patterns

#### Data Flow
- **Catalog Pages**: `/puppies` and `/puppies/[slug]` use ISR with 60s revalidation
- **Content Pages**: `/faq`, `/policies`, `/reviews` use static generation with rich JSON-LD schemas
- **Contact Flow**: Form submissions → Server Action → Supabase `inquiries` table
- **Rate Limiting**: Supabase-backed rate limiting prevents spam
- **Captcha**: hCaptcha verification with local testing bypass
- **SEO Pipeline**: Dynamic `robots.txt` and `sitemap.xml` via Next.js 15 route handlers

#### Component Architecture
- **Layout Components**: `SiteHeader`, `SiteFooter`, `ContactBar` (sticky)
- **Provider Chain**: `ThemeProvider` → `AnalyticsProvider` → page content
- **Shared Components**: `PuppyCard`, `PuppyGallery`, `ContactForm`, `PuppyFilters`, `Breadcrumbs`, `JsonLd`
- **Analytics Integration**: All tracking events use `useAnalytics().trackEvent`
- **SEO Components**: `JsonLd` wrapper for structured data, `Breadcrumbs` with automatic JSON-LD

#### Contact & Analytics Stack
The contact system spans multiple interconnected files:
- UI submits via `components/contact-form.tsx` → `app/contact/actions.ts`
- Validation: `lib/inquiries/schema.ts` (Zod schemas)
- Rate limiting: `lib/inquiries/rate-limit.ts` (Supabase-backed)
- Captcha: `lib/captcha/hcaptcha.ts`
- Contact metadata: `lib/config/contact.ts` (centralized env-driven config)
- Analytics: `components/analytics-provider.tsx` (consent-gated GA4/Meta Pixel)
- Chat: `components/crisp-chat.tsx` (emits events for `ContactBar`)

### Environment Configuration

#### Required Environment Variables
```bash
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE=

# Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_ENV=
PAYPAL_WEBHOOK_ID=

# Contact & Analytics
NEXT_PUBLIC_CONTACT_PHONE=
NEXT_PUBLIC_CONTACT_EMAIL=
NEXT_PUBLIC_WHATSAPP=
NEXT_PUBLIC_TELEGRAM_USERNAME=
NEXT_PUBLIC_CONTACT_ADDRESS=
NEXT_PUBLIC_CONTACT_LATITUDE=
NEXT_PUBLIC_CONTACT_LONGITUDE=
NEXT_PUBLIC_CONTACT_HOURS=
NEXT_PUBLIC_CRISP_WEBSITE_ID=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
META_PIXEL_ID=

# Email Notifications (Resend)
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@exoticbulldoglevel.com
OWNER_EMAIL=

# Captcha
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=
HCAPTCHA_SECRET_KEY=
# Local testing only:
NEXT_PUBLIC_HCAPTCHA_BYPASS_TOKEN=
HCAPTCHA_BYPASS_TOKEN=

# Analytics (Server-Side)
GA4_API_SECRET=

# Webhook Monitoring & Alerting
ALERT_EMAILS=
SLACK_WEBHOOK_URL=

# Site
NEXT_PUBLIC_SITE_URL=
```

## Design System & Theming

### Color Tokens (Defined in `app/globals.css`)
- **Light Theme**: `#F9FAFB` (bg), `#FFFFFF` (cards), `#111111/#555555` (text), `#FFB84D` (accent), `#FF4D79→#FF7FA5` (gradient), `#0D1A44` (aux navy)
- **Dark Theme**: `#0D1A44/#1C1C1C` (bg/cards), `#FFFFFF/#D1D5DB` (text), same accent/gradient, `#FFD166` (aux gold)

### Theme System
- Theme state managed by `components/theme-provider.tsx`
- Persisted preference: `light`, `dark`, or `system`
- Applied via `data-theme="light" | "dark"` on `<html>`
- Use `useTheme()` hook for theme-aware components
- Tailwind utilities: `bg-bg`, `bg-card`, `text-muted`, `border-border`, `bg-accent-gradient`

### Component Styling Guidelines
- Use CSS custom properties for colors: `bg-[color:var(--btn-bg)]`
- Accent tints use `color-mix()` helpers
- Extend tokens centrally for new surfaces
- No hard-coded hex values in components

## Database Schema

### Core Tables
- `breeds`: French Bulldog, English Bulldog
- `parents`: Sire/dam information with health clearances
- `litters`: Mating dates, due dates, birth dates
- `puppies`: Individual puppies with status, pricing, media
- `reservations`: Deposit tracking (Stripe/PayPal)
- `inquiries`: Contact form submissions and lead tracking

### Key Relationships
- `puppies` → `litters` → `parents` (sire/dam)
- `reservations` → `puppies` (deposit tracking)
- `inquiries` → `puppies` (lead source attribution)

### Migration & Seeding
- Initial schema: `supabase/migrations/20241007T000000Z_initial_schema.sql`
- Sample data: `supabase/seeds/initial_seed.sql`
- Client IP tracking: `supabase/migrations/20250216T120000Z_add_client_ip_to_inquiries.sql`

## File Organization

### Route Structure
- `app/` - Next.js App Router pages
- `app/(section)/[slug]/` - Page-specific logic co-location
- `app/contact/actions.ts` - Server actions for contact form

### Component Organization
- `components/` - Shared React components
- `lib/` - Utilities, Supabase clients, business logic
- `tests/` - Unit tests and E2E specs
- `supabase/` - Database migrations and seeds

### Key Business Logic Files
- `lib/supabase/queries.ts` - Database query functions
- `lib/supabase/types.ts` - TypeScript type definitions
- `lib/inquiries/schema.ts` - Contact form validation
- `lib/config/contact.ts` - Contact info centralization
- `lib/config/business.ts` - Business info for structured data (NAP, hours, location)
- `lib/seo/structured-data.ts` - JSON-LD schema generators (Organization, LocalBusiness, Product, FAQPage)
- `lib/seo/metadata.ts` - Centralized metadata generation helpers

## Integration Patterns

### Contact & Analytics Events
Track these events via `useAnalytics().trackEvent`:
- `contact_click` (channel: whatsapp/telegram/call/sms/email)
- `form_submit` and `form_success`
- `chat_open` (Crisp interactions)
- `reserve_click` and `deposit_paid` (tracked via GA4 Measurement Protocol)

### Payment Processing (Sprint 3 - Complete)
- **Stripe**: Checkout Sessions created in `app/puppies/[slug]/actions.ts`, fulfilled via `/api/stripe/webhook` → `lib/stripe/webhook-handler.ts`
- **PayPal**: Smart Buttons call `/api/paypal/create-order` and `/api/paypal/capture`; webhooks verified at `/api/paypal/webhook`
- **Reservation Flow**: `ReservationCreationService` handles atomic puppy reservation with race condition protection
- **Idempotency**: Multi-layer deduplication (webhook events, payment IDs, database constraints)
- **Email Notifications**: Owner + customer emails sent automatically on successful deposit
- **Analytics**: Server-side `deposit_paid` events tracked via GA4 Measurement Protocol
- **Monitoring**: `/api/health/webhooks` endpoint + email/Slack alerts for webhook failures
- **External Monitoring**: UptimeRobot monitors production health endpoint every 60 minutes (100% uptime, ~700ms response time)

### Media Handling
- Store in Supabase Storage buckets: `puppies`, `parents`, `litters`
- Use `next/image` optimization with proper sizing
- Generate public URLs with signed access when needed
- Target WebP/AVIF formats ≤400KB for optimal LCP
- Preload hero images and LCP candidates

### SEO & Structured Data (Sprint 4)
- **Metadata**: Centralized helper in `lib/seo/metadata.ts` generates title, description, OG, Twitter Card tags
- **Structured Data**: JSON-LD generators in `lib/seo/structured-data.ts` for:
  - `Organization` - Site-wide business identity
  - `LocalBusiness` (PetStore) - NAP, hours, geolocation, service area
  - `Product` - Individual puppy listings with pricing and availability
  - `FAQPage` - FAQ structured markup
  - `MerchantReturnPolicy` - Return/refund policy with country-specific rules
  - `BreadcrumbList` - Navigation breadcrumbs
- **Routes**: Dynamic `app/robots.ts` and `app/sitemap.ts` for crawlability
- **Business Config**: `lib/config/business.ts` centralizes NAP data from `NEXT_PUBLIC_CONTACT_*` env vars
- **Validation**: All schemas validated via Google Rich Results Test and `structured-data-testing-tool`
- **Performance**: Lighthouse targets ≥90 for SEO, Accessibility, Performance; Core Web Vitals LCP ≤2.5s, CLS ≤0.1

## Quality Assurance

### Pre-commit Checks
- ESLint: `npm run lint` (zero warnings policy)
- TypeScript: `npm run typecheck` (strict mode)
- Unit tests: `npm run test`
- E2E tests: `npm run e2e` (catalog filtering, contact form with captcha bypass)

### SEO & Performance Validation
- Lighthouse: Target scores ≥90 for SEO, Accessibility, Performance
- Rich Results: Validate JSON-LD with Google Rich Results Test or `npx structured-data-testing-tool --presets Google`
- Core Web Vitals: LCP ≤2.5s, CLS ≤0.1, INP ≤200ms
- Sitemap: Submit `sitemap.xml` to Google Search Console for indexing

### CI/CD Pipeline
- GitHub Actions mirror local commands
- Deploy to Vercel on merge to main
- Environment-specific secrets management
- Automated smoke testing on deployment

## Context7 Usage

Always use Context7 MCP tools for:
- Code generation and setup tasks
- Library/API documentation lookup
- Configuration steps for new integrations

Process: `resolve-library-id` → `get-library-docs` → implement solution

## Documentation Maintenance

Keep these files synchronized when making changes:
- `Spec1.md` - Product requirements source
- `SPRINT_PLAN.md` - Execution roadmap
- `AGENTS.md` - Contributor practices
- `CLAUDE.md` - Agent operating rules (this file)
- Sprint plans (`sprint_*_plan_final.md`)
- Sprint progress (`SPRINT*_PROGRESS.md`)
- Sprint reports (`SPRINT*_REPORT.md`)

When modifying the contact/analytics stack, update all connected files and refresh documentation to maintain contributor understanding.

### Sprint-Specific Notes
- **Sprint 4**: SEO infrastructure, structured data, trust content pages (`/faq`, `/policies`, `/reviews`) delivered. Business config centralized in `lib/config/business.ts`. Review images are placeholders pending final client assets. NAP data validated against production coordinates (95 County Road 1395, Falkville, AL 35622).
