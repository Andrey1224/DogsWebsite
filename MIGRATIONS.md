# Database Migrations

## Status Snapshot

- **Last Applied Batch:** 2025-10-10 (commit `44954a8`)
- **New Blocking Migration:** `20250218T120000Z_add_is_archived_flag.sql` (adds `puppies.is_archived` so the app no longer queries a missing column)
- **Core Outcome:** `reservations` and `webhook_events` tables hardened with idempotency constraints, helper functions, and transaction guarantees.

---

## Applied Change Log (2025-02-18)

### Updated Table — `puppies`
- Added `is_archived boolean NOT NULL DEFAULT false` so application queries and rate-limit helpers can filter active puppies without hitting missing-column errors.
- Backfilled existing rows to `false` and enforced the default for future inserts.
- Documented the new column to clarify it powers soft deletes.

---

## Applied Change Log (2025-10-10)

### New Table — `webhook_events`
- Provider-agnostic audit trail for Stripe and PayPal webhooks.
- Columns: `id`, `provider`, `event_id`, `event_type`, `processed`, `reservation_id`, `payload`, `idempotency_key`, timestamps.
- Relationships: `reservation_id` → `reservations.id` (UUID).
- Indexes: partial unique index on `(provider, event_id)` plus supporting lookups for status and timestamps.

### Updated Table — `reservations`
- Added columns: `external_payment_id`, `webhook_event_id`, `expires_at`, `amount`, `updated_at`.
- Partial unique index `idx_one_active_reservation_per_puppy` enforces a single active reservation per puppy.
- Additional indexes for provider, payment lookup, and lifecycle operations.
- Foreign key `reservations.webhook_event_id` → `webhook_events.id`.

### Stored Procedures & Helpers
- `create_reservation_transaction()` — atomic creation with row locking and status updates.
- `check_puppy_availability()` trigger guard.
- `expire_pending_reservations()` maintenance helper.
- `get_reservation_summary()` analytics aggregation.

### Key Fixes Captured
1. Replaced invalid `ALTER TABLE ... UNIQUE ... WHERE` with partial unique indexes.
2. Separated circular FK creation into staged steps.
3. Corrected UUID/BIGINT mismatches between `reservations` and `webhook_events`.
4. Normalised status spelling to `canceled`.
5. Ensured functions return `(SETOF reservations)` for typed callers.
6. Used `IS DISTINCT FROM` for NULL-safe comparisons.

---

## Applying or Reapplying Migrations

Pending migrations (if verification fails):
1. `20250218T120000Z_add_is_archived_flag.sql`
2. `20251010T021104Z_reservation_constraints.sql`
3. `20251015T000000Z_create_reservation_transaction_function.sql`
4. `20250221T120000Z_reservation_expiry_enforcement.sql`

### Option A — Supabase Dashboard (recommended)
1. Open the project at [app.supabase.com](https://app.supabase.com).
2. SQL Editor → **New query**.
3. Paste the contents of `combined_migration.sql` (generated via `node scripts/apply-migration.mjs`).
4. Run the script and confirm success notifications.

### Option B — Supabase CLI
```bash
supabase db push
```

### Option C — Direct `psql`
```bash
psql "postgresql://postgres:<PASSWORD>@<HOST>:5432/postgres" -f combined_migration.sql
```

---

## Verification Workflow

```bash
# Confirm schema, constraints, and functions
node scripts/verify-constraints.mjs
```

Expected output:
```
✅ All required columns exist!
✅ Function exists and validation works
```

If checks fail, re-run the migrations using one of the options above.

---

## Troubleshooting

- **Constraint already exists:** Safe to ignore; rerun skipped successfully.
- **Column already exists:** Migration previously applied; no action needed.
- **Relation does not exist:** Confirm you are targeting the correct database and that prerequisite tables are present.
- **Permission denied:** Use the Supabase service role key or database owner credentials.

---

## Rollback (Emergency Only)

```sql
-- Drop constraints
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS unique_external_payment_per_provider;
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS valid_reservation_amount;
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS valid_reservation_status;

-- Drop indexes
DROP INDEX IF EXISTS idx_one_active_reservation_per_puppy;
DROP INDEX IF EXISTS idx_reservations_payment_provider;
DROP INDEX IF EXISTS idx_reservations_external_payment_id;
DROP INDEX IF EXISTS idx_reservations_webhook_event_id;
DROP INDEX IF EXISTS idx_reservations_expires_at;

-- Drop helper functions
DROP FUNCTION IF EXISTS create_reservation_transaction;
DROP FUNCTION IF EXISTS check_puppy_availability;
DROP FUNCTION IF EXISTS expire_pending_reservations;
DROP FUNCTION IF EXISTS get_reservation_summary;

-- Drop trigger
DROP TRIGGER IF EXISTS enforce_puppy_availability ON reservations;

-- Remove columns (data loss!)
ALTER TABLE reservations DROP COLUMN IF EXISTS external_payment_id;
ALTER TABLE reservations DROP COLUMN IF EXISTS webhook_event_id;
ALTER TABLE reservations DROP COLUMN IF EXISTS expires_at;
ALTER TABLE reservations DROP COLUMN IF EXISTS amount;
ALTER TABLE reservations DROP COLUMN IF EXISTS updated_at;
```

---

## Post-Migration Checklist

- [ ] Run `node scripts/verify-constraints.mjs`.
- [ ] Exercise `create_reservation_transaction()` via Supabase SQL or automated tests.
- [ ] Confirm webhook events are recorded with matching reservation IDs.
- [ ] Deploy application code that targets the updated schema.
