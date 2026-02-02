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
