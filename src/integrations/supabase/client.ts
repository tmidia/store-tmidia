import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { getSupabaseConfig } from '@/lib/runtimeConfig';

const config = getSupabaseConfig();

// Indica se há credenciais (build-time ou salvas pelo assistente).
// Quando false, o App renderiza a tela de configuração em vez do sistema.
export const isSupabaseConfigured = config !== null;

// Quando não há config, criamos um client com valores placeholder apenas para
// não quebrar os imports. Ele nunca é usado, pois o App mostra o SetupWizard.
export const supabase = createClient<Database>(
  config?.url ?? 'https://placeholder.supabase.co',
  config?.anonKey ?? 'placeholder',
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
