# Quick Deploy Guide 🚀

## TL;DR - Deploy Migrations Now

### Step 1: Generate Combined Migration
```bash
node scripts/apply-migration.mjs
```

This creates `combined_migration.sql` with all pending migrations.

### Step 2: Apply to Supabase

**Via Dashboard (Easiest):**
1. Open [Supabase Dashboard](https://app.supabase.com)
2. Go to SQL Editor
3. Copy contents of `combined_migration.sql`
4. Paste and Run

**Or use the pre-generated SQL below** ⬇️

### Step 3: Verify
```bash
node scripts/verify-constraints.mjs
```

You should see:
```
✅ All required columns exist!
✅ Function exists and validation works
```

---

## What Gets Deployed

### New Columns Added to `reservations`
- `external_payment_id` - Unified payment ID field
- `webhook_event_id` - Links to webhook events
- `expires_at` - Reservation expiration
- `amount` - Total reservation amount
- `updated_at` - Last update timestamp

### New Database Function
- `create_reservation_transaction()` - Atomic reservation creation with race protection

### New Constraints
- Unique payment IDs per provider
- Amount validation (≥ 0)
- Status validation
- One active reservation per puppy

---

## The SQL (Ready to Copy-Paste)

Open `combined_migration.sql` or run:
```bash
cat combined_migration.sql
```

Then copy-paste into Supabase SQL Editor.

---

## Code Changes Summary

The following files have been updated to use the new schema:

### [app/puppies/[slug]/actions.ts](app/puppies/[slug]/actions.ts:52)
- Added slug mismatch validation
- Prevents stale client data from reaching Stripe

### [lib/reservations/create.ts](lib/reservations/create.ts:63-158)
- Now uses `create_reservation_transaction()` RPC
- Atomic puppy status update + reservation insert
- Improved error mapping

### [lib/stripe/webhook-handler.ts](lib/stripe/webhook-handler.ts:18,319-322)
- Added ISR revalidation after reservation success
- Ensures catalog reflects new status immediately

### New Migration Files
1. `supabase/migrations/20251010T021104Z_reservation_constraints.sql`
2. `supabase/migrations/20251015T000000Z_create_reservation_transaction_function.sql`

---

## After Deployment

1. ✅ Run verification: `node scripts/verify-constraints.mjs`
2. ✅ Deploy updated application code to Vercel
3. ✅ Test payment flow end-to-end
4. ✅ Monitor webhook health: `/api/health/webhooks`

---

## Rollback (Emergency Only)

See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md#rollback-if-needed) for detailed rollback instructions.

---

## Need Help?

- 📖 Full guide: [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)
- 🔍 Verify status: `node scripts/verify-constraints.mjs`
- 🧪 Check database: `node scripts/check-migrations.mjs`
