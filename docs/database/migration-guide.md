# Migration Guide: Reservation Expiry Enforcement

## Overview

This guide walks you through applying the reservation expiry enforcement migration to your Supabase database. This migration enables automatic 15-minute expiry for pending reservations.

**Migration Files Location**: `supabase/migrations/stage*.sql`

**Total Time Required**: 15-20 minutes

---

## Prerequisites

✅ **Before you begin, ensure:**

1. You have access to your Supabase Dashboard
2. You have the project URL: `https://vsjsrbmcxryuodlqscnl.supabase.co`
3. You have admin/owner permissions in Supabase
4. You've read through this entire guide once

⚠️ **Important**: Execute stages during a low-traffic window to minimize impact on active users.

---

## Pre-Migration Checklist

### 1. Backup Current State

Run these queries in Supabase SQL Editor to document current state:

```sql
-- Backup function definitions
SELECT
  proname,
  pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname IN (
  'create_reservation_transaction',
  'check_puppy_availability',
  'expire_pending_reservations'
);

-- Check current pending reservations
SELECT
  id,
  puppy_id,
  status,
  expires_at,
  created_at
FROM reservations
WHERE status = 'pending';

-- Save this output for rollback reference
```

### 2. Verify Dependencies Exist

```sql
-- Verify required tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_name IN ('reservations', 'puppies', 'webhook_events');
-- Expected: 3 rows

-- Verify required columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'reservations'
  AND column_name IN ('expires_at', 'updated_at', 'status', 'puppy_id');
-- Expected: 4 rows
```

✅ If both queries return expected results, proceed to migration.

---

## Migration Execution (Staged Approach)

### Stage 1: Update `create_reservation_transaction` Function

**File**: `supabase/migrations/stage1_create_reservation_transaction.sql`

**What it does**:

- Adds 15-minute default expiry: `COALESCE(p_expires_at, NOW() + interval '15 minutes')`
- **Critical fix**: Adds missing `GRANT EXECUTE` statement for `service_role`

**To execute**:

1. Open [Supabase SQL Editor](https://supabase.com/dashboard/project/vsjsrbmcxryuodlqscnl/sql)
2. Click **+ New query**
3. Copy entire contents of `stage1_create_reservation_transaction.sql`
4. Paste into editor
5. Click **Run** (or press `Cmd/Ctrl + Enter`)

**Expected output**:

```
NOTICE:  Successfully updated create_reservation_transaction with 15-minute default expiry
```

**✅ Verification**:

```sql
-- Verify GRANT permission (CRITICAL!)
SELECT has_function_privilege(
  'service_role',
  'create_reservation_transaction(uuid,text,text,text,text,numeric,numeric,text,text,timestamptz,text)',
  'EXECUTE'
) as can_execute;
-- Expected: true
```

⚠️ **If `can_execute` is `false`**, the migration failed. Contact support before proceeding.

---

### Stage 2: Update `check_puppy_availability` Trigger Function

**File**: `supabase/migrations/stage2_check_puppy_availability.sql`

**What it does**:

- Updates availability logic to respect `expires_at` timestamp
- Expired pending reservations no longer block new reservations

**To execute**:

1. Copy entire contents of `stage2_check_puppy_availability.sql`
2. Paste into SQL Editor
3. Click **Run**

**Expected output**:

```
Success. No rows returned
```

**✅ Verification**:

```sql
-- Verify function updated
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'check_puppy_availability';
-- Should contain: "expires_at IS NULL OR expires_at > NOW()"
```

---

### Stage 3: Recreate `enforce_puppy_availability` Trigger

**File**: `supabase/migrations/stage3_recreate_trigger.sql`

**What it does**:

- Drops existing trigger
- Creates new trigger with updated function from Stage 2

**To execute**:

1. Copy entire contents of `stage3_recreate_trigger.sql`
2. Paste into SQL Editor
3. Click **Run**

**Expected output**:

```
NOTICE:  Successfully recreated enforce_puppy_availability trigger
```

**✅ Verification**:

```sql
-- Verify trigger exists and is enabled
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgname = 'enforce_puppy_availability';
-- Expected: 1 row with tgenabled = 'O'
```

---

### Stage 4: Update `expire_pending_reservations` Function

**File**: `supabase/migrations/stage4_expire_pending_reservations.sql`

**What it does**:

- Changes return type from `VOID` to `INTEGER`
- Returns count of expired reservations for monitoring
- Releases puppies when no active reservations exist

**To execute**:

1. Copy entire contents of `stage4_expire_pending_reservations.sql`
2. Paste into SQL Editor
3. Click **Run**

**Expected output**:

```
Success. No rows returned
```

**✅ Verification**:

```sql
-- Test function execution
SELECT expire_pending_reservations() as expired_count;
-- Expected: Returns a number (0 or more)

-- Verify return type changed
SELECT pg_get_function_result(oid) as return_type
FROM pg_proc
WHERE proname = 'expire_pending_reservations';
-- Expected: "integer"
```

---

## Post-Migration Verification

### Run Full Verification Suite

**File**: `supabase/migrations/verification_queries.sql`

1. Copy entire contents of `verification_queries.sql`
2. Paste into SQL Editor
3. Click **Run**

**Review results for each query**:

#### Query 1: Function Signatures

```
function_name                    | return_type | arguments
---------------------------------|-------------|----------------------------------
check_puppy_availability         | trigger     |
create_reservation_transaction   | reservations| p_puppy_id uuid, p_customer_name text, ...
expire_pending_reservations      | integer     |
```

✅ **Pass**: All 3 functions exist with correct return types

#### Query 2: Trigger Status

```
trigger_name                | enabled | definition
----------------------------|---------|-----------------------------------
enforce_puppy_availability  | O       | CREATE TRIGGER enforce_puppy_...
```

✅ **Pass**: Trigger exists and is enabled (`O` = origin enabled)

#### Query 3: Expiry Function Test

```
expired_count
-------------
0
```

✅ **Pass**: Function executes and returns integer

#### Query 4: Service Role Permission (CRITICAL!)

```
service_role_can_execute
------------------------
t
```

✅ **Pass**: Service role has EXECUTE permission

⚠️ **FAIL if `f`**: Payment flows will break! Re-run Stage 1.

#### Query 5: Current Reservations

Shows all pending reservations with expiry status. Review for anomalies.

#### Query 6: Orphaned Puppies

```
(No rows)
```

✅ **Pass**: No puppies stuck in 'reserved' status without active reservations

⚠️ **If rows returned**: Run manual cleanup:

```sql
-- Release orphaned puppies
UPDATE puppies
SET status = 'available', updated_at = NOW()
WHERE id IN (
  -- IDs from Query 6 results
);
```

---

## Application Testing

### Test 1: Cron Endpoint

Set `CRON_SECRET` in your environment:

```bash
# .env.local
CRON_SECRET=your-strong-random-secret-here
```

Test the endpoint:

```bash
curl -X POST http://localhost:3000/api/cron/expire-reservations \
  -H "Authorization: Bearer your-strong-random-secret-here" \
  -H "Content-Type: application/json"
```

**Expected response**:

```json
{
  "expired": 0,
  "timestamp": "2025-02-21T12:00:00.000Z"
}
```

✅ **Pass**: Endpoint accessible and returns count

### Test 2: Reservation Creation

1. Start dev server: `npm run dev`
2. Navigate to any available puppy: `http://localhost:3000/puppies/[slug]`
3. Click **Pay Deposit** button
4. Complete Stripe/PayPal test payment

**Verify in Supabase**:

```sql
SELECT id, expires_at, created_at, status
FROM reservations
ORDER BY created_at DESC
LIMIT 1;
```

✅ **Pass**: `expires_at` is approximately 15 minutes after `created_at`

### Test 3: Expiry Enforcement

**Create a test expired reservation**:

```sql
-- Insert test reservation
INSERT INTO reservations (
  puppy_id,
  customer_email,
  status,
  deposit_amount,
  amount,
  payment_provider,
  external_payment_id,
  expires_at,
  created_at,
  updated_at
)
SELECT
  id,
  'test@example.com',
  'pending',
  300,
  300,
  'stripe',
  'test_' || gen_random_uuid()::text,
  NOW() - interval '1 hour',  -- Already expired
  NOW(),
  NOW()
FROM puppies
WHERE status = 'available'
LIMIT 1
RETURNING id, puppy_id, expires_at;
```

**Mark puppy as reserved**:

```sql
UPDATE puppies
SET status = 'reserved'
WHERE id = (SELECT puppy_id FROM reservations WHERE external_payment_id LIKE 'test_%');
```

**Call expiry function**:

```sql
SELECT expire_pending_reservations();
```

**Verify results**:

```sql
-- Reservation should be cancelled
SELECT status
FROM reservations
WHERE external_payment_id LIKE 'test_%';
-- Expected: 'cancelled'

-- Puppy should be available
SELECT status
FROM puppies
WHERE id = (SELECT puppy_id FROM reservations WHERE external_payment_id LIKE 'test_%');
-- Expected: 'available'
```

✅ **Pass**: Expired reservation cancelled and puppy released

**Cleanup**:

```sql
DELETE FROM reservations WHERE external_payment_id LIKE 'test_%';
```

---

## Deployment

### 1. Configure Cron Job

**Option A: Vercel Cron** (Recommended)

Create `vercel.json` in project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/expire-reservations",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

Set environment variable in Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `CRON_SECRET` = `your-strong-random-secret`
3. Scope: Production, Preview, Development

**Option B: External Cron Service**

1. Sign up for cron-job.org or similar
2. Create new job:
   - **URL**: `https://yourdomain.com/api/cron/expire-reservations`
   - **Schedule**: `*/5 * * * *`
   - **Method**: `POST`
   - **Header**: `Authorization: Bearer YOUR_CRON_SECRET`

### 2. Deploy Application

```bash
# Commit changes
git add .
git commit -m "feat: add reservation expiry enforcement migration"
git push origin main
```

### 3. Monitor Deployment

After deployment:

1. Check Vercel logs for cron execution
2. Monitor `/api/health/webhooks` endpoint
3. Verify no errors in Supabase logs

---

## Rollback Plan

If migration causes issues, execute rollback:

**File**: `supabase/migrations/rollback_reservation_expiry.sql`

```sql
-- Rollback to original functions (no expiry enforcement)

-- Step 1: Restore original create_reservation_transaction
CREATE OR REPLACE FUNCTION create_reservation_transaction(
  p_puppy_id UUID, p_customer_name TEXT, p_customer_email TEXT,
  p_customer_phone TEXT, p_channel TEXT, p_deposit_amount NUMERIC,
  p_amount NUMERIC, p_payment_provider TEXT, p_external_payment_id TEXT,
  p_expires_at TIMESTAMPTZ, p_notes TEXT
)
RETURNS reservations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_puppy puppies%ROWTYPE;
  v_reservation reservations%ROWTYPE;
BEGIN
  SELECT * INTO v_puppy FROM puppies WHERE id = p_puppy_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'PUPPY_NOT_FOUND'; END IF;
  IF v_puppy.status IS DISTINCT FROM 'available' THEN RAISE EXCEPTION 'PUPPY_NOT_AVAILABLE'; END IF;
  IF v_puppy.price_usd IS NOT NULL AND p_deposit_amount > v_puppy.price_usd THEN
    RAISE EXCEPTION 'DEPOSIT_EXCEEDS_PRICE';
  END IF;

  UPDATE puppies SET status = 'reserved', updated_at = NOW() WHERE id = p_puppy_id;

  INSERT INTO reservations (
    puppy_id, customer_name, customer_email, customer_phone, channel, status,
    deposit_amount, amount, payment_provider, external_payment_id, expires_at,
    notes, created_at, updated_at
  )
  VALUES (
    p_puppy_id, NULLIF(TRIM(p_customer_name), ''), LOWER(TRIM(p_customer_email)),
    NULLIF(TRIM(p_customer_phone), ''), COALESCE(p_channel, 'site'), 'pending',
    p_deposit_amount, p_amount, p_payment_provider, p_external_payment_id,
    p_expires_at, NULLIF(TRIM(p_notes), ''), NOW(), NOW()
  )
  RETURNING * INTO v_reservation;

  RETURN v_reservation;
END;
$$;

GRANT EXECUTE ON FUNCTION create_reservation_transaction(
  UUID, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, TEXT, TEXT, TIMESTAMPTZ, TEXT
) TO service_role;

-- Step 2: Restore original check_puppy_availability
CREATE OR REPLACE FUNCTION check_puppy_availability()
RETURNS TRIGGER AS $$
DECLARE
  puppy_available BOOLEAN;
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.status IN ('pending', 'paid')) THEN
    SELECT (
      SELECT COUNT(*) = 0 FROM reservations
      WHERE puppy_id = NEW.puppy_id
        AND status IN ('pending', 'paid')
        AND id != COALESCE(NEW.id, 0)
    ) INTO puppy_available;

    IF NOT puppy_available THEN
      RAISE EXCEPTION 'Puppy is not available for reservation';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Restore original expire_pending_reservations
CREATE OR REPLACE FUNCTION expire_pending_reservations()
RETURNS VOID AS $$
BEGIN
  UPDATE reservations
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending'
    AND expires_at IS NOT NULL
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

RAISE NOTICE 'Rollback completed successfully';
```

⚠️ **After rollback**: Update application code to remove dependency on 15-minute expiry behavior.

---

## Troubleshooting

### Issue: "Permission denied for function create_reservation_transaction"

**Cause**: Stage 1 GRANT statement failed

**Solution**: Re-run Stage 1 or manually execute:

```sql
GRANT EXECUTE ON FUNCTION create_reservation_transaction(
  UUID, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, TEXT, TEXT, TIMESTAMPTZ, TEXT
) TO service_role;
```

### Issue: Puppies stuck in 'reserved' status

**Cause**: Expiry function not releasing puppies correctly

**Solution**: Run manual cleanup:

```sql
UPDATE puppies AS p
SET status = 'available', updated_at = NOW()
WHERE p.status = 'reserved'
  AND NOT EXISTS (
    SELECT 1 FROM reservations r
    WHERE r.puppy_id = p.id
      AND (r.status = 'paid' OR (r.status = 'pending' AND (r.expires_at IS NULL OR r.expires_at > NOW())))
  );
```

### Issue: Cron job returns 401 Unauthorized

**Cause**: `CRON_SECRET` mismatch or missing

**Solution**: Verify environment variable matches in:

1. `.env.local` (local development)
2. Vercel environment variables (production)
3. Cron job configuration

### Issue: Migration fails with "function does not exist"

**Cause**: Dependencies from earlier migrations not applied

**Solution**: Apply prerequisite migrations:

1. `20251010T021104Z_reservation_constraints.sql` (adds `expires_at` column)
2. `20251015T000000Z_create_reservation_transaction_function.sql` (creates original function)

---

## Success Criteria

✅ **Migration is successful when**:

1. All 4 stage scripts execute without errors
2. All 6 verification queries pass
3. Service role has EXECUTE permission on `create_reservation_transaction`
4. Cron endpoint returns `200 OK` with expired count
5. Test reservation created with 15-minute expiry
6. Expired test reservation is cancelled and puppy released
7. No orphaned puppies in 'reserved' status

---

## Support

If you encounter issues not covered in this guide:

1. Check Supabase logs: Dashboard → Logs → Postgres Logs
2. Review application logs in Vercel Dashboard
3. Search GitHub issues: `anthropics/claude-code`
4. Contact support with:
   - Error message and stack trace
   - Results of verification queries
   - Supabase project ID

---

**Migration Version**: 20250221T120000Z
**Last Updated**: 2025-02-21
**Author**: Claude Code Migration Assistant
