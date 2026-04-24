import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  const msg =
    'Variáveis de ambiente do Supabase não configuradas. ' +
    'Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no provedor de hospedagem.';
  if (typeof document !== 'undefined') {
    document.body.innerHTML =
      `<div style="font-family:system-ui;padding:2rem;max-width:640px;margin:3rem auto;` +
      `border:1px solid #fca5a5;background:#fef2f2;border-radius:8px;color:#991b1b">` +
      `<h2 style="margin:0 0 .5rem">Configuração pendente</h2>` +
      `<p style="margin:0">${msg}</p></div>`;
  }
  throw new Error(msg);
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});