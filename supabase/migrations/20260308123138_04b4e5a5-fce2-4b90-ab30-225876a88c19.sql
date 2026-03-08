
-- ============================================
-- Construction Sites
-- ============================================
CREATE TABLE IF NOT EXISTS public.construction_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  nume text NOT NULL,
  adresa text DEFAULT '',
  buget numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'activ',
  progress_pct integer DEFAULT 0,
  data_start date,
  data_estimare_finalizare date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.construction_sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_csites" ON public.construction_sites FOR SELECT TO anon USING (true);
CREATE POLICY "auth_read_csites" ON public.construction_sites FOR SELECT TO authenticated USING (user_org_match(organization_id));
CREATE POLICY "staff_insert_csites" ON public.construction_sites FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_update_csites" ON public.construction_sites FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_delete_csites" ON public.construction_sites FOR DELETE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- ============================================
-- Construction Teams
-- ============================================
CREATE TABLE IF NOT EXISTS public.construction_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  nume text NOT NULL,
  nr_membri integer DEFAULT 0,
  specialitate text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.construction_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_cteams" ON public.construction_teams FOR SELECT TO anon USING (true);
CREATE POLICY "auth_read_cteams" ON public.construction_teams FOR SELECT TO authenticated USING (user_org_match(organization_id));
CREATE POLICY "staff_insert_cteams" ON public.construction_teams FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_update_cteams" ON public.construction_teams FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_delete_cteams" ON public.construction_teams FOR DELETE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- ============================================
-- Team-Site Assignments (calendar)
-- ============================================
CREATE TABLE IF NOT EXISTS public.construction_team_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.construction_teams(id) ON DELETE CASCADE,
  site_id uuid NOT NULL REFERENCES public.construction_sites(id) ON DELETE CASCADE,
  saptamana_start date NOT NULL,
  saptamana_end date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.construction_team_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_cta" ON public.construction_team_assignments FOR SELECT TO anon USING (true);
CREATE POLICY "auth_read_cta" ON public.construction_team_assignments FOR SELECT TO authenticated USING (user_org_match(organization_id));
CREATE POLICY "staff_insert_cta" ON public.construction_team_assignments FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_update_cta" ON public.construction_team_assignments FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_delete_cta" ON public.construction_team_assignments FOR DELETE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- ============================================
-- Construction Costs
-- ============================================
CREATE TABLE IF NOT EXISTS public.construction_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  site_id uuid NOT NULL REFERENCES public.construction_sites(id) ON DELETE CASCADE,
  categorie text NOT NULL DEFAULT 'materiale',
  descriere text NOT NULL,
  cantitate numeric DEFAULT 1,
  pret_unitar numeric DEFAULT 0,
  total numeric GENERATED ALWAYS AS (cantitate * pret_unitar) STORED,
  furnizor text DEFAULT '',
  suma_platita numeric DEFAULT 0,
  data_inregistrare date DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.construction_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_read_ccosts" ON public.construction_costs FOR SELECT TO authenticated USING (user_org_match(organization_id));
CREATE POLICY "staff_insert_ccosts" ON public.construction_costs FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_update_ccosts" ON public.construction_costs FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_delete_ccosts" ON public.construction_costs FOR DELETE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- ============================================
-- Add site_id and team_id to construction_tasks
-- ============================================
ALTER TABLE public.construction_tasks ADD COLUMN IF NOT EXISTS site_id uuid REFERENCES public.construction_sites(id) ON DELETE SET NULL;
ALTER TABLE public.construction_tasks ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.construction_teams(id) ON DELETE SET NULL;
ALTER TABLE public.construction_tasks ADD COLUMN IF NOT EXISTS photo_url text DEFAULT '';
ALTER TABLE public.construction_tasks ADD COLUMN IF NOT EXISTS completed_by text DEFAULT '';
ALTER TABLE public.construction_tasks ADD COLUMN IF NOT EXISTS completed_at timestamptz;
