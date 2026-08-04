-- Unify reservation availability, unique-violation mapping, and atomic puppy release.

ALTER TABLE public.webhook_events
  ADD COLUMN IF NOT EXISTS last_alerted_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.claim_webhook_alert(
  p_provider TEXT,
  p_idempotency_key TEXT,
  p_throttle_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claimed_count INTEGER := 0;
BEGIN
  UPDATE public.webhook_events
  SET last_alerted_at = NOW(),
      updated_at = NOW()
  WHERE provider = p_provider
    AND idempotency_key = p_idempotency_key
    AND (
      last_alerted_at IS NULL
      OR last_alerted_at <= NOW() - make_interval(mins => p_throttle_minutes)
    );

  GET DIAGNOSTICS claimed_count = ROW_COUNT;
  RETURN claimed_count > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_webhook_alert(TEXT, TEXT, INTEGER)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_webhook_alert(TEXT, TEXT, INTEGER) TO service_role;

CREATE OR REPLACE FUNCTION public.check_puppy_availability()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR NEW.status IN ('pending', 'paid'))
     AND EXISTS (
       SELECT 1
       FROM public.reservations AS existing
       WHERE existing.puppy_id = NEW.puppy_id
         AND existing.id IS DISTINCT FROM NEW.id
         AND (
           existing.status = 'paid'
           OR (
             existing.status = 'pending'
             AND (
               existing.external_payment_id IS NOT NULL
               OR existing.expires_at IS NULL
               OR existing.expires_at > NOW()
             )
           )
         )
     ) THEN
    RAISE EXCEPTION 'PUPPY_NOT_AVAILABLE';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.release_puppy_if_no_active_reservations(p_puppy_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  released_count INTEGER := 0;
BEGIN
  UPDATE public.puppies AS puppy
  SET status = 'available',
      updated_at = NOW()
  WHERE puppy.id = p_puppy_id
    AND puppy.status IN ('reserved', 'sold')
    AND NOT EXISTS (
      SELECT 1
      FROM public.reservations AS active
      WHERE active.puppy_id = puppy.id
        AND (
          active.status = 'paid'
          OR (
            active.status = 'pending'
            AND (
              active.external_payment_id IS NOT NULL
              OR active.expires_at IS NULL
              OR active.expires_at > NOW()
            )
          )
        )
    );

  GET DIAGNOSTICS released_count = ROW_COUNT;
  RETURN released_count > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.release_puppy_if_no_active_reservations(UUID)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.release_puppy_if_no_active_reservations(UUID) TO service_role;

CREATE OR REPLACE FUNCTION public.create_reservation_transaction(
  p_puppy_id UUID,
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_customer_phone TEXT,
  p_channel TEXT,
  p_deposit_amount NUMERIC,
  p_amount NUMERIC,
  p_payment_provider TEXT,
  p_external_payment_id TEXT,
  p_expires_at TIMESTAMPTZ,
  p_notes TEXT,
  p_payment_type TEXT DEFAULT 'deposit'
)
RETURNS public.reservations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_puppy public.puppies%ROWTYPE;
  v_reservation public.reservations%ROWTYPE;
  v_constraint TEXT;
BEGIN
  SELECT *
  INTO v_puppy
  FROM public.puppies
  WHERE id = p_puppy_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PUPPY_NOT_FOUND';
  END IF;

  -- Sweep only holds for which no provider payment was ever recorded.
  UPDATE public.reservations
  SET status = 'expired',
      updated_at = NOW()
  WHERE puppy_id = p_puppy_id
    AND status = 'pending'
    AND external_payment_id IS NULL
    AND expires_at IS NOT NULL
    AND expires_at <= NOW();

  IF v_puppy.status IS DISTINCT FROM 'available'
     OR EXISTS (
       SELECT 1
       FROM public.reservations AS active
       WHERE active.puppy_id = p_puppy_id
         AND (
           active.status = 'paid'
           OR (
             active.status = 'pending'
             AND (
               active.external_payment_id IS NOT NULL
               OR active.expires_at IS NULL
               OR active.expires_at > NOW()
             )
           )
         )
     ) THEN
    RAISE EXCEPTION 'PUPPY_NOT_AVAILABLE';
  END IF;

  IF v_puppy.price_usd IS NOT NULL AND p_deposit_amount > v_puppy.price_usd THEN
    RAISE EXCEPTION 'DEPOSIT_EXCEEDS_PRICE';
  END IF;

  IF p_payment_type = 'full'
     AND v_puppy.price_usd IS NOT NULL
     AND p_deposit_amount <> v_puppy.price_usd THEN
    RAISE EXCEPTION 'FULL_PAYMENT_AMOUNT_MISMATCH';
  END IF;

  BEGIN
    UPDATE public.puppies
    SET status = CASE WHEN p_payment_type = 'full' THEN 'sold' ELSE 'reserved' END,
        updated_at = NOW()
    WHERE id = p_puppy_id;

    INSERT INTO public.reservations (
      puppy_id, customer_name, customer_email, customer_phone, channel, status,
      deposit_amount, amount, payment_provider, external_payment_id, expires_at,
      notes, payment_type, created_at, updated_at
    ) VALUES (
      p_puppy_id, NULLIF(TRIM(p_customer_name), ''), LOWER(TRIM(p_customer_email)),
      NULLIF(TRIM(p_customer_phone), ''), COALESCE(p_channel, 'site'), 'pending',
      p_deposit_amount, p_amount, p_payment_provider, p_external_payment_id, p_expires_at,
      NULLIF(TRIM(p_notes), ''), COALESCE(p_payment_type, 'deposit'), NOW(), NOW()
    )
    RETURNING * INTO v_reservation;
  EXCEPTION WHEN unique_violation THEN
    GET STACKED DIAGNOSTICS v_constraint = CONSTRAINT_NAME;
    IF v_constraint = 'idx_one_active_reservation_per_puppy' THEN
      RAISE EXCEPTION 'PUPPY_NOT_AVAILABLE';
    ELSIF v_constraint = 'unique_external_payment_per_provider' THEN
      RAISE EXCEPTION 'DUPLICATE_EXTERNAL_PAYMENT';
    ELSE
      RAISE;
    END IF;
  END;

  RETURN v_reservation;
END;
$$;

REVOKE ALL ON FUNCTION public.create_reservation_transaction(
  UUID, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, TEXT, TEXT, TIMESTAMPTZ, TEXT, TEXT
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_reservation_transaction(
  UUID, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, TEXT, TEXT, TIMESTAMPTZ, TEXT, TEXT
) TO service_role;
