-- Migration: Add customer reviews table for public testimonials
-- Description: Store user-submitted reviews from the /reviews form

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  location TEXT NOT NULL,
  visit_date DATE NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  story TEXT NOT NULL,
  photo_urls TEXT[] NOT NULL DEFAULT '{}',
  source TEXT NOT NULL DEFAULT 'form',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published')),
  client_ip INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_status_created_at
  ON reviews (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_visit_date
  ON reviews (visit_date DESC);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published reviews"
ON reviews
FOR SELECT
USING (status = 'published');

CREATE POLICY "Service role manages reviews"
ON reviews
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

COMMENT ON TABLE reviews IS 'Customer testimonials submitted from the public reviews form.';
COMMENT ON COLUMN reviews.author_name IS 'Name shown with the testimonial.';
COMMENT ON COLUMN reviews.location IS 'City and state displayed with the testimonial.';
COMMENT ON COLUMN reviews.visit_date IS 'Month/year when the family visited or picked up their puppy.';
COMMENT ON COLUMN reviews.story IS 'Customer provided story/quote.';
COMMENT ON COLUMN reviews.photo_urls IS 'Public URLs to up to three review photos stored in Supabase Storage.';
COMMENT ON COLUMN reviews.source IS 'Submission source (form, admin, migration, etc).';
COMMENT ON COLUMN reviews.status IS 'Publishing workflow state (pending, published).';
COMMENT ON COLUMN reviews.client_ip IS 'Captured client IP for spam mitigation/auditing.';
COMMENT ON COLUMN reviews.created_at IS 'When the review was stored.';

-- Storage bucket for review photos (public read)
-- Using INSERT for compatibility with local Supabase (storage.create_bucket has different signatures)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reviews',
  'reviews',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'] -- Only allow images
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access for review photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'reviews');
