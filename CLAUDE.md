# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Prerequisites

**Node.js Version:** This project requires **Node.js 20.x LTS** or higher.

```bash
# Check your Node version
node --version  # Should be v20.x.x or higher

# If using nvm, install and use Node 20
nvm install 20
nvm use 20
nvm alias default 20
```

**Why Node 20?**

- jsdom@27.0.0 requires Node >=20
- @vitejs/plugin-react@5.0.4 requires Node >=20.19.0
- Matches CI/CD environment (GitHub Actions uses Node 20)

## Development Commands

### Core Development

- `npm run dev` - Start the development server on localhost:3000
- `npm run build` - Build the production application (auto-runs image optimization, mirrors Vercel deployment)
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint with Tailwind-aware rules (warnings fail CI)
- `npm run typecheck` - Run TypeScript compiler in strict mode
- `npm run test` - Run Vitest unit and component tests
- `npm run test:watch` - Run Vitest in watch mode
- `npm run e2e` - Run Playwright end-to-end tests (requires `npm run dev`)
- `npm run optimize-images` - Optimize all static images in /public (auto-runs on build)
- `npm run verify` - Run all quality checks (lint + typecheck + test + e2e)
- `npm run validate-deployment` - Validate production deployment health

### Testing Requirements

#### Environment Variables

- Use `HCAPTCHA_BYPASS_TOKEN` environment variable for automated contact form testing

#### E2E Test Helpers

- **Consent Banner Helper**: `tests/e2e/helpers/consent.ts`
  - Use `acceptConsent(page)` in test setup to handle consent banner
  - Handles race conditions, timeouts, and edge cases automatically
  - Waits for banner to disappear and validates localStorage
  - Example: `await acceptConsent(page);` in `beforeEach` hook
- **Pattern**: All E2E tests should use shared helpers to avoid flaky consent handling

#### Test Coverage

- E2E tests cover catalog filtering, contact form submission, contact links, analytics, admin panel
- Target ≥80% test coverage on shared logic
- All E2E tests must pass consistently (no flaky tests)

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
- **Content Pages**: `/about`, `/faq`, `/policies`, `/reviews` use static generation with rich JSON-LD schemas
  - `/about`: Breed-focused content with French Bulldog and English Bulldog descriptions (personality, care, characteristics)
  - `/faq`: Frequently asked questions with FAQ schema
  - `/policies`: Deposit, refund, health, and delivery policies
  - `/reviews`: Community + featured testimonials with photo uploads
- **Contact Flow**: Form submissions → Server Action → Supabase `inquiries` table
- **Rate Limiting**: Supabase-backed rate limiting prevents spam
- **Captcha**: hCaptcha verification with local testing bypass
- **SEO Pipeline**: Dynamic `robots.txt` and `sitemap.xml` via Next.js 15 route handlers

#### Component Architecture

- **Layout Components**: `SiteHeader`, `SiteFooter`, `ContactBar` (sticky)
- **Provider Chain**: `ThemeProvider` → `AnalyticsProvider` → page content
- **Shared Components**: `PuppyCard`, `PuppyGallery`, `ContactForm`, `PuppyFilters`, `Breadcrumbs`, `JsonLd`
- **Hero Carousel**: `HeroCarousel` - Auto-rotating image carousel on homepage (3 images, 3.5s interval, SSR-safe with hydration protection)
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

#### Admin Panel Architecture

- **Authentication**: Session-based auth with signed cookies (`lib/admin/session.ts`)
- **Middleware Protection**: `/admin/*` routes guarded by `middleware.ts`
- **Login**: `/admin/login` with credential validation
- **Dashboard**: `/admin/puppies` with full CRUD operations (Create, Read, Update, Delete)
- **Edit Functionality**: Drawer-based edit panel with photo management and read-only slug protection
- **File Uploads**: Client-side direct uploads to Supabase Storage via signed URLs (bypasses 1MB Server Action limit)
- **Parent Metadata**: Supports direct text input + photo uploads (no parent records required)
- **Breed Field**: Direct `breed` field on puppies table (french_bulldog | english_bulldog) with priority over parent breed
- **Reviews Moderation**: `/admin/reviews` with publish/unpublish, feature, and delete operations

**Key Files (Puppies)**:

- `lib/admin/session.ts` - Session cookie encoding/decoding
- `lib/admin/supabase.ts` - Admin Supabase client (service role)
- `lib/admin/puppies/queries.ts` - Admin puppy CRUD operations (includes `fetchFullAdminPuppyById`, `updateAdminPuppy`)
- `lib/admin/puppies/schema.ts` - Zod validation schemas (`createPuppySchema`, `updatePuppySchema`)
- `lib/admin/puppies/slug.ts` - Slug generation with collision detection
- `app/admin/(dashboard)/puppies/actions.ts` - Server Actions for puppy mutations (`createPuppyAction`, `updatePuppyAction`, etc.)
- `app/admin/(dashboard)/puppies/upload-actions.ts` - Signed URL generation for file uploads
- `app/admin/(dashboard)/puppies/edit-puppy-panel.tsx` - Edit drawer component with photo management
- `lib/admin/hooks/use-media-upload.ts` - Client-side upload hook with progress tracking

**Key Files (Reviews)**:

- `app/admin/(dashboard)/reviews/page.tsx` - Reviews admin page (fetches all reviews via service role)
- `app/admin/(dashboard)/reviews/actions.ts` - Server Actions for review moderation (`updateReviewAction`, `updateReviewStatusAction`, `updateReviewFeaturedAction`, `deleteReviewAction`)
- `components/admin/reviews/review-admin-panel.tsx` - Reviews moderation UI with filtering, editing, and status management
- `lib/reviews/admin-queries.ts` - Admin review queries (fetches all reviews regardless of status)
- `lib/reviews/queries.ts` - Public review queries (only fetches published reviews)
- `lib/reviews/types.ts` - Review type definitions (supports multiple photos via `photoUrls: string[]`)
- `components/reviews/review-card.tsx` - Public review card component (displays all photos from array)

**Important Implementation Notes (Puppies)**:

- **File Uploads**: Files are uploaded client-side directly to Supabase Storage using signed URLs (60s validity). Server Actions only receive URLs (< 1KB payload) to avoid the 1MB Server Action limit.
- **Edit Mode**: Existing photos are displayed with delete buttons. New photos can be added while preserving existing ones. Deleted photos are tracked separately and filtered out on submit.
- **Slug Protection**: Slug field is read-only in edit mode (displayed but disabled). Slugs cannot change after puppy creation to preserve public URLs and SEO.
- **Breed Priority**: Always use `puppy.breed` field first, fallback to `puppy.parents.sire.breed` or `puppy.parents.dam.breed` for backward compatibility. This applies to filtering (`lib/supabase/queries.ts`), display (`components/puppy-card.tsx`), and detail pages (`app/puppies/[slug]/page.tsx`).
- **Parent Metadata**: Puppies can have direct `sire_name`, `dam_name`, `sire_photo_urls[]`, `dam_photo_urls[]`, and 8 parent notes fields (`sire_weight_notes`, `sire_color_notes`, `sire_health_notes`, `sire_temperament_notes`, `dam_weight_notes`, `dam_color_notes`, `dam_health_notes`, `dam_temperament_notes`) without requiring parent records in `parents` table.
- **FormData Type Conversion**: Server Actions use `toNumberOrNull()` helper to convert FormData string values to numbers for `priceUsd` and `weightOz` fields before validation. This prevents validation errors when submitting numeric fields (fixed Nov 27, 2025).

**Important Implementation Notes (Reviews)**:

- **Service Role Required**: Admin panel requires `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SERVICE_ROLE` env var to bypass RLS and view all reviews (pending + published). Without it, falls back to mock data.
- **Full CRUD Operations**: Admin panel supports Create (mock), Read, Update (full edit), and Delete operations.
- **Edit Functionality**: Complete review editing including author name, location, rating, body text, visit date, and multiple photo URLs. Photos input via textarea (one URL per line). Fixed Nov 28, 2025 - was previously mock, now persists to database.
- **Multiple Photos Support**: Reviews support up to 3 photos via `photoUrls: string[]` array. TypeScript type and all queries updated Nov 28, 2025. Public page displays all photos stacked vertically.
- **Database Field Mapping**:
  - `authorName` → `author_name`
  - `authorLocation` → `location` (NOT `author_location`)
  - `body` → `story` (NOT `body`)
  - `photoUrls[]` → `photo_urls[]` array
  - `isPublished` → `status` ('published' | 'pending')
  - `isFeatured` → `featured`
  - Note: `headline` and `sourceUrl` fields exist in TypeScript but not in database (always null)
- **Publish/Unpublish**: Toggles review `status` between `'published'` and `'pending'`. Only published reviews appear on `/reviews` page.
- **Featured Toggle**: Marks reviews as featured (requires review to be published first). Featured reviews can be displayed prominently on homepage or special sections.
- **Delete Confirmation**: Delete action shows browser confirmation dialog before permanently removing review from database.
- **Optimistic UI**: All actions (edit, publish, feature, delete) update UI immediately, then sync with database. On error, changes are reverted and error message is shown.
- **Auto-Revalidation**: All moderation actions automatically revalidate both `/admin/reviews` and `/reviews` pages via `revalidatePath()`.
- **RLS Policies**: Public users can only SELECT reviews where `status = 'published'`. Service role has full access for admin operations.

### Environment Configuration

#### Required Environment Variables

```bash
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE=

# Admin Panel
ADMIN_LOGIN=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
ADMIN_SESSION_TTL_HOURS=

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
RESEND_FROM_EMAIL=noreply@exoticbulldoglegacy.com
OWNER_EMAIL=

# Captcha
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=
HCAPTCHA_SECRET_KEY=
# Local testing only:
NEXT_PUBLIC_HCAPTCHA_BYPASS_TOKEN=
HCAPTCHA_BYPASS_TOKEN=

# Analytics (Server-Side)
GA4_API_SECRET=
META_CONVERSION_API_TOKEN=

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

- `parents`: Sire/dam information with health clearances, breed field
- `litters`: Mating dates, due dates, birth dates
- `puppies`: Individual puppies with status, pricing, media, **direct breed field**, parent metadata fields
- `reservations`: Deposit tracking (Stripe/PayPal)
- `inquiries`: Contact form submissions and lead tracking
- `webhook_events`: Audit trail for payment webhooks
- `reviews`: Customer testimonials with ratings, photos, and publishing workflow

### Key Relationships

- `puppies` → `litters` → `parents` (sire/dam) - **Optional for backward compatibility**
- `puppies` can have direct parent metadata (sire_name, dam_name, photo URLs, parent notes) without parent records
- `puppies` have direct `breed` field (priority over parent breed)
- `puppies` have 8 parent notes fields (sire/dam weight, color, health, temperament notes) displayed on detail pages
- `reservations` → `puppies` (deposit tracking)
- `inquiries` → `puppies` (lead source attribution)

### Migration & Seeding

- Initial schema: `supabase/migrations/20241007T000000Z_initial_schema.sql`
- Parent metadata: `supabase/migrations/20250812T000000Z_add_parent_metadata_to_puppies.sql`
- Parent notes: `supabase/migrations/20250126T000000Z_add_parent_notes_to_puppies.sql` (8 text fields for sire/dam weight, color, health, temperament notes)
- Breed field: `supabase/migrations/20250109T180000Z_add_breed_to_puppies.sql`
- Soft delete: `supabase/migrations/20251111T223757Z_add_soft_delete_to_puppies.sql`
- Reviews table: `supabase/migrations/20251222T120000Z_create_reviews_table.sql` (applied Jan 18, 2025)
- Reviews featured column: `supabase/migrations/add_featured_to_reviews.sql` (added Nov 28, 2025 - adds `featured BOOLEAN DEFAULT false` and performance index)
- Sample data: `supabase/seeds/initial_seed.sql`
- Client IP tracking: `supabase/migrations/20250216T120000Z_add_client_ip_to_inquiries.sql`

## File Organization

### Route Structure

- `app/` - Next.js App Router pages
- `app/(section)/[slug]/` - Page-specific logic co-location
- `app/contact/actions.ts` - Server actions for contact form
- `app/admin/(dashboard)/` - Admin panel routes (protected by middleware)
- `app/api/` - API routes (webhooks, health checks)

### Component Organization

- `components/` - Shared React components
- `lib/` - Utilities, Supabase clients, business logic
- `lib/admin/` - Admin-specific utilities and queries
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

### Media Handling & Image Optimization

- **Storage**: Supabase Storage buckets: `puppies`, `parents`, `litters`
- **Admin Uploads**: Client-side direct uploads using signed URLs (bypasses Server Action 1MB limit)
  - Flow: Request signed URL → **Compress image** → Upload via fetch(PUT) → Get public URL → Submit URL to Server Action
  - Implemented in `lib/admin/hooks/use-media-upload.ts` and `app/admin/(dashboard)/puppies/upload-actions.ts`
  - **Automatic Compression**: All images compressed to ≤400KB before upload using `browser-image-compression`
  - Compression settings: max 1920px dimension, 85% quality, uses Web Worker for non-blocking UI
  - Library: `lib/utils/image-compression.ts` with `compressImage()` and `compressImages()` helpers

- **Build-Time Optimization**: Automated via `scripts/optimize-images.mjs`
  - Runs automatically on `npm run build`
  - Converts JPG/PNG → WebP + AVIF formats
  - Optimizes existing WebP/AVIF files
  - Shows detailed compression statistics
  - Powered by Sharp, imagemin-webp, imagemin-avif

- **Next.js Image Config** (`next.config.ts`):
  - Formats priority: `['image/avif', 'image/webp']` (AVIF first for better compression)
  - Device sizes: `[640, 750, 828, 1080, 1200, 1920, 2048, 3840]`
  - Image sizes: `[16, 32, 48, 64, 96, 128, 256, 384]`
  - Cache TTL: 60 seconds for CDN optimization
  - Use `next/image` optimization with proper sizing

- **Target**: WebP/AVIF formats ≤400KB for optimal LCP
- **Best Practices**: Preload hero images and LCP candidates

### SEO & Structured Data (Sprint 4 + Optimizations)

- **Metadata**: Centralized helper in `lib/seo/metadata.ts` generates title, description, OG, Twitter Card tags
  - **OpenGraph Image**: Auto-generated via `app/opengraph-image.tsx` (1200x630px, branded gradient)
  - **Web App Manifest**: `app/manifest.ts` for PWA support and mobile install prompts
  - **Admin Pages**: All admin routes have `robots: noindex` to prevent indexing

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

- **Performance Optimizations**:
  - **Font Loading**: Google Fonts use `display: 'swap'` to prevent FOIT (Flash of Invisible Text)
  - **Code Splitting**: PayPal button dynamically imported to reduce initial bundle size
  - **Dynamic Imports**: Use `next/dynamic` for below-fold components (FAQ, reviews carousel). **CRITICAL**: Do NOT use `ssr: false` option in Server Components (Next.js 15 restriction). Components are SSR'd by default for better SEO.
  - **Crisp Chat**: Deferred loading with `requestIdleCallback` API (4s timeout fallback for Safari) removes 3rd-party script from critical rendering path
  - **Resource Hints**: Preconnect tags for external domains (`client.crisp.chat`, `transparenttextures.com`) reduce DNS/TLS handshake latency
  - **Accessibility**: Removed duplicate `<header>` landmarks from content pages (Contact, FAQ, Policies, Reviews)
  - Lighthouse targets: ≥90 for SEO, Accessibility, Performance
  - Core Web Vitals: LCP ≤2.5s, CLS ≤0.1, INP ≤200ms

## Quality Assurance

### Pre-commit Checks

- ESLint: `npm run lint` (zero warnings policy)
- TypeScript: `npm run typecheck` (strict mode)
- Unit tests: `npm run test`
- E2E tests: `npm run e2e` (catalog filtering, contact form with captcha bypass)
- All checks: `npm run verify`

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
- `docs/admin/admin-panel-changelog.md` - Admin panel implementation log
- `docs/history/sprints/` - Sprint retrospectives
- `docs/archive/` - Historical artifacts

**Full documentation map:** See [`docs/README.md`](docs/README.md) for complete navigation.

When modifying the contact/analytics stack or admin panel, update all connected files and refresh documentation to maintain contributor understanding.

### Sprint-Specific Notes

- **Sprint 4**: SEO infrastructure, structured data, trust content pages (`/about`, `/faq`, `/policies`, `/reviews`) delivered. Business config centralized in `lib/config/business.ts`. NAP data validated against production coordinates (95 County Road 1395, Falkville, AL 35622). About page updated with breed-focused content (Jan 18, 2025): removed journey timeline, added French and English Bulldog descriptions.
- **Admin Panel**: Production-ready with breed selection, parent metadata, client-side file uploads. See `docs/admin/admin-panel-changelog.md` for detailed implementation history.
- **Performance Optimization (Jan 25, 2025)**: Critical LCP improvements delivered. Crisp chat deferred with `requestIdleCallback` (expected -300 to -800ms), preconnect tags added for external resources, hero image sizing optimized, dynamic imports for below-fold components (-15-25KB bundle). Total expected LCP improvement: **500ms-1.3s**. See `docs/optimization-changelog.md` and `docs/history/2025-01-25-lcp-optimization-e2e-fixes.md`.
- **E2E Test Infrastructure (Jan 25, 2025)**: Fixed consent banner race condition causing test failures. Created shared consent helper (`tests/e2e/helpers/consent.ts`) for robust consent handling. All 24 E2E tests passing. Pattern: Always use `acceptConsent(page)` in test setup.
- **Hero Carousel (Nov 27, 2025)**: Replaced static hero image with auto-rotating carousel (`components/hero-carousel.tsx`). Features 5 curated bulldog images with 3.5s interval, smooth fade transitions (1.5s), and SSR hydration protection using `mounted` state flag and `suppressHydrationWarning`. All images optimized to WebP/AVIF formats (58-329KB). Maintains all original styling and overlays with proper border-radius handling during transitions.
