-- Migration: Add parent metadata fields to puppies table
-- Author: Claude Code
-- Date: 2025-08-12
-- Purpose: Allow storing parent names and photos directly on puppy records
--          without requiring parent records in parents table.
--          This simplifies the workflow for breeders who work with different
--          parents each time and want to quickly add name + photos.

-- Add parent metadata columns
ALTER TABLE puppies
  ADD COLUMN sire_name TEXT,
  ADD COLUMN dam_name TEXT,
  ADD COLUMN sire_photo_urls TEXT[] DEFAULT '{}',
  ADD COLUMN dam_photo_urls TEXT[] DEFAULT '{}';

-- Add column comments for documentation
COMMENT ON COLUMN puppies.sire_name IS 'Direct sire (father) name when no parent record exists in parents table';
COMMENT ON COLUMN puppies.dam_name IS 'Direct dam (mother) name when no parent record exists in parents table';
COMMENT ON COLUMN puppies.sire_photo_urls IS 'Array of up to 3 photo URLs for sire (stored in Supabase Storage)';
COMMENT ON COLUMN puppies.dam_photo_urls IS 'Array of up to 3 photo URLs for dam (stored in Supabase Storage)';

-- Note: Existing sire_id and dam_id fields are kept for advanced users
-- Priority: sire_id/dam_id (parent records) → sire_name/dam_name (metadata) → null
