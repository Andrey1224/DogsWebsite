-- Keep local rebuilds aligned with the production reviews schema.
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_reviews_featured_status
  ON public.reviews (featured, status, created_at DESC)
  WHERE featured = TRUE;
