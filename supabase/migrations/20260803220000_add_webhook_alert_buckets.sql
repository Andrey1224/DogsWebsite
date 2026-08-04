-- Durable cross-lambda aggregation for alert storms such as replayed stale Stripe events.

CREATE TABLE IF NOT EXISTS public.webhook_alert_buckets (
  provider TEXT NOT NULL,
  bucket_key TEXT NOT NULL,
  last_alerted_at TIMESTAMPTZ,
  pending_count INTEGER NOT NULL DEFAULT 0 CHECK (pending_count >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (provider, bucket_key)
);

ALTER TABLE public.webhook_alert_buckets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.webhook_alert_buckets FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.webhook_alert_buckets TO service_role;

CREATE OR REPLACE FUNCTION public.claim_webhook_alert_bucket(
  p_provider TEXT,
  p_bucket_key TEXT,
  p_throttle_minutes INTEGER DEFAULT 15
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  bucket public.webhook_alert_buckets%ROWTYPE;
  alert_count INTEGER;
BEGIN
  INSERT INTO public.webhook_alert_buckets (provider, bucket_key)
  VALUES (p_provider, p_bucket_key)
  ON CONFLICT (provider, bucket_key) DO NOTHING;

  SELECT * INTO bucket
  FROM public.webhook_alert_buckets
  WHERE provider = p_provider AND bucket_key = p_bucket_key
  FOR UPDATE;

  alert_count := bucket.pending_count + 1;
  IF bucket.last_alerted_at IS NULL
     OR bucket.last_alerted_at <= NOW() - make_interval(mins => p_throttle_minutes) THEN
    UPDATE public.webhook_alert_buckets
    SET last_alerted_at = NOW(), pending_count = 0, updated_at = NOW()
    WHERE provider = p_provider AND bucket_key = p_bucket_key;
    RETURN alert_count;
  END IF;

  UPDATE public.webhook_alert_buckets
  SET pending_count = alert_count, updated_at = NOW()
  WHERE provider = p_provider AND bucket_key = p_bucket_key;
  RETURN 0;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_webhook_alert_bucket(TEXT, TEXT, INTEGER)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_webhook_alert_bucket(TEXT, TEXT, INTEGER) TO service_role;
