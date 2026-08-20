-- ============================================================================
-- QR Business Catalog — Hardened Database Schema & Security Specification
-- Multi-Tenant Row Level Security (RLS) + Protected Subscription Security
-- ============================================================================

-- 1. Profiles Table (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Super Admin Platform Table
CREATE TABLE IF NOT EXISTS public.platform_admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helper Function: Check if caller is a Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Businesses Table (Multi-tenant Root with Subscriptions)
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
  currency TEXT NOT NULL DEFAULT 'LKR',
  theme_color TEXT NOT NULL DEFAULT '#0F172A',
  
  -- Subscription & Limit System Fields (Protected from non-admin updates)
  subscription_plan TEXT NOT NULL DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'enterprise')),
  subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'expired')),
  subscription_start_date TIMESTAMPTZ DEFAULT NOW(),
  subscription_end_date TIMESTAMPTZ, -- NULL for perpetual Free plan
  max_items INTEGER NOT NULL DEFAULT 10,
  max_categories INTEGER NOT NULL DEFAULT 5,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safely add subscription columns if missing on existing instances
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS subscription_plan TEXT NOT NULL DEFAULT 'free';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS max_items INTEGER NOT NULL DEFAULT 10;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS max_categories INTEGER NOT NULL DEFAULT 5;

CREATE INDEX IF NOT EXISTS idx_businesses_slug ON public.businesses(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON public.businesses(owner_id);

-- 4. Business Members Table (Team Roles)
CREATE TABLE IF NOT EXISTS public.business_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, user_id)
);

-- 5. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_business ON public.categories(business_id);

-- 6. Catalog Items Table
CREATE TABLE IF NOT EXISTS public.catalog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  author TEXT,           -- Bookshop
  isbn TEXT,             -- Bookshop
  duration INTEGER CHECK (duration IS NULL OR duration >= 0), -- Salon / Barber (minutes)
  badges TEXT[] DEFAULT '{}', -- Restaurant badges
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (price >= 0.00),
  quantity INTEGER CHECK (quantity IS NULL OR quantity >= 0), -- Inventory stock
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  image_url TEXT,
  
  external_source TEXT,
  external_product_id TEXT,
  last_synced_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_items_business ON public.catalog_items(business_id);
CREATE INDEX IF NOT EXISTS idx_items_category ON public.catalog_items(category_id);

-- ============================================================================
-- AUTHORIZATION HELPER FUNCTIONS
-- ============================================================================

-- Check if caller is business owner
CREATE OR REPLACE FUNCTION public.is_business_owner(b_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.businesses WHERE id = b_id AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if caller is business owner or staff member
CREATE OR REPLACE FUNCTION public.is_business_member(b_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.is_business_owner(b_id) OR EXISTS (
    SELECT 1 FROM public.business_members WHERE business_id = b_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if caller can manage business catalog (owner or staff)
CREATE OR REPLACE FUNCTION public.can_manage_catalog(b_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.is_business_member(b_id) OR public.is_super_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PUBLIC DATA ISOLATION (Customer Catalog View)
-- ============================================================================

-- Create secure view exposing ONLY customer-safe fields
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
  created_at,
  updated_at
FROM public.businesses;

GRANT SELECT ON public.public_businesses TO anon, authenticated;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

-- 1. PLATFORM ADMINS POLICIES
DROP POLICY IF EXISTS "Admins can view admin list" ON public.platform_admins;
CREATE POLICY "Admins can view admin list" ON public.platform_admins FOR SELECT USING (auth.uid() = user_id OR public.is_super_admin());

-- 2. PROFILES POLICIES (No public SELECT allowed)
DROP POLICY IF EXISTS "Public profiles are readable" ON public.profiles;
DROP POLICY IF EXISTS "Members or admins can view profiles" ON public.profiles;
CREATE POLICY "Members or admins can view profiles" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_super_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. BUSINESSES POLICIES (Restricted direct table access)
DROP POLICY IF EXISTS "Public catalog business view" ON public.businesses;

DROP POLICY IF EXISTS "Business members or admins can select business" ON public.businesses;
CREATE POLICY "Business members or admins can select business" ON public.businesses 
FOR SELECT USING (public.is_business_member(id) OR public.is_super_admin());

DROP POLICY IF EXISTS "Authenticated users can create business" ON public.businesses;
CREATE POLICY "Authenticated users can create business" ON public.businesses 
FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Business owners or admins can update business" ON public.businesses;
CREATE POLICY "Business owners or admins can update business" ON public.businesses 
FOR UPDATE USING (public.is_business_owner(id) OR public.is_super_admin());

DROP POLICY IF EXISTS "Business owner can delete business" ON public.businesses;
CREATE POLICY "Business owner can delete business" ON public.businesses 
FOR DELETE USING (public.is_business_owner(id) OR public.is_super_admin());

-- 4. CATEGORIES POLICIES
DROP POLICY IF EXISTS "Public customer category view" ON public.categories;
CREATE POLICY "Public customer category view" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Business members manage categories" ON public.categories;

DROP POLICY IF EXISTS "Members can insert categories" ON public.categories;
CREATE POLICY "Members can insert categories" ON public.categories 
FOR INSERT WITH CHECK (public.can_manage_catalog(business_id));

DROP POLICY IF EXISTS "Members can update categories" ON public.categories;
CREATE POLICY "Members can update categories" ON public.categories 
FOR UPDATE USING (public.can_manage_catalog(business_id)) WITH CHECK (public.can_manage_catalog(business_id));

DROP POLICY IF EXISTS "Members can delete categories" ON public.categories;
CREATE POLICY "Members can delete categories" ON public.categories 
FOR DELETE USING (public.can_manage_catalog(business_id));

-- 5. CATALOG ITEMS POLICIES
DROP POLICY IF EXISTS "Public customer items view" ON public.catalog_items;
CREATE POLICY "Public customer items view" ON public.catalog_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Business members manage items" ON public.catalog_items;

DROP POLICY IF EXISTS "Members can insert items" ON public.catalog_items;
CREATE POLICY "Members can insert items" ON public.catalog_items 
FOR INSERT WITH CHECK (public.can_manage_catalog(business_id));

DROP POLICY IF EXISTS "Members can update items" ON public.catalog_items;
CREATE POLICY "Members can update items" ON public.catalog_items 
FOR UPDATE USING (public.can_manage_catalog(business_id)) WITH CHECK (public.can_manage_catalog(business_id));

DROP POLICY IF EXISTS "Members can delete items" ON public.catalog_items;
CREATE POLICY "Members can delete items" ON public.catalog_items 
FOR DELETE USING (public.can_manage_catalog(business_id));

-- ============================================================================
-- BUSINESS UPDATE SECURITY: PROTECT SENSITIVE BILLING & OWNERSHIP FIELDS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.protect_business_sensitive_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Super Admins are permitted to modify billing fields
  IF public.is_super_admin() THEN
    RETURN NEW;
  END IF;

  -- Block non-admin modification of protected fields
  IF NEW.owner_id IS DISTINCT FROM OLD.owner_id OR
     NEW.subscription_plan IS DISTINCT FROM OLD.subscription_plan OR
     NEW.subscription_status IS DISTINCT FROM OLD.subscription_status OR
     NEW.subscription_start_date IS DISTINCT FROM OLD.subscription_start_date OR
     NEW.subscription_end_date IS DISTINCT FROM OLD.subscription_end_date OR
     NEW.max_items IS DISTINCT FROM OLD.max_items OR
     NEW.max_categories IS DISTINCT FROM OLD.max_categories THEN
    RAISE EXCEPTION 'Access Denied: Non-administrative users cannot modify subscription, limit, or ownership fields.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_protect_business_fields ON public.businesses;
CREATE TRIGGER tr_protect_business_fields
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.protect_business_sensitive_fields();

-- ============================================================================
-- SECURE SUPER-ADMIN SUBSCRIPTION APPROVAL RPC
-- ============================================================================

CREATE OR REPLACE FUNCTION public.admin_update_subscription(
  p_business_id UUID,
  p_plan TEXT,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS public.businesses AS $$
DECLARE
  v_max_items INT := 10;
  v_max_categories INT := 5;
  v_result public.businesses;
BEGIN
  -- Enforce Super Admin Check
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Access Denied: Super Admin privileges required.' USING ERRCODE = '42501';
  END IF;

  IF p_plan = 'pro' THEN
    v_max_items := 150;
    v_max_categories := 20;
  ELSIF p_plan = 'enterprise' THEN
    v_max_items := 999999;
    v_max_categories := 999999;
  ELSE
    v_max_items := 10;
    v_max_categories := 5;
  END IF;

  UPDATE public.businesses
  SET 
    subscription_plan = p_plan,
    subscription_status = 'active',
    subscription_start_date = p_start_date,
    subscription_end_date = CASE WHEN p_plan = 'free' THEN NULL ELSE p_end_date END,
    max_items = v_max_items,
    max_categories = v_max_categories,
    updated_at = NOW()
  WHERE id = p_business_id
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STORAGE BUCKETS & PATH-BASED TENANT ISOLATION POLICIES
-- ============================================================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('business-assets', 'business-assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public storage view" ON storage.objects;
CREATE POLICY "Public storage view" ON storage.objects FOR SELECT USING (bucket_id = 'business-assets');

DROP POLICY IF EXISTS "Authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Tenant isolated upload" ON storage.objects;
CREATE POLICY "Tenant isolated upload" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'business-assets' AND 
  auth.role() = 'authenticated' AND
  public.can_manage_catalog(((storage.foldername(name))[1])::uuid)
);

DROP POLICY IF EXISTS "Tenant isolated update" ON storage.objects;
CREATE POLICY "Tenant isolated update" ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'business-assets' AND 
  public.can_manage_catalog(((storage.foldername(name))[1])::uuid)
);

DROP POLICY IF EXISTS "Tenant isolated delete" ON storage.objects;
CREATE POLICY "Tenant isolated delete" ON storage.objects FOR DELETE 
USING (
  bucket_id = 'business-assets' AND 
  public.can_manage_catalog(((storage.foldername(name))[1])::uuid)
);

-- ============================================================================
-- NEW USER WORKSPACE TRIGGER: Create Profile & Business Workspace
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  b_name TEXT;
  b_type TEXT;
  base_slug TEXT;
  final_slug TEXT;
  counter INT := 0;
BEGIN
  -- 1. Create User Profile
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  -- 2. Extract Business Metadata from signup
  b_name := COALESCE(NEW.raw_user_meta_data->>'business_name', NEW.raw_user_meta_data->>'full_name', 'My Business Catalog');
  b_type := COALESCE(NEW.raw_user_meta_data->>'business_type', 'restaurant');
  
  base_slug := LOWER(REGEXP_REPLACE(b_name, '[^a-zA-Z0-9]+', '-', 'g'));
  IF base_slug = '' OR base_slug IS NULL THEN base_slug := 'biz'; END IF;
  final_slug := base_slug;

  WHILE EXISTS (SELECT 1 FROM public.businesses WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter || '-' || SUBSTRING(NEW.id::text FROM 1 FOR 4);
  END LOOP;

  -- 3. Create Separate Business Workspace for New User (Free plan has NULL expiration)
  INSERT INTO public.businesses (
    owner_id, name, slug, business_type, currency, theme_color,
    subscription_plan, subscription_status, subscription_start_date, subscription_end_date, max_items, max_categories
  )
  VALUES (
    NEW.id,
    b_name,
    final_slug,
    b_type,
    'LKR',
    '#0F172A',
    'free',
    'active',
    NOW(),
    NULL, -- Perpetual Free Plan
    10,
    5
  )
  ON CONFLICT (slug) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
