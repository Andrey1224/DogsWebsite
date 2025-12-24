-- Stage 4: Update expire_pending_reservations function
-- Changes: Return INTEGER (expired count) and release puppies when no active reservations

CREATE OR REPLACE FUNCTION expire_pending_reservations()
RETURNS INTEGER AS $expire$
DECLARE
  expired_count INTEGER;
BEGIN
  -- Mark expired pending reservations as cancelled
  UPDATE reservations
  SET status = 'cancelled',
      updated_at = NOW()
  WHERE status = 'pending'
    AND expires_at IS NOT NULL
    AND expires_at <= NOW();

  GET DIAGNOSTICS expired_count = ROW_COUNT;

  -- Release puppies that have no active reservations
  UPDATE puppies AS p
  SET status = 'available',
      updated_at = NOW()
  WHERE p.status = 'reserved'
    AND NOT EXISTS (
      SELECT 1
      FROM reservations r
      WHERE r.puppy_id = p.id
        AND (
          r.status = 'paid'
          OR (r.status = 'pending' AND (r.expires_at IS NULL OR r.expires_at > NOW()))
        )
    );

  RETURN COALESCE(expired_count, 0);
END;
$expire$ LANGUAGE plpgsql;
