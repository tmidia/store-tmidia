
-- Verificar se o usuário existe antes de excluir
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Buscar o ID do usuário
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'adj.gomes@hotmail.com';
    
    IF user_uuid IS NOT NULL THEN
        -- Excluir permissões do usuário
        DELETE FROM public.user_permissions WHERE user_id = user_uuid;
        
        -- Excluir o perfil
        DELETE FROM public.profiles WHERE id = user_uuid;
        
        -- Excluir o usuário da tabela auth.users
        DELETE FROM auth.users WHERE id = user_uuid;
        
        RAISE NOTICE 'Usuário adj.gomes@hotmail.com excluído com sucesso';
    ELSE
        RAISE NOTICE 'Usuário adj.gomes@hotmail.com não encontrado';
    END IF;
END $$;

-- Recriar o usuário com os dados fornecidos
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'adj.gomes@hotmail.com',
    crypt('@Adson_2025', gen_salt('bf')),
    now(),
    '{"username": "adson_gomes", "full_name": "Adson José Gomes", "user_type": "vendedor", "cpf": "99930048200"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
);

-- Criar perfil para o novo usuário usando INSERT com ON CONFLICT
INSERT INTO public.profiles (id, username, full_name, user_type, cpf, is_active)
SELECT 
    au.id,
    'adson_gomes',
    'Adson José Gomes',
    'vendedor'::user_type,
    '99930048200',
    true
FROM auth.users au
WHERE au.email = 'adj.gomes@hotmail.com'
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    full_name = EXCLUDED.full_name,
    user_type = EXCLUDED.user_type,
    cpf = EXCLUDED.cpf,
    is_active = EXCLUDED.is_active,
    updated_at = now();
