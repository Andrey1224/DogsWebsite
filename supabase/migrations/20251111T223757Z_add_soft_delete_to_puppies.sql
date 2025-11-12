-- Add soft delete (archivation) support to puppies table
-- Migration: 20251111T223757Z_add_soft_delete_to_puppies

-- Add is_archived column
ALTER TABLE puppies
  ADD COLUMN is_archived boolean NOT NULL DEFAULT false;

-- Add index for fast filtering of active puppies
CREATE INDEX idx_puppies_is_archived
  ON puppies(is_archived);

-- Add composite index for sorted queries of active puppies
CREATE INDEX idx_puppies_active_created
  ON puppies(is_archived, created_at DESC)
  WHERE is_archived = false;

-- Add column comment
COMMENT ON COLUMN puppies.is_archived IS
  'Soft delete flag. Archived puppies are hidden from public catalog but preserved for historical records (inquiries, reservations)';

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
