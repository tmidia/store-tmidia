
-- Fix overly permissive INSERT policy on cash_sessions
-- Any authenticated user shouldn't be able to insert; restrict to authenticated users
-- but tie the session to their own user_id
DROP POLICY IF EXISTS "All can insert cash_sessions" ON public.cash_sessions;

CREATE POLICY "Authenticated can insert own cash_sessions"
  ON public.cash_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR has_role(auth.uid(), 'superadmin'::user_type) OR has_role(auth.uid(), 'gerente'::user_type));
