-- Add unique constraint for announcement_reads upsert (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'announcement_reads_announcement_id_user_id_key'
  ) THEN
    ALTER TABLE public.announcement_reads ADD CONSTRAINT announcement_reads_announcement_id_user_id_key UNIQUE (announcement_id, user_id);
  END IF;
END $$;