-- Fix: COALESCE uuid vs integer in check_puppy_availability()

CREATE OR REPLACE FUNCTION public.check_puppy_availability()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  puppy_available BOOLEAN;
BEGIN
  IF TG_OP = 'INSERT'
     OR (TG_OP = 'UPDATE' AND NEW.status IN ('pending', 'paid')) THEN
    SELECT (
      SELECT COUNT(*) = 0
      FROM reservations
      WHERE puppy_id = NEW.puppy_id
        AND (
          status = 'paid'
          OR (status = 'pending' AND (expires_at IS NULL OR expires_at > NOW()))
        )
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) INTO puppy_available;

    IF NOT puppy_available THEN
      RAISE EXCEPTION 'Puppy is not available for reservation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
