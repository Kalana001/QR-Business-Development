-- ============================================================================
-- QR Business Catalog — Analytics RLS Security Hardening Migration
-- Production-ready validation and tenant isolation for analytics tables
-- ============================================================================

-- 1. Helper Function: Validate business_id exists in public.businesses
CREATE OR REPLACE FUNCTION public.is_valid_business_id(b_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN b_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.businesses WHERE id = b_id
  );
END;
$$;

-- 2. Helper Function: Validate item_id belongs to the business_id in public.catalog_items
CREATE OR REPLACE FUNCTION public.is_valid_catalog_item_for_business(b_id UUID, i_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF b_id IS NULL THEN
    RETURN FALSE;
  END IF;
  IF i_id IS NULL THEN
    RETURN TRUE; -- Allow general item view events without specific item_id
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.catalog_items WHERE id = i_id AND business_id = b_id
  );
END;
$$;

-- Grant EXECUTE permissions on validation functions to public, anon, and authenticated
GRANT EXECUTE ON FUNCTION public.is_valid_business_id(UUID) TO public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_valid_catalog_item_for_business(UUID, UUID) TO public, anon, authenticated;

-- Ensure RLS is enabled on all analytics tables
ALTER TABLE public.analytics_qr_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_item_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_search_logs ENABLE ROW LEVEL SECURITY;

-- Clean up any previous policies idempotently
DROP POLICY IF EXISTS "Public visitors log QR scans" ON public.analytics_qr_scans;
DROP POLICY IF EXISTS "Public visitors log item views" ON public.analytics_item_views;
DROP POLICY IF EXISTS "Public visitors log search queries" ON public.analytics_search_logs;
DROP POLICY IF EXISTS "Business members view QR scans" ON public.analytics_qr_scans;
DROP POLICY IF EXISTS "Business members view item views" ON public.analytics_item_views;
DROP POLICY IF EXISTS "Business members view search logs" ON public.analytics_search_logs;
DROP POLICY IF EXISTS "Hardened public visitors log QR scans" ON public.analytics_qr_scans;
DROP POLICY IF EXISTS "Hardened public visitors log item views" ON public.analytics_item_views;
DROP POLICY IF EXISTS "Hardened public visitors log search queries" ON public.analytics_search_logs;
DROP POLICY IF EXISTS "Hardened business members view QR scans" ON public.analytics_qr_scans;
DROP POLICY IF EXISTS "Hardened business members view item views" ON public.analytics_item_views;
DROP POLICY IF EXISTS "Hardened business members view search logs" ON public.analytics_search_logs;

-- ============================================================================
-- INSERT POLICIES (Anonymous / Public Visitors)
-- Validates business existence, item ownership, query length, and value bounds
-- ============================================================================

CREATE POLICY "Hardened public visitors log QR scans"
  ON public.analytics_qr_scans
  FOR INSERT
  WITH CHECK (
    public.is_valid_business_id(business_id) AND
    (device_type IS NULL OR length(device_type) <= 50) AND
    (user_agent IS NULL OR length(user_agent) <= 500)
  );

CREATE POLICY "Hardened public visitors log item views"
  ON public.analytics_item_views
  FOR INSERT
  WITH CHECK (
    public.is_valid_business_id(business_id) AND
    public.is_valid_catalog_item_for_business(business_id, item_id) AND
    length(trim(item_name)) > 0 AND length(item_name) <= 250
  );

CREATE POLICY "Hardened public visitors log search queries"
  ON public.analytics_search_logs
  FOR INSERT
  WITH CHECK (
    public.is_valid_business_id(business_id) AND
    length(trim(query_text)) > 0 AND length(query_text) <= 250 AND
    results_count >= 0 AND results_count <= 10000
  );

-- ============================================================================
-- SELECT POLICIES (Authorized Business Members & Super Admins ONLY)
-- Business A CANNOT read Business B analytics. Anonymous CANNOT read any analytics.
-- ============================================================================

CREATE POLICY "Hardened business members view QR scans"
  ON public.analytics_qr_scans
  FOR SELECT
  USING (public.is_business_member(business_id) OR public.is_super_admin());

CREATE POLICY "Hardened business members view item views"
  ON public.analytics_item_views
  FOR SELECT
  USING (public.is_business_member(business_id) OR public.is_super_admin());

CREATE POLICY "Hardened business members view search logs"
  ON public.analytics_search_logs
  FOR SELECT
  USING (public.is_business_member(business_id) OR public.is_super_admin());

-- Notify PostgREST API to reload schema cache
NOTIFY pgrst, 'reload schema';
