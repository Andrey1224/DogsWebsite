-- Migration: Add reservation constraints and indexes
-- Description: Enhance reservations table with proper constraints, indexes, and relationships

-- First, let's check if the reservations table exists and add missing columns/constraints
DO $$
BEGIN
  -- Add payment_provider column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reservations' AND column_name = 'payment_provider'
  ) THEN
    ALTER TABLE reservations ADD COLUMN payment_provider TEXT CHECK (payment_provider IN ('stripe', 'paypal'));
  END IF;

  -- Add external_payment_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reservations' AND column_name = 'external_payment_id'
  ) THEN
    ALTER TABLE reservations ADD COLUMN external_payment_id TEXT;
  END IF;

  -- Add webhook_event_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reservations' AND column_name = 'webhook_event_id'
  ) THEN
    ALTER TABLE reservations ADD COLUMN webhook_event_id BIGINT REFERENCES webhook_events(id) ON DELETE SET NULL;
  END IF;

  -- Add expires_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reservations' AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE reservations ADD COLUMN expires_at TIMESTAMPTZ;
  END IF;
END
$$;

-- Add proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_reservations_puppy_id ON reservations(puppy_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_payment_provider ON reservations(payment_provider);
CREATE INDEX IF NOT EXISTS idx_reservations_external_payment_id ON reservations(external_payment_id);
CREATE INDEX IF NOT EXISTS idx_reservations_webhook_event_id ON reservations(webhook_event_id);
CREATE INDEX IF NOT EXISTS idx_reservations_expires_at ON reservations(expires_at);
CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON reservations(created_at);

-- Add unique constraint for external payment IDs per provider
ALTER TABLE reservations ADD CONSTRAINT unique_external_payment_per_provider
  UNIQUE (payment_provider, external_payment_id)
  WHERE payment_provider IS NOT NULL AND external_payment_id IS NOT NULL;

-- Ensure only one active reservation per puppy
-- This uses a partial unique index on status
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_reservation_per_puppy
  ON reservations(puppy_id)
  WHERE status IN ('pending', 'paid');

-- Add check constraints for data integrity
ALTER TABLE reservations ADD CONSTRAINT valid_reservation_amount
  CHECK (amount >= 0);

ALTER TABLE reservations ADD CONSTRAINT valid_reservation_status
  CHECK (status IN ('pending', 'paid', 'cancelled', 'expired', 'refunded'));

-- Add function to check puppy availability
CREATE OR REPLACE FUNCTION check_puppy_availability()
RETURNS TRIGGER AS $$
DECLARE
  puppy_available BOOLEAN;
BEGIN
  -- Check if puppy is still available for new reservations
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.status IN ('pending', 'paid')) THEN
    SELECT (
      SELECT COUNT(*) = 0
      FROM reservations
      WHERE puppy_id = NEW.puppy_id
      AND status IN ('pending', 'paid')
      AND id != COALESCE(NEW.id, 0)
    ) INTO puppy_available;

    IF NOT puppy_available THEN
      RAISE EXCEPTION 'Puppy is not available for reservation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to enforce puppy availability
DO $$
BEGIN
  DROP TRIGGER IF EXISTS enforce_puppy_availability ON reservations;
  CREATE TRIGGER enforce_puppy_availability
    BEFORE INSERT OR UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION check_puppy_availability();
END
$$;

-- Add function to automatically expire pending reservations
CREATE OR REPLACE FUNCTION expire_pending_reservations()
RETURNS VOID AS $$
BEGIN
  UPDATE reservations
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending'
  AND expires_at IS NOT NULL
  AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Add function to get reservation summary
CREATE OR REPLACE FUNCTION get_reservation_summary(puppy_id_param BIGINT)
RETURNS TABLE(
  total_reservations BIGINT,
  pending_reservations BIGINT,
  paid_reservations BIGINT,
  total_amount DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE status = 'pending')::BIGINT,
    COUNT(*) FILTER (WHERE status = 'paid')::BIGINT,
    COALESCE(SUM(amount), 0)::DECIMAL(10,2)
  FROM reservations
  WHERE puppy_id = puppy_id_param;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON COLUMN reservations.payment_provider IS 'Payment provider: stripe or paypal';
COMMENT ON COLUMN reservations.external_payment_id IS 'External payment ID from provider (e.g., Stripe Payment Intent ID)';
COMMENT ON COLUMN reservations.webhook_event_id IS 'Reference to the webhook event that created this reservation';
COMMENT ON COLUMN reservations.expires_at IS 'When the reservation expires if not paid';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON reservations TO anon, authenticated;
GRANT SELECT ON webhook_events TO authenticated;

-- Only service role can modify reservations and webhook events
GRANT ALL ON reservations TO service_role;
GRANT ALL ON webhook_events TO service_role;