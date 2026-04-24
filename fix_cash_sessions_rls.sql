-- ============================================================
-- CORREÇÃO: Políticas RLS para cash_sessions
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- 1. Qualquer usuário ativo pode VER sessões de caixa
CREATE POLICY "active_users_select_cash_sessions"
  ON cash_sessions FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_active = true
  ));

-- 2. Vendedor (ou superior) pode ABRIR caixa
CREATE POLICY "vendedor_insert_cash_sessions"
  ON cash_sessions FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'vendedor'));

-- 3. Vendedor (ou superior) pode FECHAR/ATUALIZAR caixa
CREATE POLICY "vendedor_update_cash_sessions"
  ON cash_sessions FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'vendedor'));

-- 4. Apenas superadmin pode DELETAR sessões
CREATE POLICY "admin_delete_cash_sessions"
  ON cash_sessions FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'superadmin'));

-- ============================================================
-- VERIFICAÇÃO: Confirme que as políticas existem
-- ============================================================
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'cash_sessions';
