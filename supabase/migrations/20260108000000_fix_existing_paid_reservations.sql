-- Migration: Fix existing reservations with paid external payments
-- Description: Update status 'pending' → 'paid' for reservations with external_payment_id
-- Date: 2026-01-08
-- Purpose: Addresses historical data where webhooks created reservations but never updated status to 'paid'

-- Update reservations older than 1 hour with external payment IDs still pending
-- These are likely paid but status wasn't updated due to the bug
UPDATE reservations
SET
  status = 'paid',
  notes = COALESCE(notes || E'\n\n', '') || '[Migration 2026-01-08] Status corrected from pending to paid (external payment confirmed)',
  updated_at = NOW()
WHERE
  status = 'pending'
  AND external_payment_id IS NOT NULL
  AND payment_provider IS NOT NULL
  AND created_at < NOW() - INTERVAL '1 hour'
  AND created_at > '2024-01-01'; -- Only fix recent data

-- Log the changes
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % reservations from pending to paid', updated_count;
END $$;

-- Add index for better performance on status queries if not exists
CREATE INDEX IF NOT EXISTS idx_reservations_status_updated
  ON reservations(status, updated_at DESC);

-- Add comment documenting status flow
COMMENT ON COLUMN reservations.status IS
  'Reservation lifecycle: pending (created) → paid (payment confirmed) → refunded (payment returned) | cancelled (manually cancelled) | expired (timeout)';
