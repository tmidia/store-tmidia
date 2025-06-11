
-- Remover todas as políticas existentes da tabela profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Superadmin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Superadmin can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Superadmin can update all profiles" ON public.profiles;

-- Criar função auxiliar para verificar se o usuário é superadmin (melhorada)
CREATE OR REPLACE FUNCTION public.is_current_user_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND user_type = 'superadmin' AND is_active = true
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Política para visualizar próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Política para superadmins verem todos os perfis
CREATE POLICY "Superadmin can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_current_user_superadmin());

-- Política para permitir criação de perfil durante signup (próprio perfil OU por superadmin)
CREATE POLICY "Allow profile creation" ON public.profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id OR public.is_current_user_superadmin()
  );

-- Política para atualização de perfis (próprio perfil OU por superadmin)
CREATE POLICY "Allow profile updates" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id OR public.is_current_user_superadmin()
  );

-- Política para permitir que superadmins deletem perfis (se necessário)
CREATE POLICY "Superadmin can delete profiles" ON public.profiles
  FOR DELETE USING (public.is_current_user_superadmin());
