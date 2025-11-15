# Exotic Bulldog Legacy — Sprint Workspace

Sprint workspace for Exotic Bulldog Legacy. Sprint 1 delivered the Supabase-driven catalog and supporting content routes; Sprint 3/4 now ship the dual-provider ($300) deposit flow via Stripe Checkout and PayPal Smart Buttons.

## Prerequisites

- Node.js 20+ (repo tested with v24)
- npm 10+
- Optional: Playwright browsers (`npx playwright install`)

## Setup

1. Copy `.env.example` to `.env.local` and populate the following keys:
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
   - `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENV`, `PAYPAL_WEBHOOK_ID`
   - `NEXT_PUBLIC_CRISP_WEBSITE_ID`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `META_PIXEL_ID`
   - `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`, `HCAPTCHA_SECRET_KEY` (required for the contact form)
   - Optional local/testing bypass: `NEXT_PUBLIC_HCAPTCHA_BYPASS_TOKEN`, `HCAPTCHA_BYPASS_TOKEN`
   - `NEXT_PUBLIC_CONTACT_PHONE`, `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_WHATSAPP`, `NEXT_PUBLIC_TELEGRAM_USERNAME`
   - `NEXT_PUBLIC_SITE_URL` (matches the deployment base URL)
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
- `npm run e2e` — Playwright flows (catalog filters + contact form; requires `npm run dev`).

CI mirrors these commands in `.github/workflows/ci.yml` so every PR must pass lint, test, and build before merging.

## Reference Docs

- `Spec1.md` — product scope and functional requirements.
- `SPRINT_PLAN.md` — roadmap broken into sprints and DoD.
- `AGENTS.md` — contributor practices, repo structure, and command reference.
- `CLAUDE.md` — agent operating rules (Context7 usage, file ordering)..

## Data & Seeding

- Run the schema migration in `supabase/migrations/20241007T000000Z_initial_schema.sql`.
- Seed demo content by executing `supabase/seeds/initial_seed.sql` in the Supabase SQL editor (adds parents, litters, puppies, sample reservations/inquiries).
- Catalog routes (`/puppies`, `/puppies/[slug]`) revalidate every 60s; adjust `revalidate` in route files if content freshness requirements change.

## Media Guidelines

- Store hero and gallery assets under `public/` (e.g., `public/about/*`).
- Optimize imagery to WebP and AVIF between 1600–1920px on the longest edge and keep each file ≤400 KB.
- Strip EXIF metadata before committing; use descriptive `alt` text and supply blur placeholders for Next.js `<Image>` components.

## Email Notifications (Sprint 2 - Security Hardened)

- Contact form triggers email notifications via Resend API (owner gets inquiry details, customer gets confirmation).
- **Security**: All email templates implement HTML escaping to prevent XSS attacks from malicious user input.
- **Testing**: Email system uses factory pattern for proper testability; all tests pass with comprehensive coverage.
- Required environment variables: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `OWNER_EMAIL`.

## Contact & Analytics Stack (Sprint 2)

- Contact form (`components/contact-form.tsx`) posts to the server action in `app/contact/actions.ts`, which validates input with Zod, enforces Supabase-backed rate limits, and writes to the `inquiries` table.
- **Form UX Enhancement**: Form fields preserve user input on validation errors, preventing data loss and improving user experience.
- Captcha verification lives in `lib/captcha/hcaptcha.ts`; enable real keys for production or supply the same bypass token (`NEXT_PUBLIC_HCAPTCHA_BYPASS_TOKEN` / `HCAPTCHA_BYPASS_TOKEN`) locally to exercise the flow in tests.
- Crisp chat is injected via `components/crisp-chat.tsx`, sharing availability events with the sticky `ContactBar` and dispatching offline fallbacks to WhatsApp.
- `components/analytics-provider.tsx` wraps the app with a consent-aware GA4/Meta Pixel client. Accept/decline decisions update Consent Mode (`ad_user_data`, `ad_personalization`) and gate tracking for `contact_click`, `form_submit`, `form_success`, and `chat_open` events.
- Production contact info is sourced from `NEXT_PUBLIC_CONTACT_*` variables. Update `.env.local`, `.env.example`, and Vercel/GitHub secrets to keep the contact bar, Crisp copy, and analytics payloads in sync.

## Payment Integration (Sprint 3 & 4)

### Overview

- **Stripe Checkout Sessions**: Server-created sessions with hosted checkout and metadata
- **PayPal Smart Buttons**: Orders API v2 with server-side create/capture endpoints
- **Webhook Processing**: Automated fulfillment (Stripe + PayPal) with signature verification
- **Idempotency**: Multi-layer protection against duplicate charges
- **Email Notifications**: Automatic owner + customer emails on successful deposit
- **Server-Side Analytics**: GA4 `deposit_paid` events via Measurement Protocol ✅
- **Webhook Monitoring**: Health check endpoint + Slack/email alerts for failures ✅

### Stripe Setup

#### 1. Install Stripe CLI (for local webhook testing)

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Other platforms: https://stripe.com/docs/stripe-cli
```

#### 2. Authenticate and forward webhooks

```bash
# Login to Stripe account
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The CLI will display a webhook signing secret (`whsec_...`). Add this to your `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### 3. Test webhook events

```bash
# Trigger a test checkout.session.completed event
stripe trigger checkout.session.completed
```

#### 4. Implementation Notes

- Sessions are created via the server action in `app/puppies/[slug]/actions.ts`.
- Metadata persists `puppy_id`, `puppy_slug`, and `channel` for webhook fulfillment.
- Verified events are processed in `app/api/stripe/webhook/route.ts` → `lib/stripe/webhook-handler.ts`.

#### 5. Required Environment Variables

- `STRIPE_SECRET_KEY`: Get from [Stripe Dashboard > Developers > API Keys](https://dashboard.stripe.com/apikeys)
- `STRIPE_WEBHOOK_SECRET`: From Stripe CLI or Dashboard > Webhooks
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Public key for client-side (if using Checkout Sessions)

### PayPal Setup

#### 1. Create Sandbox Account

1. Visit [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Go to **Apps & Credentials** > **Sandbox**
3. Create a new app or use default app
4. Copy **Client ID** and **Secret**

#### 2. Configure Webhooks

1. In PayPal Dashboard, go to **Webhooks**
2. Click **Add Webhook**
3. Set webhook URL: `https://yourdomain.com/api/paypal/webhook`
4. Subscribe to events:
   - `CHECKOUT.ORDER.APPROVED`
   - `PAYMENT.CAPTURE.COMPLETED`
5. Copy the **Webhook ID** for signature verification

#### 3. Implementation Notes

- Smart Buttons live in `components/paypal-button.tsx` and call two internal API routes:
  - `POST /api/paypal/create-order` — validates puppy availability and issues an order.
  - `POST /api/paypal/capture` — captures the order and creates the reservation.
- Webhooks are verified in `app/api/paypal/webhook/route.ts` using `verify-webhook-signature`.
- Fulfillment logic runs through `lib/paypal/webhook-handler.ts`, reusing the reservation service.

#### 4. Required Environment Variables

- `PAYPAL_CLIENT_ID`: From Dashboard > Apps & Credentials
- `PAYPAL_CLIENT_SECRET`: From Dashboard > Apps & Credentials
- `PAYPAL_ENV`: Set to `sandbox` for testing, `live` for production
- `PAYPAL_WEBHOOK_ID`: From Dashboard > Webhooks (for signature verification)

### Server-Side Analytics (Optional)

For server-side conversion tracking:

#### GA4 Measurement Protocol

1. Go to **Google Analytics > Admin > Data Streams**
2. Select your web stream
3. Expand **Measurement Protocol API secrets**
4. Create a new secret
5. Add to `.env.local`:
   ```bash
   GA4_API_SECRET=your_secret_here
   ```

#### Meta Conversion API

1. Go to **Meta Events Manager > Settings**
2. Select **Conversions API**
3. Generate access token
4. Add to `.env.local`:
   ```bash
   META_CONVERSION_API_TOKEN=your_token_here
   ```

### Testing Payments Locally

#### Stripe Test Mode

- Use test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC
- [Full test card list](https://stripe.com/docs/testing#cards)

#### PayPal Sandbox

- Use sandbox buyer account from [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/accounts)
- Credentials are auto-generated (usually `sb-xxxxx@personal.example.com`)

### Scheduled Jobs

- The endpoint `POST /api/cron/expire-reservations` runs the Supabase helper `expire_pending_reservations()` to cancel stale holds and flip puppies back to `available`.
- Protect the route with a `CRON_SECRET` environment variable and configure your scheduler (e.g., Vercel Cron) to send `Authorization: Bearer <CRON_SECRET>`.
- Recommended cadence: every 1–5 minutes to keep the 15-minute TTL tight.

### Webhook Security

Both Stripe and PayPal webhooks implement signature verification to prevent unauthorized requests:

- **Stripe**: Uses `Stripe-Signature` header with HMAC-SHA256
- **PayPal**: Uses `verify-webhook-signature` API endpoint

**CRITICAL**: Never skip signature verification in production!

### Webhook Monitoring & Alerting (Sprint 3 Phase 6)

Monitor webhook health and get notified of failures:

#### Health Check Endpoint

Visit `/api/health/webhooks` to check webhook system health:

- Returns 200 OK if healthy, 503 if issues detected
- Provides metrics for Stripe and PayPal webhooks
- Tracks error rates, recent events, and last success/failure times

#### Alert Configuration

Configure email and/or Slack alerts for webhook failures:

```bash
# Email alerts (comma-separated list, defaults to OWNER_EMAIL)
ALERT_EMAILS=admin@example.com,ops@example.com

# Slack webhook URL (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

#### Alert Features

- **Email Alerts**: HTML templates with error details, customer context, and troubleshooting steps
- **Slack Alerts**: Rich formatting with error blocks and action buttons
- **Throttling**: 15-minute cooldown per event type to prevent spam
- **Non-blocking**: Alert delivery doesn't delay webhook responses

### Reservation Expiry (Sprint 3 Phase 7)

#### Overview

Pending reservations automatically expire after 15 minutes, preventing indefinite holds on puppies during payment flows.

#### Database Functions

- **`create_reservation_transaction()`**: Creates reservations with automatic 15-minute expiry
- **`expire_pending_reservations()`**: Cancels expired pending reservations and releases puppies
- **`check_puppy_availability()`**: Validates availability respecting active (non-expired) reservations

#### Automated Scheduling (pg_cron)

Reservation expiry runs automatically via **Supabase pg_cron** every 5 minutes. No external cron service or API endpoint needed.

**Setup** (already configured):

1. pg_cron extension enabled in Supabase
2. Scheduled job `expire-pending-reservations` runs `*/5 * * * *`
3. Calls `expire_pending_reservations()` database function directly

**Monitoring:**
Check job execution history:

```sql
SELECT
  jrd.start_time,
  jrd.end_time,
  (jrd.end_time - jrd.start_time) as duration,
  jrd.status,
  jrd.return_message
FROM cron.job_run_details jrd
JOIN cron.job j ON j.jobid = jrd.jobid
WHERE j.jobname = 'expire-pending-reservations'
ORDER BY jrd.start_time DESC
LIMIT 20;
```

**Manual Testing:**
Trigger expiry function directly:

```sql
SELECT expire_pending_reservations();
```

Expected return: Integer count of expired reservations

#### Migration

Apply the reservation expiry migration using the staged approach:

1. Navigate to Supabase SQL Editor
2. Execute each stage file in `supabase/migrations/` sequentially:
   - `stage1_create_reservation_transaction.sql` - Updates function with 15-min default + GRANT fix
   - `stage2_check_puppy_availability.sql` - Updates availability checker
   - `stage3_recreate_trigger.sql` - Refreshes trigger
   - `stage4_expire_pending_reservations.sql` - Updates expiry function
3. Run `verification_queries.sql` to validate migration success

## Theming & Tokens

- Light theme palette: `--bg #F9FAFB`, `--bg-card #FFFFFF`, `--text #111111`, `--text-muted #555555`, `--accent #FFB84D`, gradient `--accent-2-start #FF4D79 → --accent-2-end #FF7FA5`, aux navy `--accent-aux #0D1A44`, footer base `#E5E7EB`, borders `rgba(0,0,0,0.08)`, hover tint `rgba(0,0,0,0.04)`.
- Dark theme palette: `--bg #0D1A44`, `--bg-card #1C1C1C`, `--text #FFFFFF`, `--text-muted #D1D5DB`, `--accent #FFB84D`, same gradient, aux gold `#FFD166`, footer base `#0A0F24`, borders `rgba(255,255,255,0.12)`, hover tint `rgba(255,255,255,0.06)`.
- `components/theme-provider.tsx` + `components/theme-toggle.tsx` expose a light/dark/system switch (persisted via `localStorage`) that writes `data-theme="light" | "dark"` on `<html>`. All routes/components should rely on Tailwind utilities derived from these tokens (`bg-bg`, `text-muted`, `border-border`, `.bg-accent-gradient`) instead of hard-coded hex values. Update the palette in `app/globals.css` when brand colors shift.
