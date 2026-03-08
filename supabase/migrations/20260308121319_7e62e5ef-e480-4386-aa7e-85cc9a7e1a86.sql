
-- Queue entries table for Medicine/Students verticals
CREATE TABLE public.queue_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id),
  numar_tichet integer NOT NULL,
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','called','serving','done','skipped')),
  cabinet text,
  created_at timestamptz NOT NULL DEFAULT now(),
  called_at timestamptz,
  completed_at timestamptz,
  note text DEFAULT ''
);

ALTER TABLE public.queue_entries ENABLE ROW LEVEL SECURITY;

-- Public can read queue (displayed on screens)
CREATE POLICY "anon_read_queue" ON public.queue_entries FOR SELECT TO anon USING (true);
CREATE POLICY "auth_read_queue" ON public.queue_entries FOR SELECT TO authenticated USING (true);

-- Staff can manage queue
CREATE POLICY "staff_insert_queue" ON public.queue_entries FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_update_queue" ON public.queue_entries FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'director') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_delete_queue" ON public.queue_entries FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- Construction tasks table
CREATE TABLE public.construction_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id),
  titlu text NOT NULL,
  descriere text DEFAULT '',
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','in_progress','done','blocked')),
  prioritate text DEFAULT 'normal' CHECK (prioritate IN ('low','normal','high','urgent')),
  assignee text DEFAULT '',
  locatie text DEFAULT '',
  data_limita date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.construction_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_ctasks" ON public.construction_tasks FOR SELECT TO anon USING (true);
CREATE POLICY "auth_read_ctasks" ON public.construction_tasks FOR SELECT TO authenticated USING (user_org_match(organization_id));
CREATE POLICY "staff_insert_ctasks" ON public.construction_tasks FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_update_ctasks" ON public.construction_tasks FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
CREATE POLICY "staff_delete_ctasks" ON public.construction_tasks FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));

-- SSM reminders table for construction
CREATE TABLE public.ssm_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id),
  mesaj text NOT NULL,
  tip text DEFAULT 'reminder' CHECK (tip IN ('reminder','warning','danger')),
  activ boolean DEFAULT true,
  ordine integer DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ssm_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_ssm" ON public.ssm_reminders FOR SELECT TO anon USING (true);
CREATE POLICY "auth_read_ssm" ON public.ssm_reminders FOR SELECT TO authenticated USING (user_org_match(organization_id));
CREATE POLICY "staff_manage_ssm" ON public.ssm_reminders FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'))
  WITH CHECK (has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky'));
