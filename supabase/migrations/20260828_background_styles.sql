-- ============================================================================
-- QR Business Catalog — Background Customization System Migration
-- Adds catalog_theme_settings table & background_style column with pure-canvas default
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.catalog_theme_settings (
  business_id UUID PRIMARY KEY REFERENCES public.businesses(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL DEFAULT 'minimal-clean',
  background_style TEXT NOT NULL DEFAULT 'pure-canvas',
  primary_color TEXT NOT NULL DEFAULT '#0F172A',
  secondary_color TEXT NOT NULL DEFAULT '#1E293B',
  accent_color TEXT NOT NULL DEFAULT '#0F172A',
  card_style TEXT NOT NULL DEFAULT 'rounded',
  header_style TEXT NOT NULL DEFAULT 'standard',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.catalog_theme_settings ADD COLUMN IF NOT EXISTS background_style TEXT NOT NULL DEFAULT 'pure-canvas';

-- Enable RLS
ALTER TABLE public.catalog_theme_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can read theme settings for public catalog rendering
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'catalog_theme_settings' AND policyname = 'Public catalog theme settings read'
  ) THEN
    CREATE POLICY "Public catalog theme settings read"
      ON public.catalog_theme_settings
      FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'catalog_theme_settings' AND policyname = 'Business members manage theme settings'
  ) THEN
    CREATE POLICY "Business members manage theme settings"
      ON public.catalog_theme_settings
      FOR ALL
      USING (public.can_manage_catalog(business_id))
      WITH CHECK (public.can_manage_catalog(business_id));
  END IF;
END $$;
