-- ============================================================================
-- QR Business Catalog — Annual Subscription Billing Migration
-- Adds billing_interval to businesses and subscription_payments, and updates
-- admin_update_subscription RPC function for authoritative pricing enforcement.
-- ============================================================================

-- 1. Add billing_interval column to public.businesses
ALTER TABLE public.businesses 
  ADD COLUMN IF NOT EXISTS billing_interval TEXT NOT NULL DEFAULT 'monthly';

-- 2. Add billing_interval column to public.subscription_payments
ALTER TABLE public.subscription_payments 
  ADD COLUMN IF NOT EXISTS billing_interval TEXT NOT NULL DEFAULT 'monthly';

-- 3. Add constraint for billing_interval if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_businesses_billing_interval'
  ) THEN
    ALTER TABLE public.businesses
      ADD CONSTRAINT check_businesses_billing_interval
      CHECK (billing_interval IN ('monthly', 'annual'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_subscription_payments_billing_interval'
  ) THEN
    ALTER TABLE public.subscription_payments
      ADD CONSTRAINT check_subscription_payments_billing_interval
      CHECK (billing_interval IN ('monthly', 'annual'));
  END IF;
END $$;

-- ============================================================================
-- 4. Authoritative Super Admin Subscription Approval RPC
-- Supports p_billing_interval with server-side price & duration calculation
-- ============================================================================

CREATE OR REPLACE FUNCTION public.admin_update_subscription(
  p_business_id UUID,
  p_plan TEXT,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_billing_interval TEXT DEFAULT 'monthly'
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
  v_interval TEXT;
BEGIN
  -- 1. Enforce Super Admin Authorization
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Access Denied: Super Admin privileges required.' USING ERRCODE = '42501';
  END IF;

  -- 2. Sanitize and Validate Billing Interval
  v_interval := COALESCE(LOWER(TRIM(p_billing_interval)), 'monthly');
  IF v_interval NOT IN ('monthly', 'annual') THEN
    v_interval := 'monthly';
  END IF;

  -- 3. Validate Subscription Plan
  IF p_plan NOT IN ('free', 'pro', 'enterprise', 'enterprise_gift') THEN
    RAISE EXCEPTION 'Invalid subscription plan: %. Plan must be free, pro, enterprise, or enterprise_gift.', p_plan USING ERRCODE = '22023';
  END IF;

  -- 4. Validate Date Range for Paid Plans
  IF p_plan IN ('pro', 'enterprise', 'enterprise_gift') THEN
    IF p_end_date IS NULL OR p_end_date <= p_start_date THEN
      RAISE EXCEPTION 'Invalid date range: end_date must be later than start_date.' USING ERRCODE = '22023';
    END IF;
  END IF;

  -- 5. Calculate Authoritative Internal Limits and Pricing Amount
  IF p_plan = 'pro' THEN
    v_max_items := 150;
    v_max_categories := 20;
    IF v_interval = 'annual' THEN
      v_amount := 21000.00;
    ELSE
      v_amount := 2000.00;
    END IF;
  ELSIF p_plan = 'enterprise' THEN
    v_max_items := NULL; -- Unlimited
    v_max_categories := NULL; -- Unlimited
    IF v_interval = 'annual' THEN
      v_amount := 36000.00;
    ELSE
      v_amount := 3500.00;
    END IF;
  ELSIF p_plan = 'enterprise_gift' THEN
    v_max_items := NULL; -- Unlimited VIP Gift
    v_max_categories := NULL; -- Unlimited VIP Gift
    v_amount := 0.00;
  ELSE
    -- Free plan
    v_max_items := 10;
    v_max_categories := 5;
    v_amount := 0.00;
  END IF;

  -- 6. Update Businesses Record
  UPDATE public.businesses
  SET 
    subscription_plan = p_plan,
    billing_interval = v_interval,
    subscription_status = 'active',
    subscription_start_date = p_start_date,
    subscription_end_date = CASE WHEN p_plan = 'free' THEN NULL ELSE p_end_date END,
    max_items = v_max_items,
    max_categories = v_max_categories,
    updated_at = NOW()
  WHERE id = p_business_id
  RETURNING * INTO v_result;

  -- 7. Record Payment Entry with Billing Interval
  INSERT INTO public.subscription_payments (
    business_id, plan, billing_interval, amount, payment_reference, start_date, end_date, approved_by
  ) VALUES (
    p_business_id, p_plan, v_interval, v_amount, 'Super Admin Manual Approval', p_start_date, p_end_date, auth.uid()
  );

  -- 8. Log Admin Audit Action
  INSERT INTO public.admin_audit_logs (
    admin_user_id, business_id, action, details
  ) VALUES (
    auth.uid(), p_business_id, 'subscription_approved', jsonb_build_object(
      'plan', p_plan,
      'billing_interval', v_interval,
      'start_date', p_start_date,
      'end_date', p_end_date,
      'amount', v_amount
    )
  );

  RETURN v_result;
END;
$$;

-- Notify PostgREST API to reload schema cache
NOTIFY pgrst, 'reload schema';
