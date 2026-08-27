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
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()
  );
END;
$$;

-- Seed Super Admin Platform Account
INSERT INTO public.platform_admins (user_id)
SELECT id FROM public.profiles WHERE id = '63a57078-68b1-4ee0-b459-67a0e8346fc9'
ON CONFLICT (user_id) DO NOTHING;

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
  is_public BOOLEAN NOT NULL DEFAULT true, -- Publication Control (FIX #4)
  
  -- Subscription & Limit System Fields (Protected from non-admin updates)
  subscription_plan TEXT NOT NULL DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'enterprise')),
  subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'expired')),
  subscription_start_date TIMESTAMPTZ DEFAULT NOW(),
  subscription_end_date TIMESTAMPTZ, -- NULL for perpetual Free plan
  max_items INTEGER DEFAULT 10,       -- NULL means Unlimited (Business Plus)
  max_categories INTEGER DEFAULT 5,   -- NULL means Unlimited (Business Plus)

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true;

-- Safely convert existing fake 999999 limits to NULL for Business Plus (Enterprise)
ALTER TABLE public.businesses ALTER COLUMN max_items DROP NOT NULL;
ALTER TABLE public.businesses ALTER COLUMN max_categories DROP NOT NULL;
UPDATE public.businesses SET max_items = NULL, max_categories = NULL WHERE max_items >= 900000 OR subscription_plan = 'enterprise';

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
  display_order INTEGER NOT NULL DEFAULT 0, -- Item Display Order (Requirement #2)
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

ALTER TABLE public.catalog_items ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_items_business ON public.catalog_items(business_id);
CREATE INDEX IF NOT EXISTS idx_items_category ON public.catalog_items(category_id);
CREATE INDEX IF NOT EXISTS idx_items_display_order ON public.catalog_items(business_id, display_order);

-- ============================================================================
-- AUTHORIZATION HELPER FUNCTIONS (STABLE VOLATILITY FIX #6)
-- ============================================================================

-- Check if business subscription is currently expired (STABLE because it evaluates NOW())
CREATE OR REPLACE FUNCTION public.is_business_subscription_expired(
  p_status TEXT,
  p_end_date TIMESTAMPTZ
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_status = 'expired' THEN
    RETURN TRUE;
  END IF;
  IF p_end_date IS NOT NULL AND p_end_date < NOW() THEN
    RETURN TRUE;
  END IF;
  RETURN FALSE;
END;
$$;

-- Check if caller is business owner
CREATE OR REPLACE FUNCTION public.is_business_owner(b_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.businesses WHERE id = b_id AND owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.business_members WHERE business_id = b_id AND user_id = auth.uid() AND role = 'owner'
  );
END;
$$;

-- Check if caller is business staff member
CREATE OR REPLACE FUNCTION public.is_business_staff(b_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.business_members WHERE business_id = b_id AND user_id = auth.uid() AND role = 'staff'
  );
END;
$$;

-- Check if caller is business owner or staff member
CREATE OR REPLACE FUNCTION public.is_business_member(b_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN public.is_business_owner(b_id) OR public.is_business_staff(b_id);
END;
$$;

-- Check if caller can manage business catalog (owner, staff, or super admin)
CREATE OR REPLACE FUNCTION public.can_manage_catalog(b_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN public.is_business_member(b_id) OR public.is_super_admin();
END;
$$;

-- ============================================================================
-- SECURE PUBLIC ACCESS VIEWS (SANITIZED & RANK-LIMITED FIXES #1, #2, #3, #4)
-- ============================================================================

-- 1. PUBLIC BUSINESSES VIEW (Exposes ONLY public customer branding/contact info - FIX #3 & #4)
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
  created_at,
  updated_at
FROM public.businesses
WHERE is_public = true;

GRANT SELECT ON public.public_businesses TO anon, authenticated;

-- 2. PUBLIC CATEGORIES VIEW (Window Function Rank Enforced - FIX #2)
CREATE OR REPLACE VIEW public.public_categories AS
WITH ranked_categories AS (
  SELECT 
    c.*,
    b.subscription_status,
    b.subscription_end_date,
    b.max_categories,
    public.is_business_subscription_expired(b.subscription_status, b.subscription_end_date) AS is_expired,
    CASE 
      WHEN public.is_business_subscription_expired(b.subscription_status, b.subscription_end_date) THEN 5 
      ELSE b.max_categories 
    END AS effective_max_categories,
    ROW_NUMBER() OVER (
      PARTITION BY c.business_id 
      ORDER BY c.display_order ASC, c.created_at ASC, c.id ASC
    ) AS cat_rank
  FROM public.categories c
  JOIN public.businesses b ON b.id = c.business_id
  WHERE b.is_public = true
)
SELECT 
  id, business_id, name, description, display_order, created_at
FROM ranked_categories
WHERE effective_max_categories IS NULL OR cat_rank <= effective_max_categories;

GRANT SELECT ON public.public_categories TO anon, authenticated;

-- 3. PUBLIC CATALOG ITEMS VIEW (Window Function Rank Enforced with Display Order Requirement #2)
CREATE OR REPLACE VIEW public.public_catalog_items AS
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
  description, price, quantity, is_available, is_featured, image_url,
  external_source, external_product_id, last_synced_at, created_at, updated_at
FROM ranked_items
WHERE effective_max_items IS NULL OR item_rank <= effective_max_items;

GRANT SELECT ON public.public_catalog_items TO anon, authenticated;

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
CREATE POLICY "Admins can view admin list" ON public.platform_admins 
FOR SELECT USING (auth.uid() = user_id OR public.is_super_admin());

-- 2. PROFILES POLICIES (No public SELECT allowed)
DROP POLICY IF EXISTS "Public profiles are readable" ON public.profiles;
DROP POLICY IF EXISTS "Members or admins can view profiles" ON public.profiles;
CREATE POLICY "Members or admins can view profiles" ON public.profiles 
FOR SELECT USING (auth.uid() = id OR public.is_super_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles 
FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

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

-- 4. BUSINESS MEMBERS POLICIES (Explicit Tenant Isolation - FIX #5)
DROP POLICY IF EXISTS "Members can view business team" ON public.business_members;
CREATE POLICY "Members can view business team" ON public.business_members 
FOR SELECT USING (
  auth.uid() = user_id OR 
  public.is_business_owner(business_id) OR 
  public.is_super_admin()
);

DROP POLICY IF EXISTS "Owners can add business members" ON public.business_members;
CREATE POLICY "Owners can add business members" ON public.business_members 
FOR INSERT WITH CHECK (
  public.is_business_owner(business_id) OR 
  public.is_super_admin()
);

DROP POLICY IF EXISTS "Owners can update business members" ON public.business_members;
CREATE POLICY "Owners can update business members" ON public.business_members 
FOR UPDATE USING (
  public.is_business_owner(business_id) OR 
  public.is_super_admin()
) WITH CHECK (
  public.is_business_owner(business_id) OR 
  public.is_super_admin()
);

DROP POLICY IF EXISTS "Owners can delete business members" ON public.business_members;
CREATE POLICY "Owners can delete business members" ON public.business_members 
FOR DELETE USING (
  public.is_business_owner(business_id) OR 
  public.is_super_admin()
);

-- 5. CATEGORIES POLICIES (No Direct Public SELECT Access - Requirement #1)
DROP POLICY IF EXISTS "Public customer category view" ON public.categories;
DROP POLICY IF EXISTS "Members or admins can select categories" ON public.categories;
CREATE POLICY "Members or admins can select categories" ON public.categories 
FOR SELECT USING (public.can_manage_catalog(categories.business_id));

DROP POLICY IF EXISTS "Members can insert categories" ON public.categories;
CREATE POLICY "Members can insert categories" ON public.categories 
FOR INSERT WITH CHECK (public.can_manage_catalog(categories.business_id));

DROP POLICY IF EXISTS "Members can update categories" ON public.categories;
CREATE POLICY "Members can update categories" ON public.categories 
FOR UPDATE USING (public.can_manage_catalog(categories.business_id)) WITH CHECK (public.can_manage_catalog(categories.business_id));

DROP POLICY IF EXISTS "Members can delete categories" ON public.categories;
CREATE POLICY "Members can delete categories" ON public.categories 
FOR DELETE USING (public.can_manage_catalog(categories.business_id));

-- 6. CATALOG ITEMS POLICIES (No Direct Public SELECT Access - Requirement #1)
DROP POLICY IF EXISTS "Public customer items view" ON public.catalog_items;
DROP POLICY IF EXISTS "Members or admins can select items" ON public.catalog_items;
CREATE POLICY "Members or admins can select items" ON public.catalog_items 
FOR SELECT USING (public.can_manage_catalog(catalog_items.business_id));

DROP POLICY IF EXISTS "Members can insert items" ON public.catalog_items;
CREATE POLICY "Members can insert items" ON public.catalog_items 
FOR INSERT WITH CHECK (public.can_manage_catalog(catalog_items.business_id));

DROP POLICY IF EXISTS "Members can update items" ON public.catalog_items;
CREATE POLICY "Members can update items" ON public.catalog_items 
FOR UPDATE USING (public.can_manage_catalog(catalog_items.business_id)) WITH CHECK (public.can_manage_catalog(catalog_items.business_id));

DROP POLICY IF EXISTS "Members can delete items" ON public.catalog_items;
CREATE POLICY "Members can delete items" ON public.catalog_items 
FOR DELETE USING (public.can_manage_catalog(catalog_items.business_id));

-- ============================================================================
-- BUSINESS UPDATE SECURITY: PROTECT SENSITIVE BILLING & OWNERSHIP FIELDS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.protect_business_sensitive_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
$$;

DROP TRIGGER IF EXISTS tr_protect_business_fields ON public.businesses;
CREATE TRIGGER tr_protect_business_fields
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.protect_business_sensitive_fields();

-- ============================================================================
-- SECURE SUPER-ADMIN SUBSCRIPTION APPROVAL RPC (STRICT VALIDATION FIX #7)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.admin_update_subscription(
  p_business_id UUID,
  p_plan TEXT,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS public.businesses
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_max_items INT;
  v_max_categories INT;
  v_result public.businesses;
  v_amount NUMERIC(10,2);
BEGIN
  -- 1. Enforce Super Admin Check
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Access Denied: Super Admin privileges required.' USING ERRCODE = '42501';
  END IF;

  -- 2. Validate Subscription Plan (Reject invalid plans - FIX #7)
  IF p_plan NOT IN ('free', 'pro', 'enterprise', 'enterprise_gift') THEN
    RAISE EXCEPTION 'Invalid subscription plan: %. Plan must be free, pro, enterprise, or enterprise_gift.', p_plan USING ERRCODE = '22023';
  END IF;

  -- 3. Validate Date Range for Paid Plans (FIX #7)
  IF p_plan IN ('pro', 'enterprise', 'enterprise_gift') THEN
    IF p_end_date IS NULL OR p_end_date <= p_start_date THEN
      RAISE EXCEPTION 'Invalid date range: end_date must be later than start_date.' USING ERRCODE = '22023';
    END IF;
  END IF;

  -- 4. Calculate Internal Limits and Pricing Amount
  IF p_plan = 'pro' THEN
    v_max_items := 150;
    v_max_categories := 20;
    v_amount := 2000.00;
  ELSIF p_plan = 'enterprise' THEN
    v_max_items := NULL; -- NULL means Unlimited (Business Plus)
    v_max_categories := NULL; -- NULL means Unlimited (Business Plus)
    v_amount := 3500.00;
  ELSIF p_plan = 'enterprise_gift' THEN
    v_max_items := NULL; -- NULL means Unlimited (VIP Gift)
    v_max_categories := NULL; -- NULL means Unlimited (VIP Gift)
    v_amount := 0.00;
  ELSE
    v_max_items := 10;
    v_max_categories := 5;
    v_amount := 0.00;
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

  -- 5. Record Payment Entry
  INSERT INTO public.subscription_payments (
    business_id, plan, amount, payment_reference, start_date, end_date, approved_by
  ) VALUES (
    p_business_id, p_plan, v_amount, 'Super Admin Manual Approval', p_start_date, p_end_date, auth.uid()
  );

  -- 6. Log Admin Audit Action
  INSERT INTO public.admin_audit_logs (
    admin_user_id, business_id, action, details
  ) VALUES (
    auth.uid(), p_business_id, 'subscription_approved', jsonb_build_object(
      'plan', p_plan,
      'start_date', p_start_date,
      'end_date', p_end_date,
      'amount', v_amount
    )
  );

  RETURN v_result;
END;
$$;

-- ============================================================================
-- STORAGE BUCKETS & PATH-BASED TENANT ISOLATION POLICIES (REGEX FIX #8)
-- ============================================================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('business-assets', 'business-assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public storage view" ON storage.objects;
CREATE POLICY "Public storage view" ON storage.objects FOR SELECT USING (bucket_id = 'business-assets');

DROP POLICY IF EXISTS "Tenant isolated upload" ON storage.objects;
CREATE POLICY "Tenant isolated upload" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'business-assets' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' AND
  public.can_manage_catalog(((storage.foldername(name))[1])::uuid)
);

DROP POLICY IF EXISTS "Tenant isolated update" ON storage.objects;
CREATE POLICY "Tenant isolated update" ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'business-assets' AND 
  (storage.foldername(name))[1] ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' AND
  public.can_manage_catalog(((storage.foldername(name))[1])::uuid)
);

DROP POLICY IF EXISTS "Tenant isolated delete" ON storage.objects;
CREATE POLICY "Tenant isolated delete" ON storage.objects FOR DELETE 
USING (
  bucket_id = 'business-assets' AND 
  (storage.foldername(name))[1] ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' AND
  public.can_manage_catalog(((storage.foldername(name))[1])::uuid)
);

-- ============================================================================
-- NEW USER WORKSPACE TRIGGER: Create Profile & Business Workspace
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
    owner_id, name, slug, business_type, currency, theme_color, is_public,
    subscription_plan, subscription_status, subscription_start_date, subscription_end_date, max_items, max_categories
  )
  VALUES (
    NEW.id,
    b_name,
    final_slug,
    b_type,
    'LKR',
    '#0F172A',
    true, -- Published by default
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
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- DATABASE-LEVEL SUBSCRIPTION QUOTA ENFORCEMENT TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.enforce_catalog_item_quota()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_biz public.businesses%ROWTYPE;
  v_current_count INT;
  v_max_allowed INT;
  v_is_expired BOOLEAN;
BEGIN
  -- Super Admins bypass subscription quota limits
  IF public.is_super_admin() THEN
    RETURN NEW;
  END IF;

  -- Retrieve target business record
  SELECT * INTO v_biz FROM public.businesses WHERE id = NEW.business_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid business ID: %', NEW.business_id USING ERRCODE = '22023';
  END IF;

  -- Check expiration
  v_is_expired := public.is_business_subscription_expired(v_biz.subscription_status, v_biz.subscription_end_date);

  -- Calculate effective max allowed items (NULL max_items or enterprise plan = Unlimited)
  IF v_is_expired THEN
    v_max_allowed := 10;
  ELSIF v_biz.subscription_plan = 'enterprise' OR v_biz.subscription_plan = 'enterprise_gift' OR v_biz.max_items IS NULL THEN
    v_max_allowed := NULL; -- Unlimited
  ELSE
    v_max_allowed := COALESCE(v_biz.max_items, 10);
  END IF;

  -- If limit is not unlimited, check current item count
  IF v_max_allowed IS NOT NULL THEN
    SELECT COUNT(*) INTO v_current_count
    FROM public.catalog_items
    WHERE business_id = NEW.business_id;

    IF v_current_count >= v_max_allowed THEN
      RAISE EXCEPTION 'Quota Exceeded: You have reached the maximum allowed catalog items (%) for your subscription plan.', v_max_allowed
        USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_enforce_item_quota ON public.catalog_items;
CREATE TRIGGER tr_enforce_item_quota
  BEFORE INSERT ON public.catalog_items
  FOR EACH ROW EXECUTE FUNCTION public.enforce_catalog_item_quota();

CREATE OR REPLACE FUNCTION public.enforce_category_quota()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_biz public.businesses%ROWTYPE;
  v_current_count INT;
  v_max_allowed INT;
  v_is_expired BOOLEAN;
BEGIN
  -- Super Admins bypass subscription quota limits
  IF public.is_super_admin() THEN
    RETURN NEW;
  END IF;

  -- Retrieve target business record
  SELECT * INTO v_biz FROM public.businesses WHERE id = NEW.business_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid business ID: %', NEW.business_id USING ERRCODE = '22023';
  END IF;

  -- Check expiration
  v_is_expired := public.is_business_subscription_expired(v_biz.subscription_status, v_biz.subscription_end_date);

  -- Calculate effective max allowed categories (NULL max_categories or enterprise plan = Unlimited)
  IF v_is_expired THEN
    v_max_allowed := 5;
  ELSIF v_biz.subscription_plan = 'enterprise' OR v_biz.subscription_plan = 'enterprise_gift' OR v_biz.max_categories IS NULL THEN
    v_max_allowed := NULL; -- Unlimited
  ELSE
    v_max_allowed := COALESCE(v_biz.max_categories, 5);
  END IF;

  -- If limit is not unlimited, check current category count
  IF v_max_allowed IS NOT NULL THEN
    SELECT COUNT(*) INTO v_current_count
    FROM public.categories
    WHERE business_id = NEW.business_id;

    IF v_current_count >= v_max_allowed THEN
      RAISE EXCEPTION 'Quota Exceeded: You have reached the maximum allowed categories (%) for your subscription plan.', v_max_allowed
        USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_enforce_category_quota ON public.categories;
CREATE TRIGGER tr_enforce_category_quota
  BEFORE INSERT ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.enforce_category_quota();

-- Notify PostgREST API to reload schema cache
NOTIFY pgrst, 'reload schema';
