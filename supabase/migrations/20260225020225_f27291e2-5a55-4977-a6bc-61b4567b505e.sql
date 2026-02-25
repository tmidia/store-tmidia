
-- Fix remaining permissive RLS policies

-- CATEGORIES: all can read, gerente+ can modify
DROP POLICY IF EXISTS "Authenticated full access categories" ON public.categories;
CREATE POLICY "All can view categories" ON public.categories
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manager can insert categories" ON public.categories
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'gerente'));
CREATE POLICY "Manager can update categories" ON public.categories
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'gerente'));
CREATE POLICY "Manager can delete categories" ON public.categories
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'gerente'));

-- CASH_SESSIONS: all authenticated (needed for PDV operations by caixa/vendedor)
DROP POLICY IF EXISTS "Authenticated full access cash_sessions" ON public.cash_sessions;
CREATE POLICY "All can view cash_sessions" ON public.cash_sessions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "All can insert cash_sessions" ON public.cash_sessions
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Own or manager update cash_sessions" ON public.cash_sessions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'gerente'));
CREATE POLICY "Manager delete cash_sessions" ON public.cash_sessions
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'gerente'));

-- FINANCIAL_CATEGORIES: all can read, gerente+ can modify
DROP POLICY IF EXISTS "Authenticated full access financial_categories" ON public.financial_categories;
CREATE POLICY "All can view financial_categories" ON public.financial_categories
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manager can insert financial_categories" ON public.financial_categories
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'gerente'));
CREATE POLICY "Manager can update financial_categories" ON public.financial_categories
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'gerente'));
CREATE POLICY "Manager can delete financial_categories" ON public.financial_categories
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'gerente'));
