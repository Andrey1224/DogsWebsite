-- Migration: add payment_type to reservations
-- Purpose: distinguish deposit-only reservations from full-price purchases,
-- and mark the puppy 'sold' (instead of 'reserved') when paid in full.

ALTER TABLE reservations
  ADD COLUMN payment_type TEXT NOT NULL DEFAULT 'deposit'
  CHECK (payment_type IN ('deposit', 'full'));

-- Adding a trailing parameter to an existing function via CREATE OR REPLACE creates a
-- second overload rather than replacing it (Postgres matches on full parameter list,
-- not just the name). Drop the pre-payment_type signature first so only one remains.
DROP FUNCTION IF EXISTS create_reservation_transaction(
  UUID, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, TEXT, TEXT, TIMESTAMPTZ, TEXT
);

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
  p_notes TEXT,
  p_payment_type TEXT DEFAULT 'deposit'
)
RETURNS reservations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_puppy puppies%ROWTYPE;
  v_reservation reservations%ROWTYPE;
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

  IF p_payment_type = 'full' AND v_puppy.price_usd IS NOT NULL AND p_deposit_amount <> v_puppy.price_usd THEN
    RAISE EXCEPTION 'FULL_PAYMENT_AMOUNT_MISMATCH';
  END IF;

  UPDATE puppies
  SET status = CASE WHEN p_payment_type = 'full' THEN 'sold' ELSE 'reserved' END,
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
    payment_type,
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
    p_expires_at,
    NULLIF(TRIM(p_notes), ''),
    COALESCE(p_payment_type, 'deposit'),
    NOW(),
    NOW()
  )
  RETURNING *
  INTO v_reservation;

  RETURN v_reservation;
END;
$$;

GRANT EXECUTE ON FUNCTION create_reservation_transaction(
  UUID,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  NUMERIC,
  NUMERIC,
  TEXT,
  TEXT,
  TIMESTAMPTZ,
  TEXT,
  TEXT
) TO service_role;
