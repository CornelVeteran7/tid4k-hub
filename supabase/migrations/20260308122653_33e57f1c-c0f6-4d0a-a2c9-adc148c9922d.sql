
-- org_config table for vertical-specific settings per org
CREATE TABLE IF NOT EXISTS public.org_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  config_key text NOT NULL,
  config_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, config_key)
);

ALTER TABLE public.org_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_orgconfig" ON public.org_config FOR SELECT TO anon USING (true);
CREATE POLICY "auth_read_orgconfig" ON public.org_config FOR SELECT TO authenticated USING (user_org_match(organization_id));
CREATE POLICY "admin_insert_orgconfig" ON public.org_config FOR INSERT TO authenticated WITH CHECK (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "admin_update_orgconfig" ON public.org_config FOR UPDATE TO authenticated USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "admin_delete_orgconfig" ON public.org_config FOR DELETE TO authenticated USING (
  has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);

-- Add slug to organizations for display URLs
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS slug text;
CREATE UNIQUE INDEX IF NOT EXISTS organizations_slug_unique ON public.organizations(slug) WHERE slug IS NOT NULL;
