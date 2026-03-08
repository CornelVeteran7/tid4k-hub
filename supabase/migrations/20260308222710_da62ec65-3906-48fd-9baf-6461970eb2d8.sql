ALTER TABLE public.organizations 
  ADD COLUMN IF NOT EXISTS address text DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_info jsonb DEFAULT '{}'::jsonb;