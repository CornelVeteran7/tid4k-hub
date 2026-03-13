
-- Add unique constraint on raspberry_id for upsert to work
ALTER TABLE public.display_devices ADD CONSTRAINT display_devices_raspberry_id_key UNIQUE (raspberry_id);
