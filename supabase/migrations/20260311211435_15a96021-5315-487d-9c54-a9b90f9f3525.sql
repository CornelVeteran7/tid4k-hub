
ALTER TABLE public.attendance 
ADD COLUMN IF NOT EXISTS marked_at timestamptz DEFAULT now();

ALTER TABLE public.attendance 
ADD COLUMN IF NOT EXISTS scanned_by_parent boolean DEFAULT false;
