# Payment System Enhancements - Testing Guide

**Date:** January 9, 2026
**Version:** 1.0
**Scope:** Reservation status fix, Refund processing, Admin dashboard

---

## 📋 Overview of New Features

### Phase 1: Critical Reservation Status Fix ✅

- **What:** Automatic transition from `'pending'` → `'paid'` after successful payment
- **Why:** Prevents reservations from getting stuck or expiring incorrectly
- **Impact:** 100% reservation status accuracy

### Phase 2: Automated Refund Processing ✅

- **What:** Webhook-driven refund handling for Stripe and PayPal
- **Features:**
  - Automatic status update to `'refunded'`
  - Owner email notification with customer details
  - Customer email confirmation with transaction ID
  - Refund tracking in reservation notes

### Phase 3: Admin Reservations Dashboard ✅

- **What:** Complete admin interface for reservation management
- **Access:** `/admin/reservations`
- **Features:**
  - Filterable reservation list
  - Payment mismatch detection
  - Manual status overrides with audit logging
  - Full reservation details view

---

## 🤖 Automated Testing

### Run All Tests

```bash
# Run all webhook handler tests
npm run test -- lib/stripe/webhook-handler.test.ts lib/paypal/webhook-handler.test.ts

# Expected output:
# ✓ lib/stripe/webhook-handler.test.ts (19 tests)
# ✓ lib/paypal/webhook-handler.test.ts (10 tests)
# Tests  29 passed (29)
```

### Test Coverage by Feature

#### 1. Reservation Status Update Tests

**Stripe:**

```bash
npm run test -- lib/stripe/webhook-handler.test.ts -t "should successfully process paid checkout session"
```

**Expected behavior:**

- ✅ Reservation created
- ✅ Status updated to 'paid'
- ✅ `ReservationQueries.updateStatus` called with correct parameters
- ✅ Email notifications sent

**PayPal:**

```bash
npm run test -- lib/paypal/webhook-handler.test.ts -t "processes PAYMENT.CAPTURE.COMPLETED successfully"
```

**Expected behavior:**

- ✅ Reservation created
- ✅ Status updated to 'paid'
- ✅ Analytics tracked
- ✅ Emails sent

#### 2. Refund Processing Tests

**Stripe Refunds (5 tests):**

```bash
npm run test -- lib/stripe/webhook-handler.test.ts -t "charge.refunded"
```

**Test cases:**

- ✅ Should successfully process refund event
- ✅ Should handle missing payment intent
- ✅ Should handle reservation not found
- ✅ Should handle reservation update failure
- ✅ Should include refund details in notes

**PayPal Refunds (4 tests):**

```bash
npm run test -- lib/paypal/webhook-handler.test.ts -t "PAYMENT.CAPTURE.REFUNDED"
```

**Test cases:**

- ✅ Processes refund successfully
- ✅ Handles missing reservation
- ✅ Handles invalid resource
- ✅ Handles update failure

#### 3. Type Checking

```bash
npm run typecheck
```

**Expected output:**

```
✓ No TypeScript errors
✓ Strict mode enabled
✓ All types valid
```

#### 4. Linting

```bash
npm run lint
```

**Expected output:**

```
✓ 0 warnings
✓ 0 errors
```

---

## 🧪 Manual Testing Guide

### Prerequisites

1. **Access Requirements:**
   - Admin credentials for dashboard testing
   - Stripe test account access
   - PayPal sandbox account access

2. **Environment Setup:**

   ```bash
   # Ensure dev server is running
   npm run dev
   ```

3. **Stripe CLI (for webhook testing):**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

---

## Test Scenario 1: Reservation Status Fix

### Goal: Verify reservations automatically transition to 'paid' status

#### Step 1: Create a Test Reservation via Stripe

1. Navigate to a puppy page: `http://localhost:3000/puppies/[any-available-puppy-slug]`
2. Click "Reserve with Stripe" button
3. Complete checkout with test card: `4242 4242 4242 4242`
4. After payment, check the terminal logs

**Expected logs:**

```
[Stripe Webhook] Successfully created reservation ID: res_xxxxx
[Stripe Webhook] Reservation res_xxxxx marked as paid
[Stripe Webhook] Sending deposit emails
```

#### Step 2: Verify in Database

Connect to Supabase and run:

```sql
SELECT id, status, external_payment_id, created_at, updated_at
FROM reservations
WHERE external_payment_id = 'pi_xxxxx'  -- Use payment intent from logs
ORDER BY created_at DESC
LIMIT 1;
```

**Expected result:**

- ✅ `status` = `'paid'` (NOT 'pending')
- ✅ `external_payment_id` is populated
- ✅ `updated_at` is recent (within last minute)

#### Step 3: Verify Email Notifications

Check email inbox (or logs if in dev):

- ✅ Owner receives deposit notification with customer details
- ✅ Customer receives confirmation email

---

## Test Scenario 2: Stripe Refund Processing

### Goal: Verify automated refund handling

#### Step 1: Create a Paid Reservation

Follow Test Scenario 1 to create a paid reservation.

#### Step 2: Process Refund via Stripe Dashboard

1. Open Stripe Dashboard → Payments
2. Find the payment from Step 1
3. Click on payment → "Refund payment"
4. Enter full refund amount → Confirm

**OR use Stripe CLI:**

```bash
stripe refunds create --payment-intent=pi_xxxxx
```

#### Step 3: Verify Webhook Processing

Check terminal logs for:

```
[Stripe Webhook] Processing event: charge.refunded (ID: evt_xxxxx)
[Stripe Webhook] Processing refund for payment_intent: pi_xxxxx
[Stripe Webhook] Found reservation res_xxxxx for refund
[Stripe Webhook] Reservation res_xxxxx marked as refunded
```

#### Step 4: Verify Database Update

```sql
SELECT id, status, notes
FROM reservations
WHERE id = 'res_xxxxx'
```

**Expected result:**

- ✅ `status` = `'refunded'`
- ✅ `notes` contains refund details:
  ```
  Stripe Refund processed: $300.00 USD
  Transaction ID: re_xxxxx
  Refunded at: 2026-01-09T...
  Reason: requested_by_customer
  ```

#### Step 5: Verify Email Notifications

Check email inbox:

- ✅ Owner receives refund notification with:
  - Customer name and email
  - Refund amount
  - Transaction ID
  - Original reservation details
- ✅ Customer receives refund confirmation with:
  - Refund amount
  - Transaction ID
  - Expected refund timeline
  - Support contact information

---

## Test Scenario 3: PayPal Refund Processing

### Goal: Verify PayPal refund automation

#### Step 1: Create a Paid Reservation via PayPal

1. Navigate to puppy page
2. Click "Reserve with PayPal" button
3. Complete payment with sandbox buyer account
4. Verify reservation status = 'paid' (same as Scenario 1)

#### Step 2: Process Refund via PayPal Dashboard

1. Open PayPal Dashboard → Transactions
2. Find the capture from Step 1
3. Click "Refund" → Enter amount → Submit

#### Step 3: Verify Webhook Processing

Check logs for:

```
[PayPal Webhook] Received event PAYMENT.CAPTURE.REFUNDED (WH-xxxxx)
[PayPal Webhook] Processing refund for capture: CAPTURE-xxxxx
[PayPal Webhook] Found reservation res_xxxxx for refund
[PayPal Webhook] Reservation res_xxxxx marked as refunded
```

#### Step 4: Verify Database and Emails

Same verification as Stripe Refund (Steps 4-5)

---

## Test Scenario 4: Admin Reservations Dashboard

### Goal: Verify admin interface functionality

#### Step 1: Access Admin Dashboard

1. Log in as admin
2. Navigate to: `http://localhost:3000/admin/reservations`

**Expected:**

- ✅ Page loads successfully
- ✅ Reservations table displays
- ✅ Status filter buttons visible

#### Step 2: Test Filters

1. Click "Paid" filter
   - ✅ Only paid reservations shown
2. Click "Refunded" filter
   - ✅ Only refunded reservations shown
3. Click "All" filter
   - ✅ All reservations shown

#### Step 3: Test Payment Mismatch Detection

**Setup:** Create a test scenario with stuck pending reservation

1. In database, manually create a reservation:

```sql
INSERT INTO reservations (id, puppy_id, status, external_payment_id, payment_provider, created_at)
VALUES (
  gen_random_uuid(),
  '[any-valid-puppy-id]',
  'pending',
  'pi_test_mismatch',
  'stripe',
  NOW() - INTERVAL '20 minutes'
);
```

2. Refresh admin dashboard

**Expected:**

- ✅ Yellow alert banner appears at top
- ✅ Message: "Found 1 reservation(s) stuck in pending status with payment IDs"
- ✅ Link to pending reservations filter

#### Step 4: Test Manual Status Override

1. Find a pending reservation in the table
2. Click on reservation ID or details
3. Update status to 'paid' manually (future feature - UI not yet implemented)

**Alternative - via server action test:**

```typescript
// In browser console on admin page
const result = await fetch('/admin/reservations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'updateStatus',
    id: 'res_xxxxx',
    status: 'paid',
    reason: 'Manual override - testing',
  }),
});
```

4. Check database for audit trail:

```sql
SELECT notes FROM reservations WHERE id = 'res_xxxxx';
```

**Expected notes format:**

```
[Admin Override 2026-01-09T10:30:00Z] Status changed: pending → paid. Reason: Manual override - testing
```

#### Step 5: Test Summary Stats

At bottom of dashboard page:

- ✅ Total count matches database
- ✅ Paid count correct
- ✅ Pending count correct
- ✅ Refunded count correct
- ✅ Cancelled count correct

---

## Test Scenario 5: Historical Data Migration

### Goal: Verify migration fixed existing stuck reservations

#### Check Migration Applied

```sql
-- Check migration exists
SELECT version FROM supabase_migrations
WHERE version = '20260108000000';
```

**Expected:** 1 row returned

#### Verify No Stuck Reservations

```sql
-- Should return 0 rows
SELECT id, status, external_payment_id, created_at
FROM reservations
WHERE status = 'pending'
  AND external_payment_id IS NOT NULL
  AND created_at < NOW() - INTERVAL '1 hour';
```

**Expected:** 0 rows (all fixed by migration)

#### Check Audit Trails

```sql
SELECT id, status, notes
FROM reservations
WHERE notes LIKE '%Migration 2026-01-08%';
```

**Expected:** Reservations fixed by migration have note:

```
[Migration 2026-01-08] Status corrected from pending to paid (external payment confirmed)
```

---

## 🔍 Production Verification Checklist

### After Deployment to Production

#### 1. Smoke Test - Reservation Status

- [ ] Create test Stripe reservation
- [ ] Verify status = 'paid' immediately after payment
- [ ] Check email notifications received
- [ ] Verify no stuck pending reservations in database

#### 2. Smoke Test - Refund Processing

- [ ] Process test refund (Stripe)
- [ ] Verify status updated to 'refunded'
- [ ] Check refund emails received (owner + customer)
- [ ] Verify notes contain refund details

#### 3. Admin Dashboard

- [ ] Access `/admin/reservations`
- [ ] Verify all filters work
- [ ] Check payment mismatch detection
- [ ] Verify summary stats accurate

#### 4. Webhook Health

- [ ] Check `/api/health/webhooks`
- [ ] Verify all webhooks healthy
- [ ] Check error rates < 1%
- [ ] Verify recent events logged

#### 5. Database Integrity

```sql
-- All paid reservations should have payment IDs
SELECT COUNT(*) FROM reservations
WHERE status = 'paid' AND external_payment_id IS NULL;
-- Expected: 0

-- All refunded reservations should have refund notes
SELECT COUNT(*) FROM reservations
WHERE status = 'refunded' AND (notes IS NULL OR notes NOT LIKE '%Refund%');
-- Expected: 0

-- No stuck pending reservations (>1 hour with payment ID)
SELECT COUNT(*) FROM reservations
WHERE status = 'pending'
  AND external_payment_id IS NOT NULL
  AND created_at < NOW() - INTERVAL '1 hour';
-- Expected: 0
```

---

## 🚨 Troubleshooting

### Issue: Reservation stays in 'pending' after payment

**Check:**

1. Webhook received? Check `/api/health/webhooks`
2. Webhook signature valid? Check logs for signature errors
3. Status update called? Search logs for "marked as paid"

**Fix:**

- Manual override via admin dashboard
- Check webhook endpoint configuration

### Issue: Refund webhook not processing

**Check:**

1. Webhook subscribed to `charge.refunded` (Stripe) or `PAYMENT.CAPTURE.REFUNDED` (PayPal)?
2. Webhook signature valid?
3. Reservation found? Search logs for "No reservation found"

**Fix:**

- Add webhook subscription in provider dashboard
- Manually update status via admin

### Issue: Admin dashboard not showing reservations

**Check:**

1. Admin session valid? Try re-login
2. Database connection working?
3. RLS policies correct?

**Fix:**

- Clear session and re-authenticate
- Check Supabase connection

### Issue: Email notifications not sending

**Check:**

1. `RESEND_API_KEY` configured?
2. `RESEND_FROM_EMAIL` verified in Resend dashboard?
3. Check logs for email delivery errors

**Fix:**

- Verify Resend configuration
- Check email templates for errors
- Test Resend API directly

---

## 📊 Success Metrics

After testing is complete, verify:

- ✅ All 29 webhook handler tests passing
- ✅ TypeScript: 0 errors
- ✅ ESLint: 0 warnings
- ✅ Reservation status accuracy: 100%
- ✅ Refund processing: Automated for both providers
- ✅ Email notifications: Received for all events
- ✅ Admin dashboard: Fully functional
- ✅ No stuck pending reservations in database
- ✅ Audit trails present for all manual overrides

---

## 📝 Test Results Template

Use this template to document your test results:

```markdown
# Test Execution Report

**Date:** [Date]
**Tester:** [Name]
**Environment:** [Dev/Staging/Production]

## Automated Tests

- [ ] All 29 tests passing
- [ ] TypeScript check: PASS/FAIL
- [ ] ESLint check: PASS/FAIL

## Manual Tests

### Scenario 1: Reservation Status

- [ ] Test completed: YES/NO
- [ ] Status updated correctly: YES/NO
- [ ] Emails received: YES/NO
- [ ] Notes: [Any issues or observations]

### Scenario 2: Stripe Refund

- [ ] Test completed: YES/NO
- [ ] Status updated to refunded: YES/NO
- [ ] Emails received: YES/NO
- [ ] Notes in database: YES/NO
- [ ] Notes: [Any issues or observations]

### Scenario 3: PayPal Refund

- [ ] Test completed: YES/NO
- [ ] Status updated to refunded: YES/NO
- [ ] Emails received: YES/NO
- [ ] Notes: [Any issues or observations]

### Scenario 4: Admin Dashboard

- [ ] Dashboard accessible: YES/NO
- [ ] Filters working: YES/NO
- [ ] Mismatch detection: YES/NO
- [ ] Stats accurate: YES/NO
- [ ] Notes: [Any issues or observations]

### Scenario 5: Migration

- [ ] Migration applied: YES/NO
- [ ] No stuck reservations: YES/NO
- [ ] Audit trails present: YES/NO
- [ ] Notes: [Any issues or observations]

## Issues Found

[List any issues discovered during testing]

## Overall Status

- [ ] PASS - Ready for production
- [ ] CONDITIONAL PASS - Minor issues, can deploy with monitoring
- [ ] FAIL - Critical issues, do not deploy
```

---

## 🔄 Rollback Plan

If critical issues are discovered in production:

### Step 1: Immediate Actions

1. Monitor `/api/health/webhooks` for error rates
2. Check database for stuck reservations
3. Review error logs for patterns

### Step 2: Rollback Code (if needed)

```bash
# Revert to previous commit
git revert HEAD~3  # Revert last 3 commits
git push origin main
```

### Step 3: Database Cleanup (if needed)

```sql
-- If reservations are incorrectly marked, update them
UPDATE reservations
SET status = 'pending'
WHERE status = 'paid'
  AND updated_at > '2026-01-09'  -- After deployment
  AND [additional-conditions];

-- Add note about rollback
UPDATE reservations
SET notes = COALESCE(notes || E'\n\n', '') || '[Rollback 2026-01-09] Status reverted due to production issue'
WHERE [conditions];
```

### Step 4: Communication

- Notify team of rollback
- Document issues discovered
- Plan fix and re-deployment

---

**Document Version:** 1.0
**Last Updated:** January 9, 2026
**Maintainer:** Development Team
