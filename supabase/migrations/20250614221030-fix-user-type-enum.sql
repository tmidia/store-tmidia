
-- Criar o tipo enum user_type se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
        CREATE TYPE user_type AS ENUM ('vendedor', 'gerente', 'admin', 'superadmin');
    END IF;
END$$;

-- Corrigir a função handle_new_user para não falhar se o tipo não existir
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE 
      WHEN NEW.raw_user_meta_data->>'user_type' IN ('vendedor', 'gerente', 'admin', 'superadmin') 
      THEN (NEW.raw_user_meta_data->>'user_type')::user_type 
      ELSE 'vendedor'::user_type 
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    username = COALESCE(NEW.raw_user_meta_data->>'username', profiles.username),
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', profiles.full_name),
    user_type = CASE 
      WHEN NEW.raw_user_meta_data->>'user_type' IN ('vendedor', 'gerente', 'admin', 'superadmin') 
      THEN (NEW.raw_user_meta_data->>'user_type')::user_type 
      ELSE profiles.user_type 
    END,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir que todos os usuários existentes tenham perfis
INSERT INTO public.profiles (id, username, full_name, user_type)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)),
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  'vendedor'::user_type
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO NOTHING;
