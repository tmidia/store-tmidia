
-- Adicionar política para permitir que superadmins insiram novos perfis
CREATE POLICY "Superadmin can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'superadmin'
    )
  );

-- Adicionar política para permitir que superadmins visualizem todos os perfis
CREATE POLICY "Superadmin can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'superadmin'
    )
  );

-- Adicionar política para permitir que superadmins atualizem todos os perfis
CREATE POLICY "Superadmin can update all profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'superadmin'
    )
  );
