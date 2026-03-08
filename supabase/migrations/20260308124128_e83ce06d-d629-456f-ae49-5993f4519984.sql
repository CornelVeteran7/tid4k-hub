
-- ============================================================
-- M8: QR Inventory
-- ============================================================
CREATE TABLE public.inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id),
  nume text NOT NULL,
  categorie text NOT NULL DEFAULT 'general',
  cantitate integer NOT NULL DEFAULT 0,
  unitate text NOT NULL DEFAULT 'buc',
  locatie text DEFAULT '',
  cod_qr text DEFAULT '',
  pret_unitar numeric DEFAULT 0,
  descriere text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id),
  item_id uuid REFERENCES public.inventory_items(id) ON DELETE CASCADE NOT NULL,
  tip text NOT NULL DEFAULT 'in', -- 'in' or 'out'
  cantitate integer NOT NULL DEFAULT 1,
  motiv text DEFAULT '',
  efectuat_de text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS for inventory_items
CREATE POLICY "auth_read_inv" ON public.inventory_items FOR SELECT TO authenticated USING (user_org_match(organization_id));
CREATE POLICY "anon_read_inv" ON public.inventory_items FOR SELECT TO anon USING (true);
CREATE POLICY "staff_insert_inv" ON public.inventory_items FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_update_inv" ON public.inventory_items FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_delete_inv" ON public.inventory_items FOR DELETE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- RLS for inventory_movements
CREATE POLICY "auth_read_invmov" ON public.inventory_movements FOR SELECT TO authenticated USING (user_org_match(organization_id));
CREATE POLICY "staff_insert_invmov" ON public.inventory_movements FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- ============================================================
-- M9: SSM (Safety & Health at Work)
-- ============================================================
CREATE TABLE public.ssm_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id),
  nume text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]', -- array of {text: string}
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ssm_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id),
  template_id uuid REFERENCES public.ssm_templates(id),
  data date NOT NULL DEFAULT CURRENT_DATE,
  completat_de text DEFAULT '',
  completat_de_id uuid,
  items jsonb NOT NULL DEFAULT '[]', -- array of {text, checked: bool}
  semnatura_data text DEFAULT '', -- base64 signature
  status text NOT NULL DEFAULT 'incomplete', -- incomplete / completed
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS for ssm_templates
CREATE POLICY "auth_read_ssmt" ON public.ssm_templates FOR SELECT TO authenticated USING (user_org_match(organization_id));
CREATE POLICY "staff_insert_ssmt" ON public.ssm_templates FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_update_ssmt" ON public.ssm_templates FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_delete_ssmt" ON public.ssm_templates FOR DELETE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- RLS for ssm_checklists
CREATE POLICY "auth_read_ssmc" ON public.ssm_checklists FOR SELECT TO authenticated USING (user_org_match(organization_id));
CREATE POLICY "staff_insert_ssmc" ON public.ssm_checklists FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_update_ssmc" ON public.ssm_checklists FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- ============================================================
-- M10: School Magazine
-- ============================================================
CREATE TABLE public.magazine_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id),
  titlu text NOT NULL,
  continut text NOT NULL DEFAULT '',
  categorie text NOT NULL DEFAULT 'general',
  autor_id uuid,
  autor_nume text DEFAULT '',
  photos text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft', -- draft / review / published / rejected
  reviewer_id uuid,
  reviewer_comment text DEFAULT '',
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS for magazine_articles
CREATE POLICY "auth_read_mag" ON public.magazine_articles FOR SELECT TO authenticated USING (user_org_match(organization_id));
CREATE POLICY "anon_read_mag" ON public.magazine_articles FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "auth_insert_mag" ON public.magazine_articles FOR INSERT TO authenticated WITH CHECK (user_org_match(organization_id));
CREATE POLICY "staff_update_mag" ON public.magazine_articles FOR UPDATE TO authenticated USING (
  autor_id = auth.uid() OR has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
);
CREATE POLICY "staff_delete_mag" ON public.magazine_articles FOR DELETE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- ============================================================
-- M11: Surtitling
-- ============================================================
CREATE TABLE public.surtitle_shows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id),
  titlu text NOT NULL,
  data_spectacol date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'pregatire', -- pregatire / live / terminat
  current_block integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.surtitle_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  show_id uuid REFERENCES public.surtitle_shows(id) ON DELETE CASCADE NOT NULL,
  sequence_nr integer NOT NULL DEFAULT 0,
  text_ro text NOT NULL DEFAULT '',
  text_en text DEFAULT '',
  text_fr text DEFAULT '',
  nota_operator text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS for surtitle_shows
CREATE POLICY "auth_read_shows" ON public.surtitle_shows FOR SELECT TO authenticated USING (user_org_match(organization_id));
CREATE POLICY "anon_read_shows" ON public.surtitle_shows FOR SELECT TO anon USING (true);
CREATE POLICY "staff_insert_shows" ON public.surtitle_shows FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_update_shows" ON public.surtitle_shows FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_delete_shows" ON public.surtitle_shows FOR DELETE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- RLS for surtitle_blocks
CREATE POLICY "auth_read_blocks" ON public.surtitle_blocks FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.surtitle_shows s WHERE s.id = surtitle_blocks.show_id AND user_org_match(s.organization_id))
);
CREATE POLICY "anon_read_blocks" ON public.surtitle_blocks FOR SELECT TO anon USING (true);
CREATE POLICY "staff_insert_blocks" ON public.surtitle_blocks FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.surtitle_shows s WHERE s.id = surtitle_blocks.show_id AND user_org_match(s.organization_id))
);
CREATE POLICY "staff_update_blocks" ON public.surtitle_blocks FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.surtitle_shows s WHERE s.id = surtitle_blocks.show_id AND user_org_match(s.organization_id))
);
CREATE POLICY "staff_delete_blocks" ON public.surtitle_blocks FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.surtitle_shows s WHERE s.id = surtitle_blocks.show_id)
  AND (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'))
);

-- Enable realtime for surtitle_shows (operator advances → audience sees)
ALTER PUBLICATION supabase_realtime ADD TABLE public.surtitle_shows;
