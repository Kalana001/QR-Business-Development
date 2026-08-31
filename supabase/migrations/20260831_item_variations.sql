-- ============================================================================
-- QR Business Catalog — Item Variations & View Update Migration
-- ============================================================================

-- 1. Ensure display_order column exists on public.catalog_items
ALTER TABLE public.catalog_items 
  ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

-- 2. Add variations JSONB column to public.catalog_items
ALTER TABLE public.catalog_items 
  ADD COLUMN IF NOT EXISTS variations JSONB DEFAULT '[]'::jsonb;

-- 3. Create index for display_order if not exists
CREATE INDEX IF NOT EXISTS idx_items_display_order ON public.catalog_items(business_id, display_order);

-- 4. Drop existing view to allow clean column structure update
DROP VIEW IF EXISTS public.public_catalog_items CASCADE;

-- 5. Create updated PUBLIC CATALOG ITEMS VIEW
CREATE VIEW public.public_catalog_items AS
WITH ranked_items AS (
  SELECT 
    ci.*,
    b.subscription_status,
    b.subscription_end_date,
    b.max_items,
    public.is_business_subscription_expired(b.subscription_status, b.subscription_end_date) AS is_expired,
    CASE 
      WHEN public.is_business_subscription_expired(b.subscription_status, b.subscription_end_date) THEN 10 
      ELSE b.max_items 
    END AS effective_max_items,
    ROW_NUMBER() OVER (
      PARTITION BY ci.business_id 
      ORDER BY ci.display_order ASC, ci.created_at ASC, ci.id ASC
    ) AS item_rank
  FROM public.catalog_items ci
  JOIN public.businesses b ON b.id = ci.business_id
  WHERE ci.is_available = true AND b.is_public = true
)
SELECT 
  id, business_id, category_id, name, display_order, author, isbn, duration, badges,
  description, price, quantity, is_available, is_featured, image_url, variations,
  external_source, external_product_id, last_synced_at, created_at, updated_at
FROM ranked_items
WHERE effective_max_items IS NULL OR item_rank <= effective_max_items;

GRANT SELECT ON public.public_catalog_items TO anon, authenticated;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
