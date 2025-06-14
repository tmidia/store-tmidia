
-- Verificar se o tipo user_type existe e criá-lo se necessário
DO $$
BEGIN
    -- Primeiro, verificar se o tipo já existe
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
        CREATE TYPE user_type AS ENUM ('vendedor', 'gerente', 'admin', 'superadmin');
    END IF;
    
    -- Verificar se o tipo account_status existe e criá-lo se necessário
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status') THEN
        CREATE TYPE account_status AS ENUM ('pendente', 'pago', 'vencido', 'cancelado');
    END IF;
    
    -- Verificar se o tipo transaction_type existe e criá-lo se necessário  
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE transaction_type AS ENUM ('entrada', 'saida');
    END IF;
    
    -- Verificar se o tipo system_module existe e criá-lo se necessário
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'system_module') THEN
        CREATE TYPE system_module AS ENUM ('produtos', 'categorias', 'fornecedores', 'financeiro', 'pdv', 'relatorios', 'usuarios', 'configuracoes');
    END IF;
END$$;

-- Remover e recriar a função handle_new_user com validação mais robusta
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Inserir ou atualizar perfil do usuário
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
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro e continuar sem falhar
    RAISE LOG 'Erro na função handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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
