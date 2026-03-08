
-- Queue configuration table (persistent service points / cabinets)
CREATE TABLE IF NOT EXISTS public.queue_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  service_points jsonb NOT NULL DEFAULT '["Cabinet 1","Cabinet 2","Cabinet 3"]'::jsonb,
  daily_reset_time time NOT NULL DEFAULT '06:00:00',
  prefix text NOT NULL DEFAULT '',
  avg_service_minutes smallint NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id)
);

ALTER TABLE public.queue_config ENABLE ROW LEVEL SECURITY;

-- RLS for queue_config
CREATE POLICY "auth_read_qc" ON public.queue_config FOR SELECT TO authenticated
  USING (user_org_match(organization_id));

CREATE POLICY "staff_insert_qc" ON public.queue_config FOR INSERT TO authenticated
  WITH CHECK (
    user_org_match(organization_id) AND (
      has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR
      has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'inky')
    )
  );

CREATE POLICY "staff_update_qc" ON public.queue_config FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'director') OR
    has_role(auth.uid(), 'profesor') OR has_role(auth.uid(), 'inky')
  );

CREATE POLICY "staff_delete_qc" ON public.queue_config FOR DELETE TO authenticated
  USING (
    has_role(auth.uid(), 'administrator') OR has_role(auth.uid(), 'inky')
  );

-- Also allow anon SELECT on queue_entries for public display
CREATE POLICY "anon_read_qe" ON public.queue_entries FOR SELECT TO anon
  USING (true);

-- Allow anon INSERT on queue_entries (patients scanning QR generate tickets)
CREATE POLICY "anon_insert_qe" ON public.queue_entries FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anon read on queue_config for public display
CREATE POLICY "anon_read_qc" ON public.queue_config FOR SELECT TO anon
  USING (true);
