-- ============================================================================
-- QR Business Catalog — Analytics Tables & Row Level Security Migration
-- Idempotent setup for analytics_qr_scans, analytics_item_views, analytics_search_logs
-- ============================================================================

-- 1. Analytics QR Scans Table
CREATE TABLE IF NOT EXISTS public.analytics_qr_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  device_type TEXT DEFAULT 'desktop',
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for tenant-isolated fast date filtering
CREATE INDEX IF NOT EXISTS idx_analytics_qr_scans_biz_date 
  ON public.analytics_qr_scans(business_id, created_at DESC);

-- 2. Analytics Item Views Table
CREATE TABLE IF NOT EXISTS public.analytics_item_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  item_id UUID,
  item_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_item_views_biz_date 
  ON public.analytics_item_views(business_id, created_at DESC);

-- 3. Analytics Search Logs Table
CREATE TABLE IF NOT EXISTS public.analytics_search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  query_text TEXT NOT NULL,
  results_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_search_logs_biz_date 
  ON public.analytics_search_logs(business_id, created_at DESC);

-- Enable RLS on all analytics tables
ALTER TABLE public.analytics_qr_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_item_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_search_logs ENABLE ROW LEVEL SECURITY;

-- Anonymous public visitors can insert analytics events for any public business catalog
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'analytics_qr_scans' AND policyname = 'Public visitors log QR scans'
  ) THEN
    CREATE POLICY "Public visitors log QR scans" ON public.analytics_qr_scans
      FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'analytics_item_views' AND policyname = 'Public visitors log item views'
  ) THEN
    CREATE POLICY "Public visitors log item views" ON public.analytics_item_views
      FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'analytics_search_logs' AND policyname = 'Public visitors log search queries'
  ) THEN
    CREATE POLICY "Public visitors log search queries" ON public.analytics_search_logs
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Business members and Super Admins can select analytics belonging to their business
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'analytics_qr_scans' AND policyname = 'Business members view QR scans'
  ) THEN
    CREATE POLICY "Business members view QR scans" ON public.analytics_qr_scans
      FOR SELECT USING (public.is_business_member(business_id) OR public.is_super_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'analytics_item_views' AND policyname = 'Business members view item views'
  ) THEN
    CREATE POLICY "Business members view item views" ON public.analytics_item_views
      FOR SELECT USING (public.is_business_member(business_id) OR public.is_super_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'analytics_search_logs' AND policyname = 'Business members view search logs'
  ) THEN
    CREATE POLICY "Business members view search logs" ON public.analytics_search_logs
      FOR SELECT USING (public.is_business_member(business_id) OR public.is_super_admin());
  END IF;
END $$;
