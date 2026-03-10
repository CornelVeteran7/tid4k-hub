
-- Timetable config per org
CREATE TABLE public.timetable_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  periods_per_day integer NOT NULL DEFAULT 7,
  period_duration_minutes integer NOT NULL DEFAULT 50,
  break_durations jsonb NOT NULL DEFAULT '[10,10,20,10,10,10]'::jsonb,
  start_time time NOT NULL DEFAULT '08:00',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id)
);

ALTER TABLE public.timetable_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_read_tc" ON public.timetable_config FOR SELECT TO authenticated USING (user_org_match(organization_id));
CREATE POLICY "staff_insert_tc" ON public.timetable_config FOR INSERT TO authenticated WITH CHECK (user_org_match(organization_id) AND (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky')));
CREATE POLICY "staff_update_tc" ON public.timetable_config FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_delete_tc" ON public.timetable_config FOR DELETE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- Timetable entries (structured per-class schedule)
CREATE TABLE public.timetable_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  class_id text NOT NULL,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 1 AND 5),
  period_number smallint NOT NULL CHECK (period_number BETWEEN 1 AND 8),
  subject text NOT NULL,
  teacher_name text NOT NULL DEFAULT '',
  room text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, class_id, day_of_week, period_number)
);

ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_te" ON public.timetable_entries FOR SELECT TO anon USING (true);
CREATE POLICY "auth_read_te" ON public.timetable_entries FOR SELECT TO authenticated USING (user_org_match(organization_id));
CREATE POLICY "staff_insert_te" ON public.timetable_entries FOR INSERT TO authenticated WITH CHECK (user_org_match(organization_id) AND (has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky')));
CREATE POLICY "staff_update_te" ON public.timetable_entries FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_delete_te" ON public.timetable_entries FOR DELETE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- Teacher profiles
CREATE TABLE public.teacher_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  avatar_url text DEFAULT '/placeholder.svg',
  qr_code_url text DEFAULT '',
  subjects text[] DEFAULT '{}',
  bio text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_tp" ON public.teacher_profiles FOR SELECT TO anon USING (true);
CREATE POLICY "auth_read_tp" ON public.teacher_profiles FOR SELECT TO authenticated USING (user_org_match(organization_id));
CREATE POLICY "staff_insert_tp" ON public.teacher_profiles FOR INSERT TO authenticated WITH CHECK (user_org_match(organization_id) AND (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky')));
CREATE POLICY "staff_update_tp" ON public.teacher_profiles FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_delete_tp" ON public.teacher_profiles FOR DELETE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- School clubs
CREATE TABLE public.school_clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  advisor_teacher_id uuid REFERENCES public.teacher_profiles(id) ON DELETE SET NULL,
  logo_url text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.school_clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_clubs" ON public.school_clubs FOR SELECT TO anon USING (true);
CREATE POLICY "auth_read_clubs" ON public.school_clubs FOR SELECT TO authenticated USING (user_org_match(organization_id));
CREATE POLICY "staff_insert_clubs" ON public.school_clubs FOR INSERT TO authenticated WITH CHECK (user_org_match(organization_id) AND (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky')));
CREATE POLICY "staff_update_clubs" ON public.school_clubs FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_delete_clubs" ON public.school_clubs FOR DELETE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- Club memberships
CREATE TABLE public.club_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES public.school_clubs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'leader')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(club_id, user_id)
);

ALTER TABLE public.club_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_read_clubmem" ON public.club_memberships FOR SELECT TO authenticated USING (true);
CREATE POLICY "self_insert_clubmem" ON public.club_memberships FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_delete_clubmem" ON public.club_memberships FOR DELETE TO authenticated USING (user_id = auth.uid() OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
