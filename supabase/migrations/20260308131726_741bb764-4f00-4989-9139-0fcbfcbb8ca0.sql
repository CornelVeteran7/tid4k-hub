
-- contributions_config: store daily rate per organization
CREATE TABLE public.contributions_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  daily_rate numeric NOT NULL DEFAULT 17,
  effective_from date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, effective_from)
);

-- contributions_monthly: track per-child monthly payments
CREATE TABLE public.contributions_monthly (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  month smallint NOT NULL,
  year smallint NOT NULL,
  days_present smallint NOT NULL DEFAULT 0,
  daily_rate numeric NOT NULL DEFAULT 17,
  amount_calculated numeric NOT NULL DEFAULT 0,
  amount_paid numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, child_id, month, year)
);

-- RLS for contributions_config
CREATE POLICY "auth_read_cc" ON public.contributions_config FOR SELECT TO authenticated
  USING (user_org_match(organization_id));

CREATE POLICY "admin_insert_cc" ON public.contributions_config FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'secretara') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky'));

CREATE POLICY "admin_update_cc" ON public.contributions_config FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'secretara') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky'));

CREATE POLICY "admin_delete_cc" ON public.contributions_config FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- RLS for contributions_monthly
CREATE POLICY "auth_read_cm" ON public.contributions_monthly FOR SELECT TO authenticated
  USING (user_org_match(organization_id));

CREATE POLICY "staff_insert_cm" ON public.contributions_monthly FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'secretara') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky'));

CREATE POLICY "staff_update_cm" ON public.contributions_monthly FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'secretara') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky'));

CREATE POLICY "staff_delete_cm" ON public.contributions_monthly FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- Add unique constraint on attendance for upsert (if not exists)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'attendance_child_id_data_key'
  ) THEN
    ALTER TABLE public.attendance ADD CONSTRAINT attendance_child_id_data_key UNIQUE (child_id, data);
  END IF;
END $$;
