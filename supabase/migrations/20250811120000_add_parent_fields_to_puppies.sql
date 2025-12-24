-- Migration: Add direct parent references to puppies table
-- Author: Claude Code
-- Date: 2025-08-11
-- Purpose: Allow puppies to reference sire (father) and dam (mother) directly
--          instead of only through litters. This enables flexible parent assignment
--          and simplifies adding parent photos in the future.

-- Add sire_id and dam_id columns to puppies table
ALTER TABLE puppies
  ADD COLUMN sire_id UUID REFERENCES parents(id) ON DELETE SET NULL,
  ADD COLUMN dam_id UUID REFERENCES parents(id) ON DELETE SET NULL;

-- Add indices for performance on foreign key lookups
CREATE INDEX idx_puppies_sire_id ON puppies(sire_id);
CREATE INDEX idx_puppies_dam_id ON puppies(dam_id);

-- Migrate existing data from litters to direct parent references
-- This populates sire_id and dam_id for puppies that already have a litter assigned
UPDATE puppies p
SET
  sire_id = l.sire_id,
  dam_id = l.dam_id
FROM litters l
WHERE p.litter_id = l.id AND p.litter_id IS NOT NULL;

-- Add column comments for documentation
COMMENT ON COLUMN puppies.sire_id IS 'Direct reference to male parent (father)';
COMMENT ON COLUMN puppies.dam_id IS 'Direct reference to female parent (mother)';

-- Note: litter_id column is kept for backward compatibility
-- It can be deprecated in a future migration if no longer needed
