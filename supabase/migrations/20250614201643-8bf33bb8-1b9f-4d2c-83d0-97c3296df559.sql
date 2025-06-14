
-- Adicionar coluna CPF na tabela profiles
ALTER TABLE public.profiles ADD COLUMN cpf text;

-- Criar índice único para CPF para evitar duplicatas
CREATE UNIQUE INDEX idx_profiles_cpf_unique ON public.profiles(cpf) WHERE cpf IS NOT NULL;
