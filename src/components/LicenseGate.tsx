import { useEffect, useState, useCallback } from 'react';
import { AlertTriangle, Lock, RefreshCw } from 'lucide-react';
import { resolveLicense, computeState, getLicenseId, type LicenseState } from '@/lib/license';

// Personalize aqui o contato/cobrança que aparece na tela de bloqueio.
const SUPORTE_WHATSAPP = '5568996030707';
const RECHECK_MS = 5 * 60 * 1000; // recheca a cada 5 min (desbloqueia sozinho ao pagar)

interface Props {
  children: React.ReactNode;
}

export function LicenseGate({ children }: Props) {
  const [state, setState] = useState<LicenseState | null>(null);
  const [checking, setChecking] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const check = useCallback(async () => {
    setChecking(true);
    try {
      const { license } = await resolveLicense();
      setState(computeState(license));
    } catch {
      // Erro de rede / central indisponível → não bloqueia (fail-open).
      setState({ state: 'ok', days: null, kind: 'active' });
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    check();
    const iv = setInterval(check, RECHECK_MS);
    const onFocus = () => check();
    window.addEventListener('focus', onFocus);
    return () => { clearInterval(iv); window.removeEventListener('focus', onFocus); };
  }, [check]);

  // Bloqueado → tela cheia de bloqueio.
  if (state?.state === 'blocked') {
    const titulo =
      state.reason === 'blocked' ? 'Acesso suspenso'
      : state.reason === 'trial_expired' ? 'Seu período de teste terminou'
      : 'Assinatura vencida';
    const wa = `https://wa.me/${SUPORTE_WHATSAPP}?text=${encodeURIComponent(
      `Olá! Quero regularizar minha licença do SGA. ID: ${getLicenseId()}`
    )}`;
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md text-center space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
            <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{titulo}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Para continuar usando o sistema, regularize sua assinatura. Assim que o
            pagamento for confirmado, o acesso é liberado automaticamente.
          </p>
          <a href={wa} target="_blank" rel="noreferrer"
            className="inline-flex w-full items-center justify-center rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700">
            Falar com o suporte / Pagar
          </a>
          <button onClick={check} disabled={checking}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} /> Já paguei, verificar
          </button>
          <p className="text-[10px] text-slate-400 break-all">ID: {getLicenseId()}</p>
        </div>
      </div>
    );
  }

  // OK / aviso → renderiza o app (com banner de aviso se faltam ≤3 dias).
  return (
    <>
      {state?.state === 'warning' && !dismissed && (
        <div className="bg-yellow-50 border-b border-yellow-200 text-yellow-800 px-4 py-2 text-sm flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            {state.kind === 'trial'
              ? `Seu período de teste termina em ${state.days} dia(s).`
              : `Sua assinatura vence em ${state.days} dia(s).`}{' '}
            Renove para não interromper o atendimento.
          </span>
          <button onClick={() => setDismissed(true)} className="text-yellow-700 hover:text-yellow-900 text-xs font-medium">
            Fechar
          </button>
        </div>
      )}
      {children}
    </>
  );
}
