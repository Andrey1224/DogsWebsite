# 🚨 URGENT: Apply Database Migrations

## Why You're Seeing This

Your CI/deployment is failing because the application code expects database columns that don't exist yet. The migrations are in the codebase but **NOT applied to your production Supabase database**.

## Error You're Seeing

```
Error: column puppies.is_archived does not exist
```

## Quick Fix (5 minutes)

### Step 1: Apply Migration 1 - Add Column

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
2. Copy and paste this SQL (from `supabase/migrations/20250218T120000Z_add_is_archived_flag.sql`):

```sql
-- Ensure puppies table exposes the soft-delete flag expected by the app code
-- Migration: 20250218T120000Z_add_is_archived_flag

BEGIN;

-- Add the column if it is missing (older databases) and make sure it has sane defaults
ALTER TABLE public.puppies
  ADD COLUMN IF NOT EXISTS is_archived boolean;

ALTER TABLE public.puppies
  ALTER COLUMN is_archived SET DEFAULT false;

UPDATE public.puppies
SET is_archived = false
WHERE is_archived IS NULL;

ALTER TABLE public.puppies
  ALTER COLUMN is_archived SET NOT NULL;

COMMENT ON COLUMN public.puppies.is_archived IS
  'Soft delete flag. Archived puppies are hidden from the public catalog but preserved for history.';

COMMIT;
```

3. Click **"Run"** button
4. Wait for success message: ✅ "Success. No rows returned"

---

### Step 2: Apply Migration 2 - Add Indexes and Trigger

1. Stay in Supabase SQL Editor (or open a new query)
2. Copy and paste this SQL (from `supabase/migrations/20251111T223757Z_add_soft_delete_to_puppies.sql`):

```sql
-- Add soft delete (archivation) support to puppies table
-- Migration: 20251111T223757Z_add_soft_delete_to_puppies

-- Add index for fast filtering of active puppies
CREATE INDEX idx_puppies_is_archived
  ON puppies(is_archived);

-- Add composite index for sorted queries of active puppies
CREATE INDEX idx_puppies_active_created
  ON puppies(is_archived, created_at DESC)
  WHERE is_archived = false;

-- Create trigger function for auto-archiving sold puppies
CREATE OR REPLACE FUNCTION auto_archive_sold_puppies()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-archive when status changes TO 'sold' (wasn't sold before)
  IF NEW.status = 'sold' AND (OLD.status IS NULL OR OLD.status != 'sold') THEN
    NEW.is_archived = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_auto_archive_sold
  BEFORE UPDATE ON puppies
  FOR EACH ROW
  EXECUTE FUNCTION auto_archive_sold_puppies();

-- Verify existing puppies are not archived by default (safety check)
UPDATE puppies
SET is_archived = false
WHERE is_archived IS NULL;
```

3. Click **"Run"** button
4. Wait for success message

---

### Step 3: Verify Migrations Applied

1. In Supabase SQL Editor, run this verification query:

```sql
-- Check column exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'puppies' AND column_name = 'is_archived';

-- Check indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'puppies' AND indexname LIKE '%archived%';

-- Check trigger exists
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'puppies' AND trigger_name = 'trigger_auto_archive_sold';

-- Verify data
SELECT COUNT(*) as total_puppies,
       COUNT(*) FILTER (WHERE is_archived = false) as active,
       COUNT(*) FILTER (WHERE is_archived = true) as archived
FROM puppies;
```

**Expected Output:**
- ✅ Column `is_archived` exists (type: `boolean`, nullable: `NO`, default: `false`)
- ✅ Two indexes: `idx_puppies_is_archived` and `idx_puppies_active_created`
- ✅ Trigger `trigger_auto_archive_sold` exists
- ✅ All puppies have `is_archived = false` (unless you already archived some)

---

## Alternative: Use Supabase CLI

If you have Supabase CLI installed and linked to your project:

```bash
# Install CLI (if not already installed)
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push all pending migrations
supabase db push
```

---

## After Applying Migrations

### 1. Verify Locally (Optional)

```bash
cd /Users/andriinepodymka/Desktop/PuppyWebsite
node scripts/verify-constraints.mjs
```

**Expected Output:**
```
✅ All required columns exist!
✅ Function exists and validation works
```

### 2. Re-run GitHub Actions

1. Go to your GitHub repository
2. Go to **Actions** tab
3. Find the failed workflow run
4. Click **"Re-run all jobs"**
5. Watch it pass ✅

### 3. Redeploy Vercel (if needed)

Vercel deployments should automatically work now since the database schema matches the application code.

---

## What This Fixes

✅ **CI Tests**: No more "column does not exist" errors
✅ **Admin Panel**: Archive/Restore functionality works
✅ **Public Catalog**: Archived puppies automatically hidden
✅ **Auto-Archive**: Puppies marked as "sold" automatically archive
✅ **Performance**: Indexes improve query speed for filtering active puppies

---

## Troubleshooting

### "relation already exists" or "column already exists"
✅ **This is GOOD!** Migration was already applied. Skip to next step.

### "permission denied"
❌ Use service role key or database owner credentials. Check you're logged in as project owner.

### Migration runs but verification fails
1. Refresh Supabase dashboard
2. Check you're connected to correct project
3. Re-run verification query after 30 seconds

### Still failing after migrations applied
1. Clear Next.js build cache: `rm -rf .next`
2. Restart dev server: `npm run dev`
3. Check environment variables match production

---

## Questions?

- Check main docs: `SOFT_DELETE_DEPLOYMENT.md`
- Check migration logs: `MIGRATIONS.md`
- Verify constraints: `node scripts/verify-constraints.mjs`

**Don't wait - apply these migrations now to unblock your deployments!** ⚡
