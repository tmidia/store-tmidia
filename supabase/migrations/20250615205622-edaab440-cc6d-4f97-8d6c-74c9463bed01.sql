
-- Cria um "bucket" (um contêiner de armazenamento) público para os logos da empresa.
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Define uma política que permite que qualquer pessoa visualize os logos.
-- Isso é necessário para que o logo possa ser exibido no sistema.
CREATE POLICY "Public read access for logos"
ON storage.objects FOR SELECT
USING ( bucket_id = 'logos' );

-- Define uma política que permite apenas a superadmins enviarem novos logos.
CREATE POLICY "Superadmins can upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'logos' AND public.is_superadmin() );

-- Define uma política que permite apenas a superadmins atualizarem os logos.
CREATE POLICY "Superadmins can update logos"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'logos' AND public.is_superadmin() );

-- Define uma política que permite apenas a superadmins deletarem os logos.
CREATE POLICY "Superadmins can delete logos"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'logos' AND public.is_superadmin() );
