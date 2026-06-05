-- ============================================================
-- ELCS — Storage bucket for product images
-- Run in Supabase SQL Editor after 001_initial_schema.sql
-- ============================================================

-- Create the public product-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,   -- 5 MB per file
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Public can read (bucket is already public=true, but explicit policy is cleaner)
CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Only admins can upload / delete
CREATE POLICY "Admin upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND is_admin());

CREATE POLICY "Admin update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND is_admin());

CREATE POLICY "Admin delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND is_admin());
