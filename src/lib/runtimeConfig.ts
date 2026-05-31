/**
 * Configuração de conexão com o Supabase resolvida em TEMPO DE EXECUÇÃO.
 *
 * Ordem de prioridade:
 *   1. Variáveis de build (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY)
 *      — usado quando o app é buildado já com as credenciais (ex.: desktop).
 *   2. Config salva no navegador (localStorage) pelo assistente de instalação.
 *
 * Se nenhuma existir, o app mostra a tela de configuração (SetupWizard).
 */
const STORAGE_KEY = 'sga.supabaseConfig';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

function fromEnv(): SupabaseConfig | null {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
  if (url && anonKey) return { url, anonKey };
  return null;
}

function fromStorage(): SupabaseConfig | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.url && parsed?.anonKey) return parsed as SupabaseConfig;
  } catch {
    /* ignora config corrompida */
  }
  return null;
}

export function getSupabaseConfig(): SupabaseConfig | null {
  return fromEnv() ?? fromStorage();
}

export function isConfigured(): boolean {
  return getSupabaseConfig() !== null;
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function clearSupabaseConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/** Extrai o "ref" do projeto a partir da URL (https://<ref>.supabase.co). */
export function extractProjectRef(url: string): string | null {
  const m = url.match(/https?:\/\/([a-z0-9]+)\.supabase\.co/i);
  return m ? m[1] : null;
}
