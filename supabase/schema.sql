-- ============================================================================
-- QR Business Catalog — Database Schema & Security Specification (Idempotent)
-- PostgreSQL + Supabase Row Level Security (RLS)
-- ============================================================================

-- 1. Profiles Table (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Businesses Table (Multi-tenant Root)
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  business_type TEXT NOT NULL CHECK (business_type IN ('restaurant', 'bookshop', 'salon', 'general')),
  description TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  website TEXT,
  logo_url TEXT,
  banner_url TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  theme_color TEXT NOT NULL DEFAULT '#0F172A',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_businesses_slug ON public.businesses(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON public.businesses(owner_id);

-- 3. Business Members Table (Team Roles)
CREATE TABLE IF NOT EXISTS public.business_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, user_id)
);

-- 4. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_business ON public.categories(business_id);

-- 5. Catalog Items Table
CREATE TABLE IF NOT EXISTS public.catalog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  -- Restaurant / Salon / General & Bookshop specific fields
  author TEXT,           -- Bookshop
  isbn TEXT,             -- Bookshop
  duration INTEGER,      -- Salon / Barber (minutes)
  badges TEXT[] DEFAULT '{}', -- Restaurant badges (e.g. ["Vegan", "Chef's Choice"])
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  quantity INTEGER,      -- Bookshop / General inventory
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  image_url TEXT,
  
  -- Future Integration Mapping Fields
  external_source TEXT,
  external_product_id TEXT,
  last_synced_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_items_business ON public.catalog_items(business_id);
CREATE INDEX IF NOT EXISTS idx_items_category ON public.catalog_items(category_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check if authenticated user belongs to business
CREATE OR REPLACE FUNCTION public.is_business_member(b_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.businesses WHERE id = b_id AND owner_id = auth.uid()
    UNION
    SELECT 1 FROM public.business_members WHERE business_id = b_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- PROFILES POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public profiles are readable" ON public.profiles;
CREATE POLICY "Public profiles are readable"
  ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- BUSINESSES POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public catalog business view" ON public.businesses;
CREATE POLICY "Public catalog business view"
  ON public.businesses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create business" ON public.businesses;
CREATE POLICY "Authenticated users can create business"
  ON public.businesses FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Business members can update business" ON public.businesses;
CREATE POLICY "Business members can update business"
  ON public.businesses FOR UPDATE USING (public.is_business_member(id));

DROP POLICY IF EXISTS "Business owner can delete business" ON public.businesses;
CREATE POLICY "Business owner can delete business"
  ON public.businesses FOR DELETE USING (auth.uid() = owner_id);

-- ----------------------------------------------------------------------------
-- BUSINESS MEMBERS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Members can view membership" ON public.business_members;
CREATE POLICY "Members can view membership"
  ON public.business_members FOR SELECT USING (
    user_id = auth.uid() OR public.is_business_member(business_id)
  );

DROP POLICY IF EXISTS "Business owner can manage members" ON public.business_members;
CREATE POLICY "Business owner can manage members"
  ON public.business_members FOR ALL USING (
    EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
  );

-- ----------------------------------------------------------------------------
-- CATEGORIES POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public customer category view" ON public.categories;
CREATE POLICY "Public customer category view"
  ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Business members manage categories" ON public.categories;
CREATE POLICY "Business members manage categories"
  ON public.categories FOR ALL USING (public.is_business_member(business_id));

-- ----------------------------------------------------------------------------
-- CATALOG ITEMS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public customer items view" ON public.catalog_items;
CREATE POLICY "Public customer items view"
  ON public.catalog_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Business members manage items" ON public.catalog_items;
CREATE POLICY "Business members manage items"
  ON public.catalog_items FOR ALL USING (public.is_business_member(business_id));

-- ============================================================================
-- STORAGE BUCKETS & POLICIES
-- ============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('business-assets', 'business-assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public storage view" ON storage.objects;
CREATE POLICY "Public storage view" 
  ON storage.objects FOR SELECT USING (bucket_id = 'business-assets');

DROP POLICY IF EXISTS "Authenticated upload" ON storage.objects;
CREATE POLICY "Authenticated upload" 
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'business-assets' AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Authenticated update/delete" ON storage.objects;
CREATE POLICY "Authenticated update/delete" 
  ON storage.objects FOR ALL USING (
    bucket_id = 'business-assets' AND auth.role() = 'authenticated'
  );

-- ============================================================================
-- NEW USER TRIGGER: Auto-create profile on auth sign up
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
