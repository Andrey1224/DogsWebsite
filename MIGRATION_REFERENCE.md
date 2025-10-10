# Database Migration Reference

> **Status:** ✅ Applied on 2025-10-10
> **Commit:** 44954a8

---

## What Was Applied

### New Table: `webhook_events`
Tracks all payment webhook events from Stripe and PayPal for audit trail and idempotency.

**Columns:**
- `id` (BIGINT) - Primary key
- `provider` (TEXT) - 'stripe' or 'paypal'
- `event_id` (TEXT) - Provider's event ID
- `event_type` (TEXT) - Event type
- `processed` (BOOLEAN) - Processing status
- `reservation_id` (UUID) - Link to reservation
- `payload` (JSONB) - Full webhook payload
- `idempotency_key` (TEXT) - Deduplication key

### Updated Table: `reservations`
Added 6 new columns:
- `external_payment_id` (TEXT) - Unified payment ID
- `webhook_event_id` (BIGINT) - Link to webhook event
- `expires_at` (TIMESTAMPTZ) - Reservation expiration
- `amount` (DECIMAL) - Total reservation amount
- `updated_at` (TIMESTAMPTZ) - Last update timestamp
- `payment_provider` (TEXT) - Already existed, but documented

### New Function: `create_reservation_transaction()`
Atomic function that:
1. Locks puppy row (FOR UPDATE)
2. Validates availability
3. Updates puppy status to 'reserved'
4. Creates reservation record
5. All in one transaction (prevents race conditions)

### Foreign Keys
- `webhook_events.reservation_id` → `reservations.id` (UUID → UUID)
- `reservations.webhook_event_id` → `webhook_events.id` (BIGINT → BIGINT)

### Indexes
- Partial unique indexes for idempotency
- Performance indexes on frequently queried columns
- Unique constraint: one active reservation per puppy

---

## Verification

Check migration status:
```bash
node scripts/verify-constraints.mjs
```

Expected output:
```
✅ All required columns exist!
✅ Function exists and validation works
```

---

## Rollback (Emergency Only)

If needed, see migration files in `supabase/migrations/`:
- `20251010T021049Z_webhook_events.sql`
- `20251010T021104Z_reservation_constraints.sql`
- `20251015T000000Z_create_reservation_transaction_function.sql`

---

## Troubleshooting

### Check webhook_events table
```sql
SELECT * FROM webhook_events ORDER BY created_at DESC LIMIT 5;
```

### Check new reservations columns
```sql
SELECT
  id,
  external_payment_id,
  webhook_event_id,
  amount,
  updated_at
FROM reservations
ORDER BY created_at DESC
LIMIT 5;
```

### Test transaction function
```sql
SELECT * FROM create_reservation_transaction(
  'puppy-uuid'::UUID,
  'Test Customer',
  'test@example.com',
  '+1234567890',
  'site',
  500.00,
  4200.00,
  'stripe',
  'pi_test_123',
  NOW() + INTERVAL '24 hours',
  'Test reservation'
);
```

---

## Related Files

**Migration Files:**
- `supabase/migrations/20251010T021049Z_webhook_events.sql`
- `supabase/migrations/20251010T021104Z_reservation_constraints.sql`
- `supabase/migrations/20251015T000000Z_create_reservation_transaction_function.sql`

**Verification Scripts:**
- `scripts/verify-constraints.mjs` - Check if migration was applied
- `scripts/check-migrations.mjs` - Test database connectivity

**Code Changes:**
- `app/puppies/[slug]/actions.ts` - Slug validation
- `lib/reservations/create.ts` - Uses RPC function
- `lib/stripe/webhook-handler.ts` - ISR revalidation

---

## Key Fixes Applied

1. **SQL Syntax:** Changed `ALTER TABLE ADD CONSTRAINT ... WHERE` to `CREATE UNIQUE INDEX ... WHERE`
2. **Circular Dependencies:** Tables created without FKs, then FKs added separately
3. **Data Types:** Fixed `webhook_events.reservation_id` from BIGINT to UUID
4. **Status Spelling:** Unified on 'canceled' (American spelling)
5. **Function Return Type:** Changed to `RETURNS SETOF reservations`
6. **UUID Comparison:** Used `IS DISTINCT FROM` instead of `COALESCE(..., 0)`

---

Last Updated: 2025-10-10
