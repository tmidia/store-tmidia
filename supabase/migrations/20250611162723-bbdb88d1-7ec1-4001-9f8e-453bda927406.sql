
-- Atualizar o email do usuário na tabela auth.users
UPDATE auth.users 
SET email = 'tmidiamkt@gmail.com',
    raw_user_meta_data = jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb),
      '{email}',
      '"tmidiamkt@gmail.com"'::jsonb
    ),
    email_confirmed_at = now(),
    updated_at = now()
WHERE email = 'tmidia@sga.com';

-- Atualizar também na tabela auth.identities se existir
UPDATE auth.identities 
SET identity_data = jsonb_set(
      COALESCE(identity_data, '{}'::jsonb),
      '{email}',
      '"tmidiamkt@gmail.com"'::jsonb
    ),
    updated_at = now()
WHERE identity_data->>'email' = 'tmidia@sga.com';
