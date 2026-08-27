-- ============================================================================
-- Supabase Production Hardening Migration
-- 1. Subscription Payments Table (subscription_payments)
-- 2. Admin Audit Logs Table (admin_audit_logs)
-- 3. Hardened admin_update_subscription RPC function with auto-logging
-- 4. Database-Level Item Quota Enforcement Trigger (enforce_catalog_item_quota)
-- 5. Database-Level Category Quota Enforcement Trigger (enforce_category_quota)
-- 6. Publication Column Compatibility (is_public)
-- ============================================================================

-- Safely ensure is_public column exists on businesses
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true;

-- 1. Subscription Payments Table
CREATE TABLE IF NOT EXISTS public.subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  amount NUMERIC(10,2) DEFAULT 0.00,
  payment_reference TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_payments_business ON public.subscription_payments(business_id);

ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admins and owners can view subscription payments" ON public.subscription_payments;
CREATE POLICY "Super admins and owners can view subscription payments" ON public.subscription_payments
FOR SELECT USING (
  public.is_super_admin() OR public.is_business_owner(business_id)
);

DROP POLICY IF EXISTS "Super admins can insert subscription payments" ON public.subscription_payments;
CREATE POLICY "Super admins can insert subscription payments" ON public.subscription_payments
FOR INSERT WITH CHECK (
  public.is_super_admin()
);

-- 2. Admin Audit Logs Table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin ON public.admin_audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_business ON public.admin_audit_logs(business_id);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admins can view admin audit logs" ON public.admin_audit_logs;
CREATE POLICY "Super admins can view admin audit logs" ON public.admin_audit_logs
FOR SELECT USING (
  public.is_super_admin()
);

DROP POLICY IF EXISTS "Super admins can insert admin audit logs" ON public.admin_audit_logs;
CREATE POLICY "Super admins can insert admin audit logs" ON public.admin_audit_logs
FOR INSERT WITH CHECK (
  public.is_super_admin()
);

-- 3. Hardened Super Admin Subscription RPC Function
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

  -- 2. Validate Subscription Plan
  IF p_plan NOT IN ('free', 'pro', 'enterprise', 'enterprise_gift') THEN
    RAISE EXCEPTION 'Invalid subscription plan: %. Plan must be free, pro, enterprise, or enterprise_gift.', p_plan USING ERRCODE = '22023';
  END IF;

  -- 3. Validate Date Range for Paid Plans
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
    v_max_items := NULL; -- Unlimited
    v_max_categories := NULL; -- Unlimited
    v_amount := 3500.00;
  ELSIF p_plan = 'enterprise_gift' THEN
    v_max_items := NULL; -- Unlimited
    v_max_categories := NULL; -- Unlimited
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

-- 4. Database-Level Item Quota Enforcement Trigger
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

-- 5. Database-Level Category Quota Enforcement Trigger
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

NOTIFY pgrst, 'reload schema';
