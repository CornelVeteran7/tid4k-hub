
-- ═══════════════════════════════════════════════════
-- Sponsor Policies + Website Config
-- ═══════════════════════════════════════════════════

CREATE TABLE public.sponsor_policies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id) NOT NULL UNIQUE,
  max_sponsor_share_percent int NOT NULL DEFAULT 30,
  allowed_categories text[] DEFAULT '{}',
  blocked_categories text[] DEFAULT '{}',
  requires_approval boolean DEFAULT true,
  no_cameras_declaration boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.website_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id) NOT NULL UNIQUE,
  is_published boolean DEFAULT false,
  custom_domain text DEFAULT '',
  template text DEFAULT 'kids',
  pages_enabled text[] DEFAULT '{"home","announcements","gallery","contact"}',
  custom_css text DEFAULT '',
  hero_title text DEFAULT '',
  hero_subtitle text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Sponsor policies: admin read/write
CREATE POLICY "auth_select_sp" ON public.sponsor_policies FOR SELECT TO authenticated USING (user_org_match(organization_id));
CREATE POLICY "auth_insert_sp" ON public.sponsor_policies FOR INSERT TO authenticated WITH CHECK (user_org_match(organization_id));
CREATE POLICY "auth_update_sp" ON public.sponsor_policies FOR UPDATE TO authenticated USING (user_org_match(organization_id));

-- Website config: admin write, public read for published
CREATE POLICY "auth_select_wc" ON public.website_config FOR SELECT TO authenticated USING (user_org_match(organization_id));
CREATE POLICY "anon_select_wc" ON public.website_config FOR SELECT TO anon USING (is_published = true);
CREATE POLICY "auth_insert_wc" ON public.website_config FOR INSERT TO authenticated WITH CHECK (user_org_match(organization_id));
CREATE POLICY "auth_update_wc" ON public.website_config FOR UPDATE TO authenticated USING (user_org_match(organization_id));
