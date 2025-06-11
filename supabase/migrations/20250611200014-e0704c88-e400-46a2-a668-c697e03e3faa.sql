

-- Primeiro criar uma função que verifica se o usuário atual é superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND user_type = 'superadmin'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover todas as políticas existentes da tabela profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Superadmin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Superadmin can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Superadmin can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Superadmin can update all profiles" ON public.profiles;

-- Criar políticas que não causem recursão
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Política para inserção de perfis (permitir o próprio perfil OU superadmin)
CREATE POLICY "Allow profile creation during signup" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id OR public.is_superadmin());

-- Política para atualização - permite atualizar próprio perfil ou ser superadmin
CREATE POLICY "Users can update profiles" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_superadmin());

-- Política para superadmin ver todos os perfis
CREATE POLICY "Superadmin can view all profiles" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_superadmin());

