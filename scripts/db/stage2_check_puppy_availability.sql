-- Stage 2: Update check_puppy_availability to respect expires_at timestamp
-- Enhancement: Filters out expired pending reservations

CREATE OR REPLACE FUNCTION check_puppy_availability()
RETURNS TRIGGER AS $availability$
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
        AND id != COALESCE(NEW.id, 0)
    ) INTO puppy_available;

    IF NOT puppy_available THEN
      RAISE EXCEPTION 'Puppy is not available for reservation';
    END IF;
  END IF;

  RETURN NEW;
END;
$availability$ LANGUAGE plpgsql;
