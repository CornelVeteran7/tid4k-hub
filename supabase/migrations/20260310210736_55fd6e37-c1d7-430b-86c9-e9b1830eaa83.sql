
-- Culture vertical: Shows table
CREATE TABLE public.culture_shows (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id),
  title text NOT NULL,
  show_date date NOT NULL,
  show_time time DEFAULT '19:00',
  duration_minutes int DEFAULT 120,
  acts int DEFAULT 2,
  language text DEFAULT 'ro',
  has_surtitles boolean DEFAULT false,
  status text NOT NULL DEFAULT 'draft',
  synopsis text DEFAULT '',
  director_note text DEFAULT '',
  house_info jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Cast members
CREATE TABLE public.show_cast (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  show_id uuid NOT NULL REFERENCES public.culture_shows(id) ON DELETE CASCADE,
  role_name text NOT NULL DEFAULT '',
  artist_name text NOT NULL,
  artist_bio text DEFAULT '',
  artist_photo_url text DEFAULT '',
  sort_order int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Show sponsors
CREATE TABLE public.show_sponsors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  show_id uuid NOT NULL REFERENCES public.culture_shows(id) ON DELETE CASCADE,
  sponsor_name text NOT NULL,
  sponsor_logo_url text DEFAULT '',
  sponsor_url text DEFAULT '',
  tier text NOT NULL DEFAULT 'partner',
  sort_order int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enhanced surtitle blocks (linked to culture_shows)
CREATE TABLE public.culture_surtitle_blocks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  show_id uuid NOT NULL REFERENCES public.culture_shows(id) ON DELETE CASCADE,
  sequence_number int NOT NULL DEFAULT 0,
  text_ro text DEFAULT '',
  text_en text DEFAULT '',
  text_fr text DEFAULT '',
  text_de text DEFAULT '',
  stage_direction text DEFAULT '',
  act_number int DEFAULT 1,
  scene_number int DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Live surtitle state
CREATE TABLE public.surtitle_live (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  show_id uuid NOT NULL REFERENCES public.culture_shows(id) ON DELETE CASCADE UNIQUE,
  current_block_id uuid REFERENCES public.culture_surtitle_blocks(id),
  is_live boolean DEFAULT false,
  is_blackout boolean DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: culture_shows readable by anon + authenticated
CREATE POLICY "anon_read_cshows" ON public.culture_shows FOR SELECT TO anon USING (true);
CREATE POLICY "auth_read_cshows" ON public.culture_shows FOR SELECT TO authenticated USING (user_org_match(organization_id));
CREATE POLICY "staff_insert_cshows" ON public.culture_shows FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_update_cshows" ON public.culture_shows FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_delete_cshows" ON public.culture_shows FOR DELETE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- RLS: show_cast anon readable
CREATE POLICY "anon_read_scast" ON public.show_cast FOR SELECT TO anon USING (true);
CREATE POLICY "auth_read_scast" ON public.show_cast FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff_insert_scast" ON public.show_cast FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_update_scast" ON public.show_cast FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_delete_scast" ON public.show_cast FOR DELETE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- RLS: show_sponsors anon readable
CREATE POLICY "anon_read_sspon" ON public.show_sponsors FOR SELECT TO anon USING (true);
CREATE POLICY "auth_read_sspon" ON public.show_sponsors FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff_insert_sspon" ON public.show_sponsors FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_update_sspon" ON public.show_sponsors FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_delete_sspon" ON public.show_sponsors FOR DELETE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- RLS: culture_surtitle_blocks anon readable
CREATE POLICY "anon_read_csblocks" ON public.culture_surtitle_blocks FOR SELECT TO anon USING (true);
CREATE POLICY "auth_read_csblocks" ON public.culture_surtitle_blocks FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff_insert_csblocks" ON public.culture_surtitle_blocks FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_update_csblocks" ON public.culture_surtitle_blocks FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_delete_csblocks" ON public.culture_surtitle_blocks FOR DELETE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- RLS: surtitle_live anon readable, write by staff
CREATE POLICY "anon_read_slive" ON public.surtitle_live FOR SELECT TO anon USING (true);
CREATE POLICY "auth_read_slive" ON public.surtitle_live FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff_insert_slive" ON public.surtitle_live FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_update_slive" ON public.surtitle_live FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_delete_slive" ON public.surtitle_live FOR DELETE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
