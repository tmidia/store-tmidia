
-- Adicionar o valor "categorias" ao enum module_permission no Supabase
ALTER TYPE public.module_permission ADD VALUE IF NOT EXISTS 'categorias';
