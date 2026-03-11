
-- 1. New table: contribution_cash_declarations
CREATE TABLE public.contribution_cash_declarations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  month INT NOT NULL,
  year INT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  notes TEXT,
  declared_by UUID REFERENCES public.profiles(id),
  confirmed_by UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'declared',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ
);

-- RLS for contribution_cash_declarations
ALTER TABLE public.contribution_cash_declarations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org cash declarations"
  ON public.contribution_cash_declarations FOR SELECT
  TO authenticated
  USING (public.user_org_match(organization_id));

CREATE POLICY "Users can insert own org cash declarations"
  ON public.contribution_cash_declarations FOR INSERT
  TO authenticated
  WITH CHECK (public.user_org_match(organization_id));

CREATE POLICY "Users can update own org cash declarations"
  ON public.contribution_cash_declarations FOR UPDATE
  TO authenticated
  USING (public.user_org_match(organization_id));

-- 2. Add payment_method column to contributions_monthly
ALTER TABLE public.contributions_monthly ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'pending';

-- 3. New table: stripe_connect_accounts (placeholder)
CREATE TABLE public.stripe_connect_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID UNIQUE NOT NULL REFERENCES public.organizations(id),
  stripe_account_id TEXT,
  status TEXT NOT NULL DEFAULT 'not_connected',
  bank_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for stripe_connect_accounts
ALTER TABLE public.stripe_connect_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org stripe connect"
  ON public.stripe_connect_accounts FOR SELECT
  TO authenticated
  USING (public.user_org_match(organization_id));

CREATE POLICY "Users can manage own org stripe connect"
  ON public.stripe_connect_accounts FOR ALL
  TO authenticated
  USING (public.user_org_match(organization_id));
