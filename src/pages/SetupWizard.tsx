import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ShoppingBag, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { saveSupabaseConfig, extractProjectRef } from '@/lib/runtimeConfig';
// Schema mestre embutido no app (gerado por `supabase db dump`).
import schemaSql from '../../supabase/schema.sql?raw';

const sqlEscape = (s: string) => s.replace(/'/g, "''");

// Executa SQL no projeto do cliente via função serverless (/api/provision).
async function runSql(accessToken: string, projectRef: string, query: string) {
  const res = await fetch('/api/provision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken, projectRef, query }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Erro ${res.status}`);
  return data;
}

const SetupWizard = () => {
  const [form, setForm] = useState({
    url: '',
    anonKey: '',
    accessToken: '',
    adminEmail: '',
    adminPassword: '',
    adminName: '',
  });
  const [busy, setBusy] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));
  const addLog = (m: string) => setLogs((l) => [...l, m]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLogs([]);
    setBusy(true);

    try {
      const url = form.url.trim().replace(/\/$/, '');
      const projectRef = extractProjectRef(url);
      if (!projectRef) throw new Error('URL do Supabase inválida (use https://xxxx.supabase.co).');
      if (!form.anonKey.trim()) throw new Error('Informe a chave anon.');
      if (!form.accessToken.trim()) throw new Error('Informe o token de acesso do Supabase.');
      if (form.adminPassword.length < 6) throw new Error('A senha do admin precisa ter ao menos 6 caracteres.');

      // 1. Cria a estrutura do banco
      addLog('Criando estrutura do banco (tabelas, segurança, funções)...');
      await runSql(form.accessToken.trim(), projectRef, schemaSql);
      addLog('✓ Banco criado.');

      // 2. Cria o usuário administrador
      addLog('Criando usuário administrador...');
      const tempClient = createClient(url, form.anonKey.trim(), {
        auth: { persistSession: false },
      });
      const { error: signUpError } = await tempClient.auth.signUp({
        email: form.adminEmail.trim(),
        password: form.adminPassword,
        options: { data: { full_name: form.adminName.trim() || 'Administrador', user_type: 'superadmin' } },
      });
      if (signUpError && !/already registered|already been registered/i.test(signUpError.message)) {
        throw new Error(`Falha ao criar admin: ${signUpError.message}`);
      }

      // 3. Confirma o e-mail e promove a superadmin
      const email = sqlEscape(form.adminEmail.trim());
      const name = sqlEscape(form.adminName.trim() || 'Administrador');
      await runSql(
        form.accessToken.trim(),
        projectRef,
        `
        UPDATE auth.users SET email_confirmed_at = COALESCE(email_confirmed_at, now())
          WHERE email = '${email}';
        UPDATE public.profiles SET user_type = 'superadmin', is_active = true, full_name = '${name}'
          WHERE id = (SELECT id FROM auth.users WHERE email = '${email}');
        DELETE FROM public.user_roles
          WHERE user_id = (SELECT id FROM auth.users WHERE email = '${email}');
        INSERT INTO public.user_roles (user_id, role)
          SELECT id, 'superadmin'::public.user_type FROM auth.users WHERE email = '${email}';
        `
      );
      addLog('✓ Administrador configurado.');

      // 4. Salva a configuração no navegador
      saveSupabaseConfig({ url, anonKey: form.anonKey.trim() });
      addLog('✓ Configuração salva.');
      setDone(true);

      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      setError(err?.message || 'Erro inesperado durante a configuração.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-sky-400 rounded-xl flex items-center justify-center shadow-lg">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Configuração do SGA</h1>
            <p className="text-sm text-slate-500">Conecte sua loja ao Supabase</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8">
          {done ? (
            <div className="text-center space-y-3 py-6">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
              <h2 className="text-xl font-semibold">Tudo pronto!</h2>
              <p className="text-sm text-slate-500">Entrando no sistema...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-slate-500">
                Pegue os dados no painel do seu projeto Supabase. As credenciais ficam salvas
                apenas neste navegador.
              </p>

              <div className="space-y-2">
                <Label htmlFor="url">URL do projeto <span className="text-slate-400">(Settings → API)</span></Label>
                <Input id="url" placeholder="https://xxxx.supabase.co" value={form.url} onChange={set('url')} disabled={busy} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="anonKey">Chave anon / publishable <span className="text-slate-400">(Settings → API)</span></Label>
                <Input id="anonKey" placeholder="eyJhbGci..." value={form.anonKey} onChange={set('anonKey')} disabled={busy} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accessToken">Token de acesso <span className="text-slate-400">(account/tokens)</span></Label>
                <Input id="accessToken" type="password" placeholder="sbp_..." value={form.accessToken} onChange={set('accessToken')} disabled={busy} />
                <p className="text-xs text-slate-400">Usado só agora para criar o banco. Não fica salvo.</p>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="adminName">Nome do administrador</Label>
                  <Input id="adminName" placeholder="Seu nome" value={form.adminName} onChange={set('adminName')} disabled={busy} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">E-mail (login)</Label>
                  <Input id="adminEmail" type="email" placeholder="voce@email.com" value={form.adminEmail} onChange={set('adminEmail')} disabled={busy} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Senha</Label>
                  <Input id="adminPassword" type="password" placeholder="mín. 6 caracteres" value={form.adminPassword} onChange={set('adminPassword')} disabled={busy} />
                </div>
              </div>

              {logs.length > 0 && (
                <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-3 text-xs space-y-1 text-slate-600 dark:text-slate-300">
                  {logs.map((l, i) => <div key={i}>{l}</div>)}
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Configurando...</>) : 'Configurar e entrar'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
