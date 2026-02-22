
-- Drop the existing FK and re-add pointing to profiles for join support
ALTER TABLE public.financial_transactions DROP CONSTRAINT financial_transactions_user_id_fkey;
ALTER TABLE public.financial_transactions 
  ADD CONSTRAINT financial_transactions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id);
