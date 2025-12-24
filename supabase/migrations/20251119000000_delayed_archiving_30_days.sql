-- Add sold_at field and implement 30-day delayed archiving for sold puppies
-- Migration: 20251119T000000Z_delayed_archiving_30_days
-- Author: Claude Code
-- Date: 2025-11-19
-- Purpose: Replace immediate archiving with 30-day delayed archiving when puppies are sold

-- ============================================================================
-- STEP 1: Add sold_at timestamp field to puppies table
-- ============================================================================

ALTER TABLE puppies
ADD COLUMN IF NOT EXISTS sold_at TIMESTAMPTZ;

COMMENT ON COLUMN puppies.sold_at IS 'Timestamp when puppy status was changed to "sold". Used for delayed archiving (30 days after sale).';

-- ============================================================================
-- STEP 2: Backfill sold_at for existing sold puppies
-- ============================================================================
-- Estimate sold_at from updated_at for puppies already marked as sold
UPDATE puppies
SET sold_at = updated_at
WHERE status = 'sold' AND sold_at IS NULL;

-- ============================================================================
-- STEP 3: Create index for efficient delayed archiving queries
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_puppies_sold_at
  ON puppies(sold_at)
  WHERE status = 'sold' AND is_archived = false;

COMMENT ON INDEX idx_puppies_sold_at IS 'Optimizes queries for delayed archiving of sold puppies';

-- ============================================================================
-- STEP 4: Drop old immediate archiving trigger
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_auto_archive_sold ON puppies;
DROP FUNCTION IF EXISTS auto_archive_sold_puppies();

-- ============================================================================
-- STEP 5: Create new trigger function to track sold timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION track_sold_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- Track when status changes TO 'sold' (wasn't sold before)
  IF NEW.status = 'sold' AND (OLD.status IS NULL OR OLD.status != 'sold') THEN
    NEW.sold_at = NOW();
    -- Keep is_archived as false until delayed archiving runs (30 days later)
  END IF;

  -- If status changes FROM 'sold' to something else, clear sold_at
  -- (e.g., if admin changes status back to 'available')
  IF OLD.status = 'sold' AND NEW.status != 'sold' THEN
    NEW.sold_at = NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION track_sold_timestamp() IS 'Tracks when a puppy is marked as sold for delayed archiving purposes';

-- ============================================================================
-- STEP 6: Create new trigger for tracking sold timestamp
-- ============================================================================

CREATE TRIGGER trigger_track_sold
  BEFORE UPDATE ON puppies
  FOR EACH ROW
  EXECUTE FUNCTION track_sold_timestamp();

COMMENT ON TRIGGER trigger_track_sold ON puppies IS 'Automatically sets sold_at when puppy status changes to "sold"';

-- ============================================================================
-- STEP 7: Create function for delayed archiving (30 days after sale)
-- ============================================================================

CREATE OR REPLACE FUNCTION archive_sold_puppies_after_30_days()
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  -- Archive puppies where:
  --   1. Status is 'sold'
  --   2. sold_at is at least 30 days ago
  --   3. Not already archived
  UPDATE puppies
  SET is_archived = true,
      updated_at = NOW()
  WHERE status = 'sold'
    AND sold_at IS NOT NULL
    AND sold_at <= NOW() - INTERVAL '30 days'
    AND is_archived = false;

  GET DIAGNOSTICS archived_count = ROW_COUNT;

  RETURN COALESCE(archived_count, 0);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION archive_sold_puppies_after_30_days() IS 'Archives sold puppies that have been sold for at least 30 days. Returns count of archived puppies.';

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION archive_sold_puppies_after_30_days() TO service_role;

-- ============================================================================
-- STEP 8: Schedule pg_cron job to run daily at 2 AM UTC
-- ============================================================================
-- Note: pg_cron is only available in Supabase production, not in local dev
-- This block will silently skip if cron schema doesn't exist (local dev)

DO $$
BEGIN
  -- Check if pg_cron extension is available
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Schedule the job
    PERFORM cron.schedule(
      'archive-sold-puppies-after-30-days',  -- Job name
      '0 2 * * *',                            -- Daily at 2 AM UTC
      'SELECT archive_sold_puppies_after_30_days();'
    );
    RAISE NOTICE 'pg_cron job scheduled successfully';
  ELSE
    RAISE NOTICE 'pg_cron extension not found - skipping job scheduling (expected in local dev)';
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES (Run these manually to verify the migration)
-- ============================================================================

-- Check that sold_at column exists
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'puppies' AND column_name = 'sold_at';

-- Check pg_cron job is scheduled
-- SELECT jobid, jobname, schedule, command, active
-- FROM cron.job
-- WHERE jobname = 'archive-sold-puppies-after-30-days';

-- Check sold puppies have sold_at timestamp
-- SELECT id, name, status, sold_at, is_archived
-- FROM puppies
-- WHERE status = 'sold'
-- ORDER BY sold_at DESC NULLS LAST;

-- Test the archiving function manually (safe to run, only archives if >= 30 days)
-- SELECT archive_sold_puppies_after_30_days();
