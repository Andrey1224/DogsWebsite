-- Pending reservation expiry must never touch rows that already carry a provider payment ID.
-- In this application reservations are created after capture, so such rows represent money taken.

DROP FUNCTION IF EXISTS public.expire_pending_reservations();

CREATE FUNCTION public.expire_pending_reservations()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expired_count INTEGER;
  expired_puppy_ids UUID[];
BEGIN
  WITH expired AS (
    UPDATE public.reservations
    SET status = 'expired',
        updated_at = NOW()
    WHERE status = 'pending'
      AND external_payment_id IS NULL
      AND expires_at IS NOT NULL
      AND expires_at <= NOW()
    RETURNING puppy_id
  )
  SELECT COUNT(*)::INTEGER, ARRAY_AGG(DISTINCT puppy_id)
  INTO expired_count, expired_puppy_ids
  FROM expired;

  UPDATE public.puppies AS p
  SET status = 'available',
      updated_at = NOW()
  WHERE p.id = ANY(COALESCE(expired_puppy_ids, ARRAY[]::UUID[]))
    AND p.status = 'reserved'
    AND NOT EXISTS (
      SELECT 1
      FROM public.reservations AS active
      WHERE active.puppy_id = p.id
        AND active.status IN ('pending', 'paid')
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.reservations AS paid_signal
      WHERE paid_signal.puppy_id = p.id
        AND paid_signal.external_payment_id IS NOT NULL
    );
  RETURN COALESCE(expired_count, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.expire_pending_reservations() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.expire_pending_reservations() TO service_role;

COMMENT ON FUNCTION public.expire_pending_reservations() IS
  'Expires only unpaid pending reservations and safely releases affected puppies.';
