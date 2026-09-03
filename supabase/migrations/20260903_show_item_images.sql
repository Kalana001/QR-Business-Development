-- ============================================================================
-- MIGRATION: Add optional Catalog Item Images setting (show_item_images)
-- ============================================================================

-- 1. Safely add show_item_images column to public.businesses table (defaults to TRUE)
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS show_item_images BOOLEAN NOT NULL DEFAULT true;

-- 2. Refresh public_businesses view to expose show_item_images to anonymous public catalog visitors
CREATE OR REPLACE VIEW public.public_businesses AS
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

-- Grant permissions on the view
GRANT SELECT ON public.public_businesses TO anon, authenticated;
