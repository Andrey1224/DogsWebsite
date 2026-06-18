-- Keep sold puppy profiles public while preserving manual soft-delete support.
-- Sold puppies remain non-reservable through their status. The is_archived flag is
-- reserved for listings that an administrator intentionally hides.

DO $$
DECLARE
  job RECORD;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    FOR job IN
      SELECT jobid
      FROM cron.job
      WHERE jobname = 'archive-sold-puppies-after-30-days'
    LOOP
      PERFORM cron.unschedule(job.jobid);
    END LOOP;
  END IF;
END;
$$;

DROP FUNCTION IF EXISTS public.archive_sold_puppies_after_30_days();

COMMENT ON COLUMN public.puppies.is_archived IS
  'Manual soft-delete flag. Archived puppies are hidden from the public catalog and direct URLs.';

COMMENT ON COLUMN public.puppies.sold_at IS
  'Timestamp when puppy status changed to sold. Sold puppies remain public unless manually archived.';

UPDATE public.puppies
SET is_archived = false,
    updated_at = NOW()
WHERE status = 'sold'
  AND LOWER(COALESCE(slug, '')) <> 'test';

UPDATE public.puppies
SET is_archived = true,
    updated_at = NOW()
WHERE LOWER(COALESCE(slug, '')) = 'test';
