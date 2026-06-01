-- ============================================================================
-- ÂNCORA DE LICENÇA (roda no banco de CADA LOJA, não no central)
-- Cria um ID de licença ESTÁVEL por loja, guardado no banco da própria loja.
-- Assim todos os navegadores/dispositivos da loja usam a MESMA licença
-- (não duplica mais). Já vai incluído no schema mestre das lojas novas;
-- para lojas que já existem, rode este script uma vez no SQL Editor.
-- ============================================================================

-- Tabela de uma linha só, guardando o id da licença da loja.
CREATE TABLE IF NOT EXISTS public.app_license (
  singleton   boolean PRIMARY KEY DEFAULT true,
  license_id  uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_license_singleton CHECK (singleton)
);

ALTER TABLE public.app_license ENABLE ROW LEVEL SECURITY;
-- Sem políticas: ninguém acessa a tabela direto. Só a função abaixo (definer).

-- Retorna o id da licença da loja, criando-o na primeira vez (idempotente).
-- Pode ser chamada pelo app antes do login (anon).
CREATE OR REPLACE FUNCTION public.get_or_create_license_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v uuid;
BEGIN
  INSERT INTO public.app_license (singleton) VALUES (true)
  ON CONFLICT (singleton) DO NOTHING;
  SELECT license_id INTO v FROM public.app_license WHERE singleton = true;
  RETURN v;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_or_create_license_id() TO anon, authenticated;
