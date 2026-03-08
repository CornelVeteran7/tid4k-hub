-- Drop conflicting policies first, then recreate all
DROP POLICY IF EXISTS "anon_insert_queue" ON public.queue_entries;
DROP POLICY IF EXISTS "anon_read_queue" ON public.queue_entries;
DROP POLICY IF EXISTS "staff_read_queue" ON public.queue_entries;
DROP POLICY IF EXISTS "staff_update_queue" ON public.queue_entries;
DROP POLICY IF EXISTS "staff_delete_queue" ON public.queue_entries;

-- Allow anonymous users to insert queue tickets
CREATE POLICY "anon_insert_queue"
ON public.queue_entries
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anonymous to read queue entries
CREATE POLICY "anon_read_queue"
ON public.queue_entries
FOR SELECT
TO anon
USING (true);

-- Allow authenticated staff to manage queue
CREATE POLICY "staff_read_queue"
ON public.queue_entries
FOR SELECT
TO authenticated
USING (user_org_match(organization_id));

CREATE POLICY "staff_update_queue"
ON public.queue_entries
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'profesor'::app_role)
  OR has_role(auth.uid(), 'director'::app_role)
  OR has_role(auth.uid(), 'administrator'::app_role)
  OR has_role(auth.uid(), 'inky'::app_role)
);

CREATE POLICY "staff_delete_queue"
ON public.queue_entries
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'administrator'::app_role)
  OR has_role(auth.uid(), 'inky'::app_role)
);

-- Enable realtime for queue_entries
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE queue_entries;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;