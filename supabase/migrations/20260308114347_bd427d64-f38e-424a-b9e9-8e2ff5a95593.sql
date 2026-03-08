
-- 1. Add expiry date to announcements
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS data_expirare timestamptz DEFAULT NULL;

-- 2. Add allergies JSONB + extra fields to children
ALTER TABLE public.children ADD COLUMN IF NOT EXISTS alergii text[] DEFAULT '{}';
ALTER TABLE public.children ADD COLUMN IF NOT EXISTS note_medicale text DEFAULT '';
ALTER TABLE public.children ADD COLUMN IF NOT EXISTS info_extra jsonb DEFAULT '{}';

-- 3. Add NFC setting to organizations
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS nfc_enabled boolean DEFAULT false;

-- 4. Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true) ON CONFLICT DO NOTHING;

-- 5. Storage RLS: anyone can read public bucket
CREATE POLICY "Public read documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
CREATE POLICY "Authenticated upload documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');
CREATE POLICY "Authenticated delete documents" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'documents');
