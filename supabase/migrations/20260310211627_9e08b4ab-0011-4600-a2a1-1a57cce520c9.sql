
-- ═══════════════════════════════════════════════════
-- WORKSHOPS: Vehicle profiles + appointments
-- ═══════════════════════════════════════════════════

CREATE TABLE public.vehicle_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id),
  nr_inmatriculare text NOT NULL,
  marca text DEFAULT '',
  model text DEFAULT '',
  an_fabricatie int DEFAULT 2020,
  vin text DEFAULT '',
  culoare text DEFAULT '',
  owner_name text DEFAULT '',
  owner_phone text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.workshop_appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id),
  client_name text NOT NULL DEFAULT '',
  client_phone text DEFAULT '',
  vehicle_profile_id uuid REFERENCES public.vehicle_profiles(id),
  appointment_date date NOT NULL,
  time_slot text DEFAULT '09:00',
  service_description text DEFAULT '',
  status text NOT NULL DEFAULT 'scheduled',
  assigned_mechanic text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS for workshops
CREATE POLICY "auth_select_vp" ON public.vehicle_profiles FOR SELECT TO authenticated USING (user_org_match(organization_id));
CREATE POLICY "auth_insert_vp" ON public.vehicle_profiles FOR INSERT TO authenticated WITH CHECK (user_org_match(organization_id));
CREATE POLICY "auth_update_vp" ON public.vehicle_profiles FOR UPDATE TO authenticated USING (user_org_match(organization_id));
CREATE POLICY "auth_delete_vp" ON public.vehicle_profiles FOR DELETE TO authenticated USING (user_org_match(organization_id));

CREATE POLICY "auth_select_wa" ON public.workshop_appointments FOR SELECT TO authenticated USING (user_org_match(organization_id));
CREATE POLICY "anon_select_wa" ON public.workshop_appointments FOR SELECT TO anon USING (true);
CREATE POLICY "auth_insert_wa" ON public.workshop_appointments FOR INSERT TO authenticated WITH CHECK (user_org_match(organization_id));
CREATE POLICY "auth_update_wa" ON public.workshop_appointments FOR UPDATE TO authenticated USING (user_org_match(organization_id));
CREATE POLICY "auth_delete_wa" ON public.workshop_appointments FOR DELETE TO authenticated USING (user_org_match(organization_id));

-- ═══════════════════════════════════════════════════
-- LIVING: Expenses + apartments + external admins
-- ═══════════════════════════════════════════════════

CREATE TABLE public.living_expenses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id),
  month int NOT NULL,
  year int NOT NULL,
  category text NOT NULL DEFAULT 'utilitati',
  description text DEFAULT '',
  amount numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.living_apartments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id),
  apartment_number text NOT NULL,
  floor int DEFAULT 0,
  owner_name text DEFAULT '',
  owner_user_id uuid REFERENCES auth.users(id),
  balance numeric(12,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.external_admins (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id),
  entity_name text NOT NULL,
  entity_type text NOT NULL DEFAULT 'other',
  user_id uuid REFERENCES auth.users(id),
  can_post_announcements boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS for living
CREATE POLICY "auth_select_le" ON public.living_expenses FOR SELECT TO authenticated USING (user_org_match(organization_id));
CREATE POLICY "anon_select_le" ON public.living_expenses FOR SELECT TO anon USING (true);
CREATE POLICY "auth_insert_le" ON public.living_expenses FOR INSERT TO authenticated WITH CHECK (user_org_match(organization_id));
CREATE POLICY "auth_update_le" ON public.living_expenses FOR UPDATE TO authenticated USING (user_org_match(organization_id));
CREATE POLICY "auth_delete_le" ON public.living_expenses FOR DELETE TO authenticated USING (user_org_match(organization_id));

CREATE POLICY "auth_select_la" ON public.living_apartments FOR SELECT TO authenticated USING (user_org_match(organization_id));
CREATE POLICY "auth_insert_la" ON public.living_apartments FOR INSERT TO authenticated WITH CHECK (user_org_match(organization_id));
CREATE POLICY "auth_update_la" ON public.living_apartments FOR UPDATE TO authenticated USING (user_org_match(organization_id));
CREATE POLICY "auth_delete_la" ON public.living_apartments FOR DELETE TO authenticated USING (user_org_match(organization_id));

CREATE POLICY "auth_select_ea" ON public.external_admins FOR SELECT TO authenticated USING (user_org_match(organization_id));
CREATE POLICY "auth_insert_ea" ON public.external_admins FOR INSERT TO authenticated WITH CHECK (user_org_match(organization_id));
CREATE POLICY "auth_update_ea" ON public.external_admins FOR UPDATE TO authenticated USING (user_org_match(organization_id));
CREATE POLICY "auth_delete_ea" ON public.external_admins FOR DELETE TO authenticated USING (user_org_match(organization_id));
