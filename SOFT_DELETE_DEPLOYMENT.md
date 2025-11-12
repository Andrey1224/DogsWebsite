# Soft Delete (Archivation) Deployment Instructions

## Overview
This deployment adds soft delete (archivation) functionality for puppies. Archived puppies are hidden from the public catalog but preserved for historical records (inquiries, reservations).

## Features Implemented
- ✅ `is_archived` boolean field on puppies table
- ✅ Database trigger for auto-archiving when status → 'sold'
- ✅ Admin UI with Active/Archived tabs
- ✅ Archive/Restore buttons in admin panel
- ✅ Protection from archiving puppies with active reservations
- ✅ Public pages automatically exclude archived puppies
- ✅ Auto-archive notification when status changes to 'sold'

## Deployment Steps

### 1. Apply Database Migration

**Option A: Via Supabase Dashboard (Recommended)**

1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
2. Copy and paste the contents of `supabase/migrations/20251111T223757Z_add_soft_delete_to_puppies.sql`
3. Click "Run" to execute the migration
4. Verify the migration succeeded

**Option B: Via Supabase CLI**

```bash
# Make sure Supabase CLI is installed
# npm install -g supabase

# Link to your project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# Push the migration
supabase db push
```

### 2. Verify Migration

Run this SQL query in Supabase Dashboard to verify:

```sql
-- Check column exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'puppies' AND column_name = 'is_archived';

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'puppies' AND indexname LIKE '%archived%';

-- Check trigger exists
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'puppies' AND trigger_name = 'trigger_auto_archive_sold';

-- Verify existing puppies have is_archived = false
SELECT COUNT(*) as total_puppies,
       COUNT(*) FILTER (WHERE is_archived = false) as active,
       COUNT(*) FILTER (WHERE is_archived = true) as archived
FROM puppies;
```

Expected output:
- Column `is_archived` exists with type `boolean`, default `false`
- Two indexes exist: `idx_puppies_is_archived` and `idx_puppies_active_created`
- Trigger `trigger_auto_archive_sold` exists
- All existing puppies should have `is_archived = false`

### 3. Deploy Code to Vercel

```bash
# Commit all changes
git add .
git commit -m "feat: implement soft delete (archivation) for puppies

- Add is_archived field with database trigger
- Implement Archive/Restore functionality in admin
- Add Active/Archived tabs in admin panel
- Block archivation if active reservations exist
- Auto-archive when status changes to sold
- Filter archived puppies from public catalog
- Update tests and TypeScript types"

# Push to GitHub (triggers Vercel deployment)
git push origin main
```

### 4. Post-Deployment Testing

#### Test Checklist

**Admin Panel Tests:**
1. ✅ Go to `/admin/puppies` - should see "Active" and "Archived" tabs
2. ✅ Click "Archived" tab - should show empty state or archived puppies
3. ✅ On Active tab, click "Archive" on a puppy without reservations - should succeed
4. ✅ Try to archive a puppy with pending/paid reservation - should show error message
5. ✅ Change puppy status to "sold" - should auto-archive with notification
6. ✅ Go to Archived tab, click "Restore" - puppy returns to Active tab
7. ✅ Archived puppy shows "Delete Permanently" instead of "Archive"

**Public Site Tests:**
1. ✅ Visit `/puppies` - archived puppies should NOT appear
2. ✅ Try to access archived puppy detail page directly - should return 404
3. ✅ Filters should only show active puppies

**Database Tests:**
1. ✅ Manually UPDATE a puppy status to 'sold' in SQL - `is_archived` should auto-set to `true`
2. ✅ Check inquiries/reservations still reference archived puppies correctly

#### Manual SQL Tests

```sql
-- Test 1: Archive a puppy manually
UPDATE puppies SET is_archived = true WHERE name = 'TEST_PUPPY_NAME';

-- Test 2: Verify auto-archive trigger
UPDATE puppies SET status = 'sold' WHERE name = 'ANOTHER_TEST_PUPPY';
SELECT name, status, is_archived FROM puppies WHERE name = 'ANOTHER_TEST_PUPPY';
-- Expected: is_archived should be true

-- Test 3: Restore puppy
UPDATE puppies SET is_archived = false WHERE name = 'TEST_PUPPY_NAME';

-- Test 4: Check inquiries still linked to archived puppy
SELECT i.id, i.name, i.puppy_id, p.name as puppy_name, p.is_archived
FROM inquiries i
JOIN puppies p ON i.puppy_id = p.id
WHERE p.is_archived = true
LIMIT 5;
```

### 5. Rollback Plan (If Needed)

If something goes wrong, you can rollback the database changes:

```sql
-- Remove trigger
DROP TRIGGER IF EXISTS trigger_auto_archive_sold ON puppies;
DROP FUNCTION IF EXISTS auto_archive_sold_puppies();

-- Remove indexes
DROP INDEX IF EXISTS idx_puppies_active_created;
DROP INDEX IF EXISTS idx_puppies_is_archived;

-- Remove column
ALTER TABLE puppies DROP COLUMN IF EXISTS is_archived;
```

Then revert the code deployment in Vercel by rolling back to the previous deployment.

## Known Issues & Limitations

1. **Unique Slug Constraint**: Archived puppies still occupy their slugs. To reuse a slug, you must restore or permanently delete the old puppy.

2. **No Bulk Archive**: Currently, you must archive puppies one at a time. Future enhancement could add bulk actions.

3. **No Archive History**: System doesn't track when/who archived a puppy. Could add `archived_at` and `archived_by` fields in future.

## Monitoring

After deployment, monitor these metrics:

- Check Vercel deployment logs for any errors
- Monitor Supabase database performance (new indexes should improve query speed)
- Check admin panel usage - are users successfully archiving puppies?
- Verify public catalog excludes archived puppies

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check Supabase logs for database errors
3. Verify migration was applied successfully
4. Check browser console for client-side errors
5. Review `/admin/puppies` page in admin panel

## Future Enhancements

- [ ] Add `archived_at` timestamp
- [ ] Add `archived_by` user tracking
- [ ] Bulk archive/restore actions
- [ ] Archive puppy statistics in admin dashboard
- [ ] Export archived puppies report
