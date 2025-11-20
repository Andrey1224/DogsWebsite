# Delayed Archiving Feature (30-Day Auto-Archive)

**Date**: 2025-11-19
**Migration**: `20251119000000_delayed_archiving_30_days.sql`
**Status**: ✅ Deployed

---

## Overview

This feature implements **30-day delayed archiving** for sold puppies. Previously, puppies were archived immediately when their status changed to `'sold'`. Now, they remain visible for 30 days after sale before being automatically archived.

---

## Why 30-Day Delay?

- ✅ **SEO**: Sold puppies remain indexed by search engines
- ✅ **Social Proof**: Visitors see recent sales activity
- ✅ **Customer Support**: Easy reference for recent transactions
- ✅ **Analytics**: Better tracking of sales patterns

---

## Features Implemented

### Database Changes

- ✅ **New `sold_at` field** (TIMESTAMPTZ) tracks when puppy was marked as sold
- ✅ **Updated trigger** `track_sold_timestamp()` sets `sold_at` instead of immediate archiving
- ✅ **Archiving function** `archive_sold_puppies_after_30_days()` archives puppies sold ≥30 days ago
- ✅ **pg_cron job** runs daily at 2 AM UTC to archive eligible puppies
- ✅ **Performance index** on `sold_at` for efficient queries

### Behavior Changes

| Event                        | Old Behavior                   | New Behavior                                        |
| ---------------------------- | ------------------------------ | --------------------------------------------------- |
| Status → `'sold'`            | Immediate `is_archived = true` | Sets `sold_at = NOW()`, keeps `is_archived = false` |
| 30 days after sale           | N/A                            | pg_cron job sets `is_archived = true`               |
| Status changes from `'sold'` | N/A                            | Clears `sold_at` (stops archiving countdown)        |

---

## Migration Details

### File Location

```
supabase/migrations/20251119000000_delayed_archiving_30_days.sql
```

### What It Does

1. **Adds `sold_at` column** to `puppies` table
2. **Backfills `sold_at`** for existing sold puppies (estimates from `updated_at`)
3. **Creates index** `idx_puppies_sold_at` for performance
4. **Drops old trigger** `trigger_auto_archive_sold`
5. **Creates new trigger** `trigger_track_sold` to set `sold_at`
6. **Creates archiving function** `archive_sold_puppies_after_30_days()`
7. **Schedules pg_cron job** `archive-sold-puppies-after-30-days`

### Deployment Steps

**Executed via Supabase Dashboard SQL Editor:**

```sql
-- See migration file for complete SQL
supabase/migrations/20251119000000_delayed_archiving_30_days.sql
```

---

## Verification

### Check Migration Applied

```sql
-- Verify sold_at column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'puppies' AND column_name = 'sold_at';

-- Expected: 1 row (sold_at | timestamp with time zone | YES)
```

### Check pg_cron Job

```sql
-- Verify job is scheduled
SELECT jobid, jobname, schedule, command, active
FROM cron.job
WHERE jobname = 'archive-sold-puppies-after-30-days';

-- Expected: jobname = 'archive-sold-puppies-after-30-days', schedule = '0 2 * * *', active = true
```

### Check Sold Puppies

```sql
-- List sold puppies with days until archiving
SELECT
  name,
  status,
  sold_at,
  is_archived,
  CASE
    WHEN status = 'sold' AND sold_at IS NOT NULL
    THEN 30 - EXTRACT(DAY FROM (NOW() - sold_at))::INTEGER
    ELSE NULL
  END as days_until_archived
FROM puppies
WHERE status = 'sold'
ORDER BY sold_at DESC;
```

---

## Manual Operations

### Manually Archive Sold Puppies

```sql
-- Safe to run anytime - only archives if >= 30 days
SELECT archive_sold_puppies_after_30_days();

-- Returns: count of archived puppies
```

### Check pg_cron Execution History

```sql
SELECT
  j.jobname,
  jrd.start_time,
  jrd.end_time,
  (jrd.end_time - jrd.start_time) as duration,
  jrd.status,
  jrd.return_message
FROM cron.job_run_details jrd
JOIN cron.job j ON j.jobid = jrd.jobid
WHERE j.jobname = 'archive-sold-puppies-after-30-days'
ORDER BY jrd.start_time DESC
LIMIT 20;
```

### Test the Trigger

```sql
-- Test setting sold_at when status changes to 'sold'
BEGIN;
  UPDATE puppies SET status = 'sold' WHERE id = 'TEST_PUPPY_ID';
  SELECT id, name, status, sold_at FROM puppies WHERE id = 'TEST_PUPPY_ID';
ROLLBACK;

-- Test clearing sold_at when status changes from 'sold'
BEGIN;
  UPDATE puppies SET status = 'available' WHERE id = 'TEST_PUPPY_ID' AND status = 'sold';
  SELECT id, name, status, sold_at FROM puppies WHERE id = 'TEST_PUPPY_ID';
ROLLBACK;
```

---

## TypeScript Types Updated

Updated `lib/supabase/database.types.ts`:

```typescript
puppies: {
  Row: {
    // ... other fields
    sold_at: string | null;  // ✅ Added
    // ... other fields
  };
  Insert: {
    // ... other fields
    sold_at?: string | null;  // ✅ Added
    // ... other fields
  };
  Update: {
    // ... other fields
    sold_at?: string | null;  // ✅ Added
    // ... other fields
  };
}
```

**Test files updated:**

- `app/puppies/page.test.tsx`
- `components/puppy-card.test.tsx`
- `lib/seo/structured-data.test.ts`
- `lib/supabase/queries.test.ts`

---

## Monitoring

### Check for Puppies Eligible for Archiving

```sql
-- Puppies sold >= 30 days ago but not archived
SELECT
  name,
  slug,
  status,
  sold_at,
  EXTRACT(DAY FROM (NOW() - sold_at))::INTEGER as days_since_sold,
  is_archived
FROM puppies
WHERE status = 'sold'
  AND sold_at IS NOT NULL
  AND sold_at <= NOW() - INTERVAL '30 days'
  AND is_archived = false
ORDER BY sold_at;
```

### pg_cron Job Status

```bash
# Via Supabase Dashboard → Database → Extensions → pg_cron
# Or via SQL:
SELECT * FROM cron.job WHERE jobname = 'archive-sold-puppies-after-30-days';
```

---

## Rollback Plan

**If issues arise**, disable the pg_cron job:

```sql
-- Disable the job (doesn't delete it)
SELECT cron.unschedule('archive-sold-puppies-after-30-days');

-- Re-enable later (if needed)
SELECT cron.schedule(
  'archive-sold-puppies-after-30-days',
  '0 2 * * *',
  'SELECT archive_sold_puppies_after_30_days();'
);
```

---

## Related Documentation

- **Soft Delete Feature**: `docs/deployment/soft-delete-feature.md`
- **Database Schema**: `lib/supabase/database.types.ts`
- **Migration File**: `supabase/migrations/20251119000000_delayed_archiving_30_days.sql`
- **Cleanup Script**: `DELETE_COMPLETE.sql` (test data removal)

---

## Timeline

| Date       | Event                                     | Status      |
| ---------- | ----------------------------------------- | ----------- |
| 2025-11-19 | Migration created                         | ✅ Complete |
| 2025-11-19 | Migration deployed via Supabase Dashboard | ✅ Complete |
| 2025-11-19 | TypeScript types updated                  | ✅ Complete |
| 2025-11-19 | Test data cleaned (kept only CHARLIE)     | ✅ Complete |
| 2025-11-19 | Documentation updated                     | ✅ Complete |

---

## Production Status

- ✅ Migration deployed
- ✅ pg_cron job active
- ✅ Database: 1 puppy (CHARLIE)
- ✅ CHARLIE: `sold_at` set, `is_archived = false`
- ✅ Days until auto-archive: 30
- ✅ TypeScript types validated

**Next archiving run**: Daily at 2:00 AM UTC

---

## Support

For questions or issues:

- Check pg_cron execution history (SQL above)
- Manually run archiving function to test
- Verify trigger functionality with test queries
- Review `node scripts/check-puppies.mjs` output

**Last Updated**: 2025-11-19
