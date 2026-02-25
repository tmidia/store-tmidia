
-- Fix storage policies: restrict logo uploads to superadmins only
DROP POLICY IF EXISTS "Authenticated can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete logos" ON storage.objects;

CREATE POLICY "Superadmins can upload logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'logos' AND 
    public.has_role(auth.uid(), 'superadmin')
  );

CREATE POLICY "Superadmins can update logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'logos' AND 
    public.has_role(auth.uid(), 'superadmin')
  );

CREATE POLICY "Superadmins can delete logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'logos' AND 
    public.has_role(auth.uid(), 'superadmin')
  );
