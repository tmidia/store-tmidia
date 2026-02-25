
-- Restrict cash_sessions SELECT to own sessions + managers
DROP POLICY IF EXISTS "All can view cash_sessions" ON public.cash_sessions;

CREATE POLICY "Own or manager view cash_sessions"
  ON public.cash_sessions FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR has_role(auth.uid(), 'superadmin'::user_type) 
    OR has_role(auth.uid(), 'gerente'::user_type)
  );
