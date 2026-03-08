
-- Create storage bucket for construction photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('construction-photos', 'construction-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "auth_upload_construction_photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'construction-photos');

-- Allow public read
CREATE POLICY "public_read_construction_photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'construction-photos');

-- Allow authenticated users to update their uploads
CREATE POLICY "auth_update_construction_photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'construction-photos');

-- Allow authenticated users to delete their uploads
CREATE POLICY "auth_delete_construction_photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'construction-photos');
