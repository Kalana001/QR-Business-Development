-- ============================================================================
-- MIGRATION: Add optional Catalog Item Images setting (show_item_images)
-- ============================================================================

-- 1. Safely add show_item_images column to public.businesses table (defaults to TRUE)
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS show_item_images BOOLEAN NOT NULL DEFAULT true;

-- 2. Drop existing view to avoid PostgreSQL 42P16 column position shift error
DROP VIEW IF EXISTS public.public_businesses CASCADE;

-- 3. Recreate public_businesses view exposing show_item_images
CREATE VIEW public.public_businesses AS
SELECT 
  id,
  name,
  slug,
  business_type,
  description,
  phone,
  email,
  address,
  website,
  logo_url,
  banner_url,
  currency,
  theme_color,
  is_public,
  show_item_images,
  created_at,
  updated_at
FROM public.businesses
WHERE is_public = true;

-- 4. Grant permissions on the view
GRANT SELECT ON public.public_businesses TO anon, authenticated;
