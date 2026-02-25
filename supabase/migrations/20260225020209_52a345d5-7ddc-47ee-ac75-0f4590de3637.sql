
-- Fix PUBLIC_DATA_EXPOSURE and SECRETS_EXPOSED: Replace overly permissive RLS policies with role-based access

-- 1. INTEGRATIONS: superadmin only (contains API tokens)
DROP POLICY IF EXISTS "Authenticated full access integrations" ON public.integrations;
CREATE POLICY "Superadmin manage integrations" ON public.integrations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'))
  WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

-- 2. COMPANY_SETTINGS: all can read, superadmin can modify
DROP POLICY IF EXISTS "Authenticated full access company_settings" ON public.company_settings;
CREATE POLICY "All can view company_settings" ON public.company_settings
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Superadmin manage company_settings" ON public.company_settings
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'superadmin'));
CREATE POLICY "Superadmin update company_settings" ON public.company_settings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'superadmin'));
CREATE POLICY "Superadmin delete company_settings" ON public.company_settings
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'superadmin'));

-- 3. SYSTEM_PARAMETERS: all can read, superadmin can modify
DROP POLICY IF EXISTS "Authenticated full access system_parameters" ON public.system_parameters;
CREATE POLICY "All can view system_parameters" ON public.system_parameters
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Superadmin manage system_parameters" ON public.system_parameters
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'superadmin'));
CREATE POLICY "Superadmin update system_parameters" ON public.system_parameters
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'superadmin'));
CREATE POLICY "Superadmin delete system_parameters" ON public.system_parameters
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'superadmin'));

-- 4. ACCOUNTS_PAYABLE: gerente+ only
DROP POLICY IF EXISTS "Authenticated full access accounts_payable" ON public.accounts_payable;
CREATE POLICY "Manager access accounts_payable" ON public.accounts_payable
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'gerente'))
  WITH CHECK (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'gerente'));

-- 5. ACCOUNTS_RECEIVABLE: gerente+ only
DROP POLICY IF EXISTS "Authenticated full access accounts_receivable" ON public.accounts_receivable;
CREATE POLICY "Manager access accounts_receivable" ON public.accounts_receivable
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'gerente'))
  WITH CHECK (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'gerente'));

-- 6. PRODUCTS: all can read, gerente+ can modify
DROP POLICY IF EXISTS "Authenticated full access products" ON public.products;
CREATE POLICY "All can view products" ON public.products
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manager can insert products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'gerente'));
CREATE POLICY "Manager can update products" ON public.products
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'gerente'));
CREATE POLICY "Manager can delete products" ON public.products
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'gerente'));

-- 7. SUPPLIERS: all can read, gerente+ can modify
DROP POLICY IF EXISTS "Authenticated full access suppliers" ON public.suppliers;
CREATE POLICY "All can view suppliers" ON public.suppliers
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manager can insert suppliers" ON public.suppliers
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'gerente'));
CREATE POLICY "Manager can update suppliers" ON public.suppliers
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'gerente'));
CREATE POLICY "Manager can delete suppliers" ON public.suppliers
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'gerente'));

-- 8. FINANCIAL_TRANSACTIONS: gerente+ only
DROP POLICY IF EXISTS "Authenticated full access financial_transactions" ON public.financial_transactions;
CREATE POLICY "Manager access financial_transactions" ON public.financial_transactions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'gerente'))
  WITH CHECK (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'gerente'));

-- 9. PRODUCT_VARIATIONS: all can read, gerente+ can modify
DROP POLICY IF EXISTS "Authenticated full access product_variations" ON public.product_variations;
CREATE POLICY "All can view product_variations" ON public.product_variations
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manager can insert product_variations" ON public.product_variations
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'gerente'));
CREATE POLICY "Manager can update product_variations" ON public.product_variations
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'gerente'));
CREATE POLICY "Manager can delete product_variations" ON public.product_variations
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'gerente'));
