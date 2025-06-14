
-- Verificar e corrigir o usuário tmidiamkt@gmail.com
-- Primeiro, vamos verificar se o usuário existe e seu status
SELECT 
    id, 
    email, 
    email_confirmed_at, 
    created_at,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'tmidiamkt@gmail.com';

-- Garantir que o email está confirmado e ativo
UPDATE auth.users 
SET 
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
WHERE email = 'tmidiamkt@gmail.com';

-- Verificar se existe perfil para este usuário
SELECT * FROM public.profiles 
WHERE id = (SELECT id FROM auth.users WHERE email = 'tmidiamkt@gmail.com');

-- Criar/atualizar perfil se necessário
INSERT INTO public.profiles (id, username, full_name, user_type)
SELECT 
    au.id,
    'tmidiamkt',
    'TMIDIA Admin',
    'superadmin'::user_type
FROM auth.users au
WHERE au.email = 'tmidiamkt@gmail.com'
ON CONFLICT (id) DO UPDATE SET
    username = 'tmidiamkt',
    full_name = 'TMIDIA Admin',
    user_type = 'superadmin'::user_type,
    is_active = true,
    updated_at = now();
