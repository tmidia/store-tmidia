-- ============================================================================
-- Banco CENTRAL de licenças do SGA
-- Rode este SQL num projeto Supabase SEPARADO (dedicado só a licenças).
-- Ele NÃO vai junto com o banco de nenhuma loja.
-- ============================================================================

-- Tabela de licenças (1 linha por loja/cliente)
CREATE TABLE IF NOT EXISTS public.licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name   text NOT NULL DEFAULT 'Nova Loja',
  owner_email  text,
  status       text NOT NULL DEFAULT 'trial'
               CHECK (status IN ('trial','active','overdue','blocked')),
  trial_ends_at timestamptz,        -- fim do teste de 7 dias
  expires_at    timestamptz,        -- vencimento da assinatura paga
  amount        numeric(10,2) DEFAULT 0,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

-- Só o admin autenticado (você, logado no projeto central) mexe na tabela.
-- As lojas NÃO acessam a tabela direto — só pelas funções abaixo.
DROP POLICY IF EXISTS "admin full access licenses" ON public.licenses;
CREATE POLICY "admin full access licenses" ON public.licenses
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Função: registrar um TRIAL de 7 dias para um ID fornecido pela loja.
-- A loja gera um ID estável (guardado no banco dela) e passa aqui; assim
-- todos os navegadores/dispositivos da mesma loja usam UMA única licença.
-- Idempotente: se o ID já existe, não cria de novo.
-- ----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.register_trial(text, text);
CREATE OR REPLACE FUNCTION public.register_trial(p_id uuid, p_store_name text DEFAULT 'Nova Loja')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.licenses (id, store_name, status, trial_ends_at)
  VALUES (p_id, COALESCE(NULLIF(p_store_name,''),'Nova Loja'),
          'trial', now() + interval '7 days')
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- ----------------------------------------------------------------------------
-- Função: consultar o status de UMA licença (chamada pela loja a cada abertura).
-- Devolve só os campos necessários — não expõe a tabela inteira.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_license(license_id uuid)
RETURNS TABLE(status text, trial_ends_at timestamptz, expires_at timestamptz, store_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT status, trial_ends_at, expires_at, store_name
  FROM public.licenses WHERE id = license_id;
$$;

-- Permissões: lojas (anon) podem chamar só as funções.
GRANT EXECUTE ON FUNCTION public.register_trial(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_license(uuid)          TO anon, authenticated;

-- Mantém updated_at em dia
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS trg_licenses_updated ON public.licenses;
CREATE TRIGGER trg_licenses_updated BEFORE UPDATE ON public.licenses
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
