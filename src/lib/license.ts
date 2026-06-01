import { createClient } from '@supabase/supabase-js';
import { supabase as storeClient } from '@/integrations/supabase/client';

// ============================================================================
// Conexão com o BANCO CENTRAL de licenças (separado do banco da loja).
// A chave anon é pública por design; as lojas só podem chamar as funções
// register_trial / get_license (a tabela de licenças não é exposta ao anon).
// ============================================================================
const CENTRAL_URL = 'https://moaykzvavhfljlrowkkr.supabase.co';
const CENTRAL_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vYXlrenZhdmhmbGpscm93a2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyODIxMTcsImV4cCI6MjA5NTg1ODExN30.KJov1lJ40rFPairZlhFoBR-9CaDlZEzs8vSk4wI__zs';

const LICENSE_KEY = 'sga.licenseId';
const DAY = 86400000;

const central = createClient(CENTRAL_URL, CENTRAL_ANON, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export interface License {
  status: 'trial' | 'active' | 'overdue' | 'blocked';
  trial_ends_at: string | null;
  expires_at: string | null;
  store_name: string | null;
}

export type LicenseState =
  | { state: 'ok'; days: number | null; kind: 'trial' | 'active' }
  | { state: 'warning'; days: number; kind: 'trial' | 'active' }
  | { state: 'blocked'; reason: 'blocked' | 'trial_expired' | 'expired' };

function uuidv4(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/**
 * ID estável da licença da loja. Preferimos o banco da PRÓPRIA loja
 * (compartilhado entre todos os navegadores/dispositivos), com fallback para
 * o localStorage caso a loja ainda não tenha a função get_or_create_license_id.
 */
async function getStableId(): Promise<string> {
  try {
    const { data, error } = await storeClient.rpc('get_or_create_license_id');
    if (!error && data) {
      localStorage.setItem(LICENSE_KEY, data as string);
      return data as string;
    }
  } catch {
    /* loja sem o RPC ainda → usa fallback abaixo */
  }
  let id = localStorage.getItem(LICENSE_KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(LICENSE_KEY, id);
  }
  return id;
}

async function fetchLicense(id: string): Promise<License | null> {
  const { data, error } = await central.rpc('get_license', { license_id: id });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return (row as License) ?? null;
}

/** Garante uma licença (cria trial na 1ª vez) e retorna o status atual. */
export async function resolveLicense(): Promise<{ id: string; license: License | null }> {
  const id = await getStableId();
  // Registra o trial para esse id (idempotente: não duplica se já existir).
  await central.rpc('register_trial', {
    p_id: id,
    p_store_name: typeof window !== 'undefined' ? window.location.hostname : '',
  });
  const license = await fetchLicense(id);
  return { id, license };
}

/** Calcula o estado de exibição a partir das datas da licença. */
export function computeState(license: License | null): LicenseState {
  // Sem dados (erro/indisponível) → não bloqueia (fail-open).
  if (!license) return { state: 'ok', days: null, kind: 'active' };

  const now = Date.now();

  if (license.status === 'blocked') return { state: 'blocked', reason: 'blocked' };

  if (license.status === 'trial') {
    const end = license.trial_ends_at ? new Date(license.trial_ends_at).getTime() : null;
    if (end !== null && end < now) return { state: 'blocked', reason: 'trial_expired' };
    const days = end !== null ? Math.ceil((end - now) / DAY) : null;
    if (days !== null && days <= 3) return { state: 'warning', days, kind: 'trial' };
    return { state: 'ok', days, kind: 'trial' };
  }

  // active / overdue
  const end = license.expires_at ? new Date(license.expires_at).getTime() : null;
  if (end !== null && end < now) return { state: 'blocked', reason: 'expired' };
  const days = end !== null ? Math.ceil((end - now) / DAY) : null;
  if (days !== null && days <= 3) return { state: 'warning', days, kind: 'active' };
  return { state: 'ok', days, kind: 'active' };
}

export function getLicenseId(): string {
  return localStorage.getItem(LICENSE_KEY) || '';
}
