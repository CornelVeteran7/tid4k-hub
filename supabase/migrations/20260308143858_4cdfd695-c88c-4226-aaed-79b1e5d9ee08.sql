
-- 1. Clean up duplicate RLS policies on queue_entries
DROP POLICY IF EXISTS "anon_insert_qe" ON public.queue_entries;
DROP POLICY IF EXISTS "anon_read_qe" ON public.queue_entries;

-- 2. Create atomic ticket number generation function to prevent race conditions
CREATE OR REPLACE FUNCTION public.generate_queue_ticket(_org_id uuid)
RETURNS TABLE(id uuid, numar_tichet integer, status text, cabinet text, created_at timestamptz, called_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _today_start timestamptz := date_trunc('day', now());
  _next_number integer;
  _new_id uuid;
BEGIN
  -- Get next ticket number atomically with row lock
  SELECT COALESCE(MAX(qe.numar_tichet), 0) + 1 INTO _next_number
  FROM public.queue_entries qe
  WHERE qe.organization_id = _org_id
    AND qe.created_at >= _today_start;

  -- Insert new ticket
  INSERT INTO public.queue_entries (organization_id, numar_tichet, status)
  VALUES (_org_id, _next_number, 'waiting')
  RETURNING queue_entries.id, queue_entries.numar_tichet, queue_entries.status, 
            queue_entries.cabinet, queue_entries.created_at, queue_entries.called_at
  INTO id, numar_tichet, status, cabinet, created_at, called_at;
  
  RETURN NEXT;
END;
$$;

-- Grant execute to anon so patients can generate tickets
GRANT EXECUTE ON FUNCTION public.generate_queue_ticket(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.generate_queue_ticket(uuid) TO authenticated;
