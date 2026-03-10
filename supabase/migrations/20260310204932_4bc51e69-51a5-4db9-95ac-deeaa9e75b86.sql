
-- Medicine services table
CREATE TABLE public.medicine_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price_from NUMERIC DEFAULT 0,
  price_to NUMERIC DEFAULT 0,
  duration_minutes INTEGER DEFAULT 30,
  ordine INTEGER DEFAULT 1,
  activ BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.medicine_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_medsvc" ON public.medicine_services FOR SELECT TO anon USING (true);
CREATE POLICY "auth_read_medsvc" ON public.medicine_services FOR SELECT TO authenticated USING (user_org_match(organization_id));
CREATE POLICY "staff_insert_medsvc" ON public.medicine_services FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_update_medsvc" ON public.medicine_services FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_delete_medsvc" ON public.medicine_services FOR DELETE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- Doctor profiles table
CREATE TABLE public.doctor_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  photo_url TEXT DEFAULT '',
  specialization TEXT DEFAULT '',
  credentials TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  ordine INTEGER DEFAULT 1,
  activ BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_docprof" ON public.doctor_profiles FOR SELECT TO anon USING (true);
CREATE POLICY "auth_read_docprof" ON public.doctor_profiles FOR SELECT TO authenticated USING (user_org_match(organization_id));
CREATE POLICY "staff_insert_docprof" ON public.doctor_profiles FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_update_docprof" ON public.doctor_profiles FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_delete_docprof" ON public.doctor_profiles FOR DELETE TO authenticated USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- Add service_type to queue_entries
ALTER TABLE public.queue_entries ADD COLUMN IF NOT EXISTS service_type TEXT DEFAULT NULL;
