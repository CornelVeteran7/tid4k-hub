
-- Guest tokens for daily-rotating QR codes
CREATE TABLE public.guest_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  token text NOT NULL,
  valid_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, valid_date),
  UNIQUE (token)
);

-- RLS: anon can SELECT only today's tokens, authenticated org members can manage
ALTER TABLE public.guest_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read today tokens"
  ON public.guest_tokens FOR SELECT
  TO anon, authenticated
  USING (valid_date = CURRENT_DATE);

CREATE POLICY "Authenticated users can insert tokens for their org"
  ON public.guest_tokens FOR INSERT
  TO authenticated
  WITH CHECK (user_org_match(organization_id));

-- Function to get or create today's token for an org (called from display)
CREATE OR REPLACE FUNCTION public.get_or_create_daily_token(_org_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _token text;
BEGIN
  -- Try to get existing token for today
  SELECT token INTO _token
  FROM public.guest_tokens
  WHERE organization_id = _org_id AND valid_date = CURRENT_DATE;
  
  IF _token IS NOT NULL THEN
    RETURN _token;
  END IF;
  
  -- Generate new 12-char alphanumeric token
  _token := substr(md5(random()::text || clock_timestamp()::text), 1, 12);
  
  INSERT INTO public.guest_tokens (organization_id, token, valid_date)
  VALUES (_org_id, _token, CURRENT_DATE)
  ON CONFLICT (organization_id, valid_date) DO UPDATE SET token = EXCLUDED.token
  RETURNING token INTO _token;
  
  RETURN _token;
END;
$$;

-- Allow anon to call this function (display runs without auth)
GRANT EXECUTE ON FUNCTION public.get_or_create_daily_token(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_or_create_daily_token(uuid) TO authenticated;

-- Cleanup old tokens (keep last 7 days for audit)
CREATE OR REPLACE FUNCTION public.cleanup_old_guest_tokens()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  DELETE FROM public.guest_tokens WHERE valid_date < CURRENT_DATE - INTERVAL '7 days';
$$;
