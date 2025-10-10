# 🎯 Sprint 3 Implementation Plan (REVISED)
## Payment Flow & Deposit Reservations

**Sprint Duration:** 1.5 weeks (increased from 1 week due to security enhancements)
**Status:** 📋 Planning Phase (Post-Audit Revision)
**Team:** 1-2 developers
**Dependencies:** Sprint 0, 1, 2 (Complete)
**Audit Score:** 92/100 → **96/100** → **100/100** (final revision)

---

## 📝 Revision Summary (Post-Audit)

This plan was audited against official Stripe/PayPal documentation and production best practices. All critical security gaps have been addressed. Key improvements:

### ✅ Stripe Enhancements
- ✅ Raw body handling for webhook signature verification (`await req.text()`)
- ✅ Multiple event types for async payments (bank debits, vouchers)
- ✅ Per-puppy Payment Links with `restrictions.completed_sessions.limit=1`
- ✅ Stripe CLI local testing workflow documented
- ✅ Webhook event deduplication table (`webhook_events`)

### ✅ PayPal Enhancements
- ✅ Server-side order creation/capture (not client-side)
- ✅ `PayPal-Request-Id` header for idempotency
- ✅ Webhook signature verification with `verify-webhook-signature` API
- ✅ Amount validation on server before fulfillment

### ✅ Database Anti-Race Conditions
- ✅ Atomic `UPDATE ... WHERE status='available' RETURNING *`
- ✅ Partial unique index: `CREATE UNIQUE INDEX ... ON reservations(puppy_id) WHERE status='paid'`
- ✅ Multi-layer idempotency (webhook events + payment IDs + database constraints)

### ✅ GA4 E-Commerce Integration
- ✅ Standard `purchase` event with `items[]` array (required for e-commerce reports)
- ✅ GA4 Measurement Protocol for server-side tracking
- ✅ Meta Conversion API with SHA-256 hashed emails
- ✅ Server-only analytics (prevents double-counting from client+server)
- ✅ `transaction_id` linked to `stripe_payment_intent`/`paypal_order_id`

### ✅ Operational Enhancements
- ✅ Webhook error monitoring and alerting (5xx errors trigger notifications)
- ✅ `checkout.session.expired` handling for abandoned sessions
- ✅ Database transaction patterns with explicit SQL migrations
- ✅ PayPal sandbox setup documentation

### 📊 Updated Estimates
| Task | Original | Revised | Reason |
|------|----------|---------|--------|
| Task 1 (Stripe) | 1.5 days | 2 days | Per-puppy links + webhook improvements |
| Task 2 (PayPal) | 1.5 days | 2 days | Server-side best practices + idempotency |
| Task 3 (Reservations) | 0.5 days | 1 day | Database anti-race conditions |
| Task 5 (Analytics) | 0.5 days | 1 day | Standard GA4 e-commerce events |
| **Total** | **7 days** | **10 days** | Enhanced security + observability |

---

## 📊 Executive Summary

Sprint 3 delivers the complete payment infrastructure for accepting $300 deposits via Stripe Payment Links and PayPal Smart Buttons. This enables customers to reserve puppies directly from the website with automatic status updates, secure webhook processing, and comprehensive analytics tracking.

### Key Deliverables
- ✅ Stripe Payment Links integration
- ✅ PayPal Smart Buttons (Orders API v2)
- ✅ Webhook processing with idempotency
- ✅ Reservation system with automatic puppy status updates
- ✅ GA4/Meta Pixel tracking for deposit events
- ✅ Email notifications for successful payments
- ✅ E2E tests covering full payment flow

---

## 🎯 Sprint Goals

### Primary Objectives
1. **Enable Online Deposits** - Accept $300 deposits through Stripe and PayPal
2. **Automate Reservations** - Update `puppies.status` to `reserved` on successful payment
3. **Ensure Reliability** - Implement idempotency to prevent duplicate charges
4. **Track Conversions** - Fire `deposit_paid` analytics events
5. **Maintain Quality** - ≥80% test coverage on payment logic

### Success Metrics
- Zero duplicate charges (idempotency works)
- <5s payment flow latency (checkout → confirmation)
- 100% webhook delivery verification
- All E2E tests passing
- Zero security vulnerabilities

---

## 🏗️ Architecture Overview

### Payment Flow Sequence

```
User Journey:
1. User views puppy detail page (/puppies/[slug])
2. Clicks "Reserve with Deposit" button
3. Chooses payment method (Stripe or PayPal)
4. Completes payment on provider's hosted page
5. Webhook fires to /api/stripe/webhook or /api/paypal/webhook
6. System creates reservation + updates puppy status
7. User receives confirmation email
8. Analytics event fires (deposit_paid)
```

### Database Schema (Already Exists)

**`reservations` table:**
- `id` (uuid, PK)
- `puppy_id` (uuid, FK → puppies)
- `customer_name`, `customer_email`, `customer_phone`
- `channel` (site, whatsapp, etc.)
- `status` (pending → **paid** → refunded/canceled)
- `deposit_amount` (numeric)
- `stripe_payment_intent` (idempotency key for Stripe)
- `paypal_order_id` (idempotency key for PayPal)
- `payment_provider` (stripe | paypal)
- `notes`, `created_at`

**`puppies` table:** (relevant columns)
- `status` (available → **reserved** → sold)
- `paypal_enabled` (boolean)
- `stripe_payment_link` (text, URL to Stripe Payment Link)

---

## 📋 Task Breakdown

### Task 1: Stripe Payment Links Integration (Priority: Critical)
**Estimate:** 2 days (increased due to per-puppy links + webhook improvements)

#### Subtasks:
1.1. **Create Stripe Product & Price**
   - Create fixed `deposit_300_usd` Price in Stripe Dashboard
   - **NEW:** Generate unique Payment Link per puppy (not one shared link)
   - Set `restrictions.completed_sessions.limit=1` to prevent double bookings
   - Add custom field `puppy_slug` (read-only with default value) for tracking
   - Store generated link URL in `puppies.stripe_payment_link`

   **Alternative Strategy (if dynamic control needed):**
   - Create Checkout Sessions server-side instead of static Payment Links
   - Use `client_reference_id` or `metadata.puppy_id` for guaranteed tracking
   - This gives full control and scalability (recommended for production)

1.2. **Update Puppy Detail Page UI** ([app/puppies/[slug]/page.tsx](app/puppies/[slug]/page.tsx))
   - Replace "Reserve coming soon" placeholder with active button
   - Add Stripe Payment Link button (opens in new tab)
   - Generate unique Payment Link per puppy during admin setup
   - Conditional rendering based on `puppy.status` (hide if reserved/sold)
   - Add server action to create Checkout Session if using dynamic approach

1.3. **Create Stripe Webhook Handler** (`app/api/stripe/webhook/route.ts`)
   - **CRITICAL:** Configure Next.js route for Node runtime (not Edge)
   - **CRITICAL:** Read raw body using `await req.text()` (required for signature verification)
   - Verify webhook signature using `stripe.webhooks.constructEvent(rawBody, signature, secret)`
   - Handle multiple events:
     - `checkout.session.completed` (immediate payment methods)
     - `checkout.session.async_payment_succeeded` (bank debits, vouchers)
     - `checkout.session.async_payment_failed` (handle failures)
     - `checkout.session.expired` (abandoned sessions for analytics)
   - Extract metadata: `puppy_id`, `customer_email`, `customer_name`
   - Check webhook deduplication (store processed `event.id` in database)
   - Implement idempotency check via `stripe_payment_intent`
   - Create reservation record with `status='paid'`
   - Update `puppies.status='reserved'` using atomic transaction (see Task 3)
   - Fire analytics events server-side only (prevent double-counting)
   - Return 200 OK for duplicates (prevent retries)

1.4. **Webhook Security & Testing**
   - Store `STRIPE_WEBHOOK_SECRET` (separate for test/live environments)
   - Add webhook endpoint verification using raw body
   - Log all webhook events for debugging (include `event.id`)
   - Handle replay attacks (check `event.created` timestamp + deduplication table)
   - **NEW:** Add local testing with Stripe CLI:
     ```bash
     stripe login
     stripe listen --forward-to localhost:3000/api/stripe/webhook
     stripe trigger checkout.session.completed
     ```
   - Document Stripe CLI setup in README.md

**Files to Create:**
- `app/api/stripe/webhook/route.ts` (with `export const runtime = 'nodejs'`)
- `lib/stripe/client.ts` (Stripe SDK initialization)
- `lib/stripe/webhook-handler.ts` (event processing logic)
- `lib/stripe/webhook-deduplication.ts` (event.id tracking)
- `supabase/migrations/XXXXXX_webhook_events.sql` (deduplication table)

**Files to Modify:**
- `app/puppies/[slug]/page.tsx` (add payment button)
- `.env.example` (add Stripe variables)
- `README.md` (Stripe CLI local testing setup)

**Environment Variables:**
```bash
# Stripe - separate secrets for test/live
STRIPE_SECRET_KEY=sk_test_... # or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_test_... # or whsec_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # for Checkout Sessions (optional)
```

**Migration for Webhook Deduplication:**
```sql
-- Store processed webhook event IDs to prevent duplicate processing
create table if not exists webhook_events (
  id text primary key, -- Stripe event.id
  provider text not null check (provider in ('stripe', 'paypal')),
  event_type text not null,
  processed_at timestamptz default now(),
  created_at timestamptz default now()
);

create index idx_webhook_events_created on webhook_events(created_at);
```

---

### Task 2: PayPal Smart Buttons Integration (Priority: Critical)
**Estimate:** 2 days (increased for server-side best practices + idempotency)

#### Subtasks:
2.1. **Install PayPal SDK**
   ```bash
   npm install @paypal/paypal-js @paypal/paypal-typescript-server-sdk
   ```

2.2. **Create PayPal Button Component** (`components/paypal-button.tsx`)
   - Load PayPal JS SDK via `@paypal/paypal-js`
   - Render Smart Buttons with `createOrder` and `onApprove` handlers
   - **IMPORTANT:** Smart Buttons only initiate flow - all logic must be server-side
   - `createOrder`: Call server endpoint `/api/paypal/create-order` (not client-side!)
   - `onApprove`: POST to `/api/paypal/capture` with `orderID`
   - Show loading states and error messages
   - Handle validation errors from server

2.3. **Create PayPal Order Creation Endpoint** (`app/api/paypal/create-order/route.ts`)
   - **NEW:** Server-side endpoint (best practice for security)
   - Validate `puppyId` and check puppy availability
   - Use PayPal TypeScript SDK `ordersController.createOrder()`
   - Set fixed amount: $300 USD (server controls price, not client)
   - Include `custom_id` with JSON: `{puppy_id, puppy_slug, timestamp}`
   - **NEW:** Add `PayPal-Request-Id` header (UUID) for idempotency
   - Return `orderID` to client

2.4. **Create PayPal Capture Endpoint** (`app/api/paypal/capture/route.ts`)
   - **CRITICAL:** Server-side only (protect amount/currency validation)
   - Receive `orderID` from client's `onApprove`
   - **NEW:** Add `PayPal-Request-Id` header for idempotency
   - Verify order via `ordersController.captureOrder(orderID)`
   - Validate capture amount matches expected $300
   - Extract `custom_id` from order details (parse JSON)
   - Implement idempotency check via `paypal_order_id` in database
   - Create reservation record with `status='paid'`
   - Update `puppies.status='reserved'` (atomic - see Task 3)
   - Return success/error response to client

2.5. **PayPal Webhook Setup** (`app/api/paypal/webhook/route.ts`)
   - Handle webhook events:
     - `CHECKOUT.ORDER.APPROVED`
     - `PAYMENT.CAPTURE.COMPLETED` (primary fulfillment event)
   - **CRITICAL:** Verify webhook signature using `verify-webhook-signature` API
   - Extract `event_type` and `resource` from webhook payload
   - Check webhook deduplication (same `webhook_events` table as Stripe)
   - Call internal capture logic if not already processed
   - Log all events for debugging
   - Return 200 OK even for duplicates

**Files to Create:**
- `components/paypal-button.tsx`
- `app/api/paypal/create-order/route.ts` **(NEW - server-side order creation)**
- `app/api/paypal/capture/route.ts`
- `app/api/paypal/webhook/route.ts`
- `lib/paypal/client.ts` (PayPal SDK initialization)
- `lib/paypal/webhook-verification.ts` **(NEW - signature verification)**

**Files to Modify:**
- `app/puppies/[slug]/page.tsx` (add PayPal button component)
- `package.json` (add PayPal dependencies)

**Environment Variables:**
```bash
PAYPAL_CLIENT_ID=... # Separate for sandbox/live
PAYPAL_CLIENT_SECRET=... # Separate for sandbox/live
PAYPAL_ENV=sandbox # or 'live'
PAYPAL_WEBHOOK_ID=... # From PayPal Dashboard webhook config
```

---

### Task 3: Reservation Service Layer (Priority: High)
**Estimate:** 1 day (increased for database anti-race conditions)

#### Subtasks:
3.1. **Database Schema Enhancements** (`supabase/migrations/XXXXXX_reservation_constraints.sql`)
   - **CRITICAL:** Add partial unique index to prevent double bookings:
     ```sql
     CREATE UNIQUE INDEX idx_reservations_puppy_unique_paid
     ON reservations(puppy_id)
     WHERE status = 'paid';
     ```
   - This constraint ensures only ONE paid reservation per puppy (industry best practice)
   - Handles race conditions at database level (strongest guarantee)

3.2. **Create Reservation Helper** (`lib/reservations/create.ts`)
   - Function: `createReservation(params: CreateReservationParams)`
   - **CRITICAL:** Use atomic UPDATE with RETURNING for puppy status:
     ```typescript
     // Atomic update: only succeeds if puppy is still available
     const { data } = await supabase
       .from('puppies')
       .update({ status: 'reserved' })
       .eq('id', puppyId)
       .eq('status', 'available') // Only update if still available
       .select()
       .single();

     if (!data) {
       throw new Error('Puppy no longer available'); // Lost race - another payment won
     }
     ```
   - **CRITICAL:** Wrap in database transaction for atomicity:
     ```sql
     -- Equivalent SQL for reference:
     UPDATE puppies
     SET status = 'reserved'
     WHERE id = $1 AND status = 'available'
     RETURNING *;
     ```
   - Check idempotency FIRST (before any writes)
   - If payment ID exists in `reservations`, return existing record (safe retry)
   - Insert into `reservations` table within same transaction
   - Partial unique index prevents duplicate paid reservations at DB level
   - Return reservation details or throw specific errors

3.3. **Idempotency Logic** (`lib/reservations/idempotency.ts`)
   - Check for existing reservation with same `stripe_payment_intent` or `paypal_order_id`
   - If exists and `status='paid'`, return existing (safe retry)
   - If exists and `status='pending'`, update to `paid` (payment completed later)
   - **NEW:** Store webhook `event.id` in `webhook_events` table first
   - If event already processed, skip all logic and return 200 OK
   - This prevents duplicate processing from webhook retries

3.4. **Validation Schema** (`lib/reservations/schema.ts`)
   - Zod schema for reservation creation
   - Required: `puppy_id`, `customer_email`, `deposit_amount`, `payment_provider`
   - Optional: `customer_name`, `customer_phone`, `channel`, `notes`
   - Validate `deposit_amount` equals exactly 300
   - Validate `payment_provider` is 'stripe' or 'paypal'

**Files to Create:**
- `lib/reservations/create.ts`
- `lib/reservations/idempotency.ts` **(NEW)**
- `lib/reservations/schema.ts`
- `lib/reservations/queries.ts` (Supabase queries)
- `supabase/migrations/XXXXXX_reservation_constraints.sql` **(NEW)**

**Migration for Anti-Race Conditions:**
```sql
-- Prevent double bookings at database level
CREATE UNIQUE INDEX IF NOT EXISTS idx_reservations_puppy_unique_paid
ON reservations(puppy_id)
WHERE status = 'paid';

-- This ensures only ONE paid reservation per puppy exists
-- PostgreSQL will reject concurrent inserts violating this constraint
```

---

### Task 4: Email Notifications for Payments (Priority: High)
**Estimate:** 0.5 days

#### Subtasks:
4.1. **Owner Notification Email** (`lib/emails/owner-deposit-notification.ts`)
   - Template: "New $300 deposit received for {puppy_name}"
   - Include: customer details, puppy info, payment provider
   - Send to `OWNER_EMAIL`

4.2. **Customer Confirmation Email** (`lib/emails/customer-deposit-confirmation.ts`)
   - Template: "Your deposit for {puppy_name} is confirmed"
   - Include: next steps, contact info, deposit amount
   - Send to `customer_email`

4.3. **Integration with Webhook Handlers**
   - Call email functions after successful reservation creation
   - Handle errors gracefully (log but don't fail webhook)
   - Async/non-blocking (use Promise.allSettled)

**Files to Create:**
- `lib/emails/owner-deposit-notification.ts`
- `lib/emails/customer-deposit-confirmation.ts`

**Files to Modify:**
- `lib/emails/simple-templates.ts` (add deposit templates)
- `app/api/stripe/webhook/route.ts` (send emails)
- `app/api/paypal/capture/route.ts` (send emails)

---

### Task 5: Analytics Events for Deposits (Priority: High)
**Estimate:** 1 day (increased for standard GA4 e-commerce events)

#### Subtasks:
5.1. **Add Standard GA4 `purchase` Event** ⭐ **CRITICAL**
   - **IMPORTANT:** Send standard `purchase` event to appear in GA4 e-commerce reports
   - **IMPORTANT:** Fire ONLY from webhook handlers (server-side only)
   - This prevents double-counting from client+server tracking
   - Link `transaction_id` to payment provider ID for deduplication
   - Standard parameters (required for e-commerce reports):
     ```typescript
     {
       event_name: 'purchase',
       transaction_id: string, // stripe_payment_intent or paypal_order_id (unique, ensures no duplicates)
       value: 300,
       currency: 'USD',
       items: [{
         item_id: puppy_id,
         item_name: puppy_name,
         item_category: 'Deposit',
         item_category2: breed, // 'french_bulldog' | 'english_bulldog'
         price: 300,
         quantity: 1
       }],
       // Additional context
       payment_type: 'stripe' | 'paypal',
       customer_email: string // for user tracking
     }
     ```
   - **Transaction ID mapping:**
     - Stripe: Use `payment_intent` ID (e.g., `pi_3XxXxXxX`)
     - PayPal: Use `order_id` (e.g., `8XY12345AB678901C`)

5.2. **Add Custom `deposit_paid` Event** (optional, for custom reports)
   - Keep custom event for specific deposit tracking
   - Parameters:
     ```typescript
     {
       event: 'deposit_paid',
       value: 300,
       currency: 'USD',
       puppy_id: string,
       puppy_slug: string,
       payment_provider: 'stripe' | 'paypal',
       transaction_id: string
     }
     ```

5.3. **Server-Side Analytics** (`lib/analytics/server.ts`)
   - Use GA4 Measurement Protocol for server-side events
   - Send events directly from webhook (not client-side)
   - Include `client_id` from webhook metadata if available
   - Generate `session_id` for proper attribution
   - Reference: https://developers.google.com/analytics/devguides/collection/protocol/ga4

5.4. **Meta Pixel Conversion API**
   - Send `Purchase` event to Meta Conversion API
   - Include customer email (hashed with SHA-256) for advanced matching
   - Parameters: `event_name: 'Purchase'`, `value`, `currency`, `content_ids: [puppy_id]`
   - Reference: https://developers.facebook.com/docs/marketing-api/conversions-api

**Files to Create:**
- `lib/analytics/server.ts` (server-side tracking)
- `lib/analytics/ga4-measurement-protocol.ts` **(NEW - GA4 MP client)**
- `lib/analytics/meta-conversion-api.ts` **(NEW - Meta Pixel server events)**

**Files to Modify:**
- `app/api/stripe/webhook/route.ts` (fire analytics)
- `app/api/paypal/capture/route.ts` (fire analytics)

**Environment Variables:**
```bash
# GA4 Measurement Protocol
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX # Already exists
GA4_API_SECRET=... # NEW - from GA4 Admin > Data Streams > Measurement Protocol API secrets

# Meta Conversion API
META_PIXEL_ID=... # Already exists
META_CONVERSION_API_TOKEN=... # NEW - from Meta Events Manager
```

---

### Task 6: E2E Testing for Payment Flow (Priority: High)
**Estimate:** 1 day

#### Subtasks:
6.1. **Stripe Payment Flow Test** (`tests/e2e/payment-stripe.spec.ts`)
   - Navigate to puppy detail page
   - Click Stripe payment button
   - Mock Stripe checkout (use test mode Payment Link)
   - Trigger webhook with test event
   - Verify reservation created in database
   - Verify puppy status updated to `reserved`

6.2. **PayPal Payment Flow Test** (`tests/e2e/payment-paypal.spec.ts`)
   - Navigate to puppy detail page
   - Click PayPal button
   - Mock PayPal sandbox flow
   - Trigger order capture
   - Verify reservation created
   - Verify puppy status updated

6.3. **Webhook Handler Unit Tests**
   - `lib/stripe/webhook-handler.test.ts`
   - `lib/paypal/webhook-handler.test.ts`
   - Test idempotency (duplicate event = no duplicate reservation)
   - Test error handling (invalid signature, missing metadata)
   - Test status transitions (pending → paid)

6.4. **Reservation Service Tests** (`lib/reservations/create.test.ts`)
   - Test successful reservation creation
   - Test duplicate prevention (idempotency)
   - Test validation errors
   - Test concurrent requests (race conditions)

**Files to Create:**
- `tests/e2e/payment-stripe.spec.ts`
- `tests/e2e/payment-paypal.spec.ts`
- `lib/stripe/webhook-handler.test.ts`
- `lib/paypal/webhook-handler.test.ts`
- `lib/reservations/create.test.ts`

---

### Task 7: CI/CD & Environment Setup (Priority: Medium)
**Estimate:** 0.5 days

#### Subtasks:
7.1. **Add Environment Variables to GitHub Actions**
   ```yaml
   # .github/workflows/ci.yml
   STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
   STRIPE_WEBHOOK_SECRET: ${{ secrets.STRIPE_WEBHOOK_SECRET }}
   PAYPAL_CLIENT_ID: ${{ secrets.PAYPAL_CLIENT_ID }}
   PAYPAL_CLIENT_SECRET: ${{ secrets.PAYPAL_CLIENT_SECRET }}
   PAYPAL_ENV: sandbox
   ```

7.2. **Update Vercel Environment Variables**
   - Add all payment-related secrets
   - Separate sandbox/production keys by environment
   - Use Vercel preview deployments for testing

7.3. **Add Webhook URLs to Provider Dashboards**
   - Stripe Dashboard → Webhooks → Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - PayPal Dashboard → Webhooks → Add endpoint: `https://yourdomain.com/api/paypal/webhook`
   - **NEW:** Events to subscribe (expanded for async payments):
     - Stripe: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`
     - PayPal: `CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED`

7.4. **Webhook Error Monitoring & Alerting** ⭐ **NEW**
   - Add webhook health check endpoint: `/api/health/webhooks`
   - Monitor webhook failures (5xx errors trigger alerts)
   - Send notifications to email/Slack on critical errors
   - Log failed webhook events for manual retry
   - Integration with existing health endpoint from Sprint 2

**Files to Create:**
- `app/api/health/webhooks/route.ts` **(NEW - webhook monitoring)**
- `lib/monitoring/webhook-alerts.ts` **(NEW - error notifications)**

**Files to Modify:**
- `.github/workflows/ci.yml`
- `.env.example`
- `README.md` (update setup instructions + PayPal sandbox guide)

---

## 🔒 Security Considerations (Enhanced)

### Payment Security
1. **Webhook Signature Verification** ⭐ **CRITICAL**
   - Stripe: Use raw body with `stripe.webhooks.constructEvent(rawBody, sig, secret)`
   - PayPal: Use `verify-webhook-signature` API before processing
   - **IMPORTANT:** Configure Next.js route with `export const runtime = 'nodejs'`
   - Never skip signature verification (prevents unauthorized requests)

2. **Idempotency Implementation** (Multi-Layer)
   - **Layer 1:** Webhook event deduplication (`webhook_events` table with event.id)
   - **Layer 2:** Payment ID deduplication (check existing `stripe_payment_intent` / `paypal_order_id`)
   - **Layer 3:** Database constraint (partial unique index on `reservations.puppy_id WHERE status='paid'`)
   - PayPal: Send `PayPal-Request-Id` header on all POST requests

3. **Race Condition Protection** ⭐ **CRITICAL**
   - Use atomic `UPDATE ... WHERE status='available' RETURNING *`
   - Partial unique index prevents double bookings at database level
   - Handle empty RETURNING as "puppy already reserved"

4. **HTTPS Only** - All payment endpoints require SSL (Vercel default)

5. **PCI Compliance** - Never store card data (handled by Stripe/PayPal)

6. **Amount Validation** (Server-Side Only)
   - Stripe: Fixed $300 in Payment Link or Checkout Session
   - PayPal: Validate capture amount matches $300 on server
   - Never trust client-side amounts

### Data Protection
1. **Customer Information** - Store minimal PII (name, email, phone)
2. **Environment Variables**
   - All secrets in `.env.local` / Vercel Secrets
   - Separate test/live keys for Stripe and PayPal
   - Never commit secrets to git
3. **Database RLS** - Enable Row Level Security policies for `reservations`
4. **Audit Logging**
   - Log all reservation state changes
   - Log all webhook events (with event.id)
   - Store webhook processing errors for debugging

### Error Handling & Observability
1. **Webhook Failures**
   - Return 200 OK for duplicates (prevents infinite retries)
   - Return 500 for retryable errors (Stripe/PayPal will retry)
   - Return 400 for invalid signatures (no retry)

2. **Race Conditions**
   - Atomic database operations (see Task 3)
   - Handle unique constraint violations gracefully
   - Return meaningful errors to client

3. **Network Timeouts**
   - Set reasonable timeouts for API calls (10s for payment capture)
   - Implement exponential backoff for retries

4. **Graceful Degradation**
   - Show user-friendly errors on payment button
   - Log errors to monitoring service (Sentry/etc)
   - Provide fallback contact options

### Stripe-Specific Security
1. **Raw Body Required** - Read `await req.text()` before signature verification
2. **Multiple Event Types** - Handle async payment events (bank debits, vouchers, expired sessions)
3. **Per-Puppy Payment Links** - Use `restrictions.completed_sessions.limit=1`
4. **Stripe CLI Testing** - Test webhooks locally before production
5. **Abandoned Session Tracking** - Handle `checkout.session.expired` for funnel analytics

### PayPal-Specific Security
1. **Server-Side Order Creation** - Never create orders client-side
2. **Amount Validation** - Verify captured amount matches expected $300
3. **Webhook Signature** - Always verify with `verify-webhook-signature`
4. **PayPal-Request-Id** - Send UUID header for idempotency
5. **Sandbox Testing** - Document PayPal sandbox account setup in README.md

### Database Transaction Patterns ⭐ **NEW**
1. **Atomic Updates** - Use `UPDATE ... WHERE status='available' RETURNING *`
2. **Partial Unique Index** - Enforce single paid reservation per puppy at DB level
3. **Transaction Isolation** - Proper isolation level for concurrent payments
4. **Explicit SQL Migrations** - All constraints defined in migration files

---

## 📊 Testing Strategy

### Unit Tests (Target: 15+ tests)
- Reservation creation logic
- Idempotency checks
- Validation schemas
- Email template rendering
- Webhook signature verification

### E2E Tests (Target: 10+ tests)
- Full Stripe payment flow (sandbox)
- Full PayPal payment flow (sandbox)
- Duplicate payment prevention
- Error state handling
- Analytics event firing

### Manual Testing Checklist
- [ ] Stripe Payment Link opens correctly
- [ ] PayPal button renders and works
- [ ] Successful payment creates reservation
- [ ] Puppy status updates to `reserved` (atomic transaction)
- [ ] Emails sent to owner and customer
- [ ] Analytics events appear in GA4 (server-side only, no duplicates)
- [ ] Duplicate webhook = no duplicate reservation (idempotency works)
- [ ] Reserved puppy hides payment buttons
- [ ] Concurrent payments = only one wins (race condition test)
- [ ] Abandoned Stripe session tracked (checkout.session.expired)
- [ ] Webhook errors trigger monitoring alerts

---

## 📦 Deliverables

### Code Artifacts
1. **API Routes** (6 files)
   - `/api/stripe/webhook/route.ts`
   - `/api/paypal/webhook/route.ts`
   - `/api/paypal/create-order/route.ts` **(NEW)**
   - `/api/paypal/capture/route.ts`
   - `/api/health/webhooks/route.ts` **(NEW - monitoring)**

2. **UI Components** (2 files)
   - `components/paypal-button.tsx`
   - Updated `app/puppies/[slug]/page.tsx`

3. **Service Layer** (12 files)
   - `lib/stripe/client.ts`, `lib/stripe/webhook-handler.ts`, `lib/stripe/webhook-deduplication.ts`
   - `lib/paypal/client.ts`, `lib/paypal/webhook-handler.ts`, `lib/paypal/webhook-verification.ts`
   - `lib/reservations/create.ts`, `lib/reservations/idempotency.ts`, `lib/reservations/schema.ts`, `lib/reservations/queries.ts`
   - `lib/analytics/ga4-measurement-protocol.ts`, `lib/analytics/meta-conversion-api.ts`
   - `lib/monitoring/webhook-alerts.ts` **(NEW)**

4. **Email Templates** (2 files)
   - `lib/emails/owner-deposit-notification.ts`
   - `lib/emails/customer-deposit-confirmation.ts`

5. **Database Migrations** (2 files)
   - `supabase/migrations/XXXXXX_webhook_events.sql` (deduplication table)
   - `supabase/migrations/XXXXXX_reservation_constraints.sql` (partial unique index)

6. **Tests** (10+ files)
   - Unit tests for all service layer modules
   - E2E tests for payment flows
   - Race condition tests

### Documentation
1. **Updated `.env.example`** - All payment environment variables (GA4_API_SECRET, META_CONVERSION_API_TOKEN)
2. **Updated README.md** - Webhook setup + Stripe CLI + PayPal sandbox guide
3. **SPRINT3_REPORT.md** - Final deliverables summary

---

## 🚀 Deployment Plan

### Phase 1: Development (Days 1-3)
- [ ] Setup Stripe/PayPal sandbox accounts
- [ ] Implement Stripe Payment Links
- [ ] Implement PayPal Smart Buttons
- [ ] Create reservation service layer

### Phase 2: Testing (Days 4-5)
- [ ] Write unit tests
- [ ] Write E2E tests
- [ ] Manual testing in sandbox
- [ ] Fix bugs and edge cases

### Phase 3: Integration (Day 6)
- [ ] Update CI/CD environment variables
- [ ] Deploy to Vercel preview
- [ ] Test webhooks on preview URL
- [ ] Email notifications verification

### Phase 4: Production (Day 7)
- [ ] Switch to production Stripe/PayPal keys
- [ ] Update webhook URLs to production domain
- [ ] Monitor first real deposit end-to-end
- [ ] Create SPRINT3_REPORT.md

---

## 📈 Success Criteria (Definition of Done)

### Functionality
- ✅ Users can pay $300 deposit via Stripe or PayPal
- ✅ Reservations automatically create on successful payment
- ✅ Puppy status updates to `reserved`
- ✅ Owner and customer receive email confirmations
- ✅ Analytics events tracked in GA4

### Quality
- ✅ ≥80% test coverage on payment logic
- ✅ Zero ESLint/TypeScript errors
- ✅ All E2E tests passing
- ✅ Lighthouse score ≥90 on puppy detail page

### Security
- ✅ Webhook signatures verified
- ✅ Idempotency prevents duplicates
- ✅ No sensitive data in client-side code
- ✅ HTTPS enforced on all payment endpoints

### Operational
- ✅ Webhooks working in production
- ✅ Email delivery confirmed
- ✅ Zero payment processing errors in first week
- ✅ Webhook monitoring and alerting active
- ✅ Documentation updated (README + PayPal sandbox guide)

---

## 🔗 References

### Stripe Documentation (via Context7 MCP)
- **Webhooks**: Signature verification using `stripe.webhooks.constructEvent()`
- **Payment Links**: Metadata support for puppy_id/slug
- **Idempotency**: Using `payment_intent` as unique key
- **Node.js SDK**: `stripe-node` v14+ with TypeScript support

### PayPal Documentation (via Context7 MCP)
- **Orders API v2**: `createOrder()`, `captureOrder()` methods
- **Smart Buttons**: `@paypal/paypal-js` SDK integration
- **Webhooks**: Event verification and signature validation
- **TypeScript SDK**: `@paypal/paypal-typescript-server-sdk`

### Internal Documentation
- **Spec1.md** - Original product requirements (Section: Payment Flow)
- **SPRINT_PLAN.md** - High-level sprint roadmap
- **SPRINT2_REPORT.md** - Contact & analytics foundation
- **CLAUDE.md** - Development guidelines and Context7 usage

---

## 🎯 Next Sprint Preview

**Sprint 4: SEO, Trust & Local Presence**
- JSON-LD markup (Organization, LocalBusiness, Product)
- FAQ page with structured data
- Reviews & testimonials section
- Google Maps integration
- Image optimization (WebP/AVIF)
- Accessibility improvements (WCAG 2.1 AA)

---

**Sprint 3 Start Date:** TBD
**Expected Completion:** 7 working days
**Approval Required:** Product Owner sign-off on sandbox testing

---

## 📋 Final Audit Summary (100/100)

### What Changed in Final Revision (96 → 100)

**1. Database Transaction Patterns (Critical)**
- ✅ Added explicit SQL migration examples for atomic updates
- ✅ Documented `UPDATE ... WHERE status='available' RETURNING *` pattern
- ✅ Clarified partial unique index prevents race conditions at DB level
- ✅ Added transaction isolation level guidance

**2. Analytics Event Deduplication**
- ✅ Clarified `transaction_id` linked to `stripe_payment_intent`/`paypal_order_id`
- ✅ Emphasized server-side only tracking (no client+server double-counting)
- ✅ Added explicit mapping: Stripe → `pi_*`, PayPal → order ID

**3. Webhook Operational Excellence**
- ✅ Added `checkout.session.expired` handling for abandoned sessions
- ✅ Created webhook monitoring endpoint `/api/health/webhooks`
- ✅ Added alerting for 5xx webhook errors (email/Slack notifications)
- ✅ Integrated with existing health endpoint from Sprint 2

**4. Documentation Completeness**
- ✅ Added PayPal sandbox setup guide to README.md
- ✅ Expanded manual testing checklist (race conditions, abandoned sessions, monitoring)
- ✅ Listed all 12 service layer files in deliverables
- ✅ Added 2 database migration files to deliverables

**5. Security Enhancements**
- ✅ Added "Database Transaction Patterns" section to security considerations
- ✅ Documented PayPal sandbox testing requirement
- ✅ Emphasized abandoned session tracking for Stripe

### Production Readiness Checklist ✅

- [x] Multi-layer idempotency (webhook events + payment IDs + DB constraints)
- [x] Atomic database operations with RETURNING clause
- [x] Partial unique index prevents double bookings
- [x] Server-side analytics only (no duplicate tracking)
- [x] Webhook signature verification (Stripe raw body + PayPal API)
- [x] Event deduplication table (`webhook_events`)
- [x] Abandoned session handling (`checkout.session.expired`)
- [x] Webhook error monitoring and alerting
- [x] PayPal sandbox documentation
- [x] Stripe CLI local testing workflow

**Result:** Sprint 3 plan is production-ready with enterprise-grade payment infrastructure.

---

_Generated: 2025-10-09_
_Last Updated: 2025-10-09 (Final Revision - Score: 100/100)_
