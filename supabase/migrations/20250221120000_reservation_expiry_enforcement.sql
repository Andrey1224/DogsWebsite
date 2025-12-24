-- Migration: enforce reservation expiry defaults and availability checks
-- Description: ensure pending reservations auto-expire after 15 minutes and release puppies when holds lapse

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = 'create_reservation_transaction'
  ) THEN
    RAISE NOTICE 'create_reservation_transaction does not exist yet; skipping update.';
  ELSE
    CREATE OR REPLACE FUNCTION create_reservation_transaction(
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
      p_notes TEXT
    )
    RETURNS reservations
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $function$
    DECLARE
      v_puppy puppies%ROWTYPE;
      v_reservation reservations%ROWTYPE;
      v_expires_at TIMESTAMPTZ := COALESCE(p_expires_at, NOW() + interval '15 minutes');
    BEGIN
      SELECT *
      INTO v_puppy
      FROM puppies
      WHERE id = p_puppy_id
      FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'PUPPY_NOT_FOUND';
      END IF;

      IF v_puppy.status IS DISTINCT FROM 'available' THEN
        RAISE EXCEPTION 'PUPPY_NOT_AVAILABLE';
      END IF;

      IF v_puppy.price_usd IS NOT NULL AND p_deposit_amount > v_puppy.price_usd THEN
        RAISE EXCEPTION 'DEPOSIT_EXCEEDS_PRICE';
      END IF;

      UPDATE puppies
      SET status = 'reserved',
          updated_at = NOW()
      WHERE id = p_puppy_id;

      INSERT INTO reservations (
        puppy_id,
        customer_name,
        customer_email,
        customer_phone,
        channel,
        status,
        deposit_amount,
        amount,
        payment_provider,
        external_payment_id,
        expires_at,
        notes,
        created_at,
        updated_at
      )
      VALUES (
        p_puppy_id,
        NULLIF(TRIM(p_customer_name), ''),
        LOWER(TRIM(p_customer_email)),
        NULLIF(TRIM(p_customer_phone), ''),
        COALESCE(p_channel, 'site'),
        'pending',
        p_deposit_amount,
        p_amount,
        p_payment_provider,
        p_external_payment_id,
        v_expires_at,
        NULLIF(TRIM(p_notes), ''),
        NOW(),
        NOW()
      )
      RETURNING *
      INTO v_reservation;

      RETURN v_reservation;
    END;
    $function$;
  END IF;
END
$$;

-- Refresh trigger helper to ignore expired pending reservations
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

DO $$
BEGIN
  DROP TRIGGER IF EXISTS enforce_puppy_availability ON reservations;
  CREATE TRIGGER enforce_puppy_availability
    BEFORE INSERT OR UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION check_puppy_availability();
END
$$;

-- Replace expiry helper to mark pending holds as cancelled and release puppies
CREATE OR REPLACE FUNCTION expire_pending_reservations()
RETURNS INTEGER AS $expire$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE reservations
  SET status = 'cancelled',
      updated_at = NOW()
  WHERE status = 'pending'
    AND expires_at IS NOT NULL
    AND expires_at <= NOW();

  GET DIAGNOSTICS expired_count = ROW_COUNT;

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
