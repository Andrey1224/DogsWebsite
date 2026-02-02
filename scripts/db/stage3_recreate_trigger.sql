-- Stage 3: Recreate enforce_puppy_availability trigger
-- Applies updated check_puppy_availability function

DO $$
BEGIN
  DROP TRIGGER IF EXISTS enforce_puppy_availability ON reservations;
  CREATE TRIGGER enforce_puppy_availability
    BEFORE INSERT OR UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION check_puppy_availability();

  RAISE NOTICE 'Successfully recreated enforce_puppy_availability trigger';
END
$$;
