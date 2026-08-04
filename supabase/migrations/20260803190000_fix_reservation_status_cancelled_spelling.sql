-- The app (lib/reservations/queries.ts ReservationQueries.cancel) writes status
-- 'cancelled' (matches the design intent already present in migration
-- 20251010021104_reservation_constraints.sql), but a stale legacy constraint on
-- some environments only allowed 'canceled', causing the admin cancel-reservation
-- action to fail with a check constraint violation.

-- Drop constraints first so the data normalization below is not blocked.
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_status_check;
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS valid_reservation_status;

-- Normalize existing data to the corrected spelling.
UPDATE reservations SET status = 'cancelled' WHERE status = 'canceled';

-- Re-add a single corrected constraint (reservations_status_check is redundant
-- with this one and also lacked 'expired', so it is not re-created).
ALTER TABLE reservations ADD CONSTRAINT valid_reservation_status
  CHECK (status IN ('pending', 'paid', 'cancelled', 'expired', 'refunded'));
