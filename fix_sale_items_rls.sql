-- ============================================================
-- CORREÇÃO: Políticas RLS para sale_items
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- 1. Qualquer usuário ativo pode VER itens de vendas
CREATE POLICY "active_users_select_sale_items"
  ON sale_items FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_active = true
  ));

-- 2. Vendedor (ou superior) pode INSERIR novos itens na venda
CREATE POLICY "vendedor_insert_sale_items"
  ON sale_items FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'vendedor'));

-- 3. Gerentes/Superadmins podem ATUALIZAR/DELETAR
CREATE POLICY "manager_update_sale_items"
  ON sale_items FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'gerente'));

CREATE POLICY "admin_delete_sale_items"
  ON sale_items FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'superadmin'));

-- ============================================================
-- VERIFICAÇÃO
-- ============================================================
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'sale_items';
