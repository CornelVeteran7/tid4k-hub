
-- Create vertical_type enum for the 8 verticals
CREATE TYPE public.vertical_type AS ENUM (
  'kids', 'schools', 'medicine', 'living', 'culture', 'students', 'construction', 'workshops'
);

-- Create organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  vertical_type public.vertical_type NOT NULL DEFAULT 'kids',
  logo_url TEXT,
  primary_color TEXT DEFAULT '#4F46E5',
  secondary_color TEXT DEFAULT '#7C3AED',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Create modules_config table to track which modules are active per org
CREATE TABLE public.modules_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, module_key)
);

ALTER TABLE public.modules_config ENABLE ROW LEVEL SECURITY;

-- Link profiles to organizations
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- Security definer function to check org membership
CREATE OR REPLACE FUNCTION public.get_user_org_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE id = _user_id
$$;

-- RLS for organizations: users can only see their own org, admins/inky see all
CREATE POLICY "Users see own organization"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (
    id = public.get_user_org_id(auth.uid())
    OR public.has_role(auth.uid(), 'administrator')
    OR public.has_role(auth.uid(), 'inky')
  );

CREATE POLICY "Admins can insert organizations"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'administrator')
    OR public.has_role(auth.uid(), 'inky')
  );

CREATE POLICY "Admins can update organizations"
  ON public.organizations FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'administrator')
    OR public.has_role(auth.uid(), 'inky')
  );

CREATE POLICY "Admins can delete organizations"
  ON public.organizations FOR DELETE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'administrator')
    OR public.has_role(auth.uid(), 'inky')
  );

-- RLS for modules_config: users see modules for their org
CREATE POLICY "Users see own org modules"
  ON public.modules_config FOR SELECT
  TO authenticated
  USING (
    organization_id = public.get_user_org_id(auth.uid())
    OR public.has_role(auth.uid(), 'administrator')
    OR public.has_role(auth.uid(), 'inky')
  );

CREATE POLICY "Admins can insert modules_config"
  ON public.modules_config FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'administrator')
    OR public.has_role(auth.uid(), 'inky')
  );

CREATE POLICY "Admins can update modules_config"
  ON public.modules_config FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'administrator')
    OR public.has_role(auth.uid(), 'inky')
  );

CREATE POLICY "Admins can delete modules_config"
  ON public.modules_config FOR DELETE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'administrator')
    OR public.has_role(auth.uid(), 'inky')
  );

-- Seed: insert 2 test organizations
INSERT INTO public.organizations (name, vertical_type, primary_color, secondary_color) VALUES
  ('Grădinița Floarea Soarelui', 'kids', '#E8829A', '#FF6B9D'),
  ('Clinica MedPlus', 'medicine', '#2ECC71', '#27AE60');

-- Seed: insert default modules for kids org
INSERT INTO public.modules_config (organization_id, module_key, is_active)
SELECT o.id, m.key, true
FROM public.organizations o,
  (VALUES ('prezenta'), ('imagini'), ('documente'), ('povesti'), ('ateliere'), ('meniu'), ('mesaje'), ('orar'), ('anunturi')) AS m(key)
WHERE o.vertical_type = 'kids';

-- Seed: insert default modules for medicine org (different set)
INSERT INTO public.modules_config (organization_id, module_key, is_active)
SELECT o.id, m.key, m.active
FROM public.organizations o,
  (VALUES ('prezenta', false), ('imagini', true), ('documente', true), ('povesti', false), ('ateliere', false), ('meniu', false), ('mesaje', true), ('orar', true), ('anunturi', true)) AS m(key, active)
WHERE o.vertical_type = 'medicine';
