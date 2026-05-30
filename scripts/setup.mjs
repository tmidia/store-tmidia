#!/usr/bin/env node
/**
 * Assistente de instalação do SGA para uma loja nova.
 *
 * Fluxo:
 *   1. Pergunta as credenciais do projeto Supabase da loja.
 *   2. Aplica o schema mestre (supabase/schema.sql) → cria o banco zerado.
 *   3. (Opcional) Cria o primeiro usuário superadmin.
 *   4. Escreve o arquivo .env do app.
 *   5. Mostra os próximos passos (deploy / build).
 *
 * Uso:  npm run setup
 *
 * Pré-requisito: ter criado um projeto novo no Supabase (https://supabase.com).
 */
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const c = {
  reset: '\x1b[0m', bold: '\x1b[1m', green: '\x1b[32m',
  red: '\x1b[31m', yellow: '\x1b[33m', cyan: '\x1b[36m', gray: '\x1b[90m',
};
const log = (m) => console.log(m);
const ok = (m) => log(`${c.green}✓${c.reset} ${m}`);
const err = (m) => log(`${c.red}✗ ${m}${c.reset}`);
const step = (n, m) => log(`\n${c.bold}${c.cyan}[${n}] ${m}${c.reset}`);

const rl = createInterface({ input, output });
const ask = async (q, { required = true, def = '' } = {}) => {
  while (true) {
    const hint = def ? ` ${c.gray}(${def})${c.reset}` : '';
    const a = (await rl.question(`${q}${hint}: `)).trim();
    if (a) return a;
    if (def) return def;
    if (!required) return '';
    err('Esse campo é obrigatório.');
  }
};
const askYesNo = async (q, def = true) => {
  const a = (await rl.question(`${q} ${c.gray}(${def ? 'S/n' : 's/N'})${c.reset}: `)).trim().toLowerCase();
  if (!a) return def;
  return a === 's' || a === 'sim' || a === 'y' || a === 'yes';
};

async function main() {
  log(`${c.bold}\n=== Assistente de Instalação — SGA PDV ===${c.reset}`);
  log(`${c.gray}Configura uma loja nova num projeto Supabase próprio (dados zerados).${c.reset}`);

  const schemaPath = join(ROOT, 'supabase', 'schema.sql');
  if (!existsSync(schemaPath)) {
    err('Arquivo supabase/schema.sql não encontrado. Gere-o com o db dump antes de rodar o setup.');
    process.exit(1);
  }

  // ---------------------------------------------------------------------------
  step(1, 'Credenciais do projeto Supabase');
  log(`${c.gray}No painel do Supabase do projeto novo:${c.reset}`);
  log(`${c.gray}  - URL e chave anon: Settings → API${c.reset}`);
  log(`${c.gray}  - Connection string: botão Connect → Session pooler (porta 5432)${c.reset}\n`);

  const supabaseUrl = await ask('URL do Supabase (https://xxxx.supabase.co)');
  const anonKey = await ask('Chave anon / publishable (VITE)');
  const dbUrl = await ask('Connection string do Session pooler (postgresql://...:5432/postgres)');

  // ---------------------------------------------------------------------------
  step(2, 'Aplicando o schema mestre no banco');
  const schemaSql = readFileSync(schemaPath, 'utf8');
  const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    await client.query(schemaSql);
    ok('Schema aplicado (tabelas, enums, funções, RLS e triggers criados).');
  } catch (e) {
    err(`Falha ao aplicar o schema: ${e.message}`);
    log(`${c.yellow}Dica: rode o setup num projeto VAZIO. Se já tiver estrutura, limpe antes.${c.reset}`);
    await client.end().catch(() => {});
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }

  // ---------------------------------------------------------------------------
  step(3, 'Primeiro usuário (superadmin)');
  let adminCreated = false;
  if (await askYesNo('Quer criar o usuário superadmin agora?')) {
    log(`${c.gray}Precisa da Service Role key: Settings → API → service_role (secreta).${c.reset}`);
    const serviceKey = await ask('Service Role key');
    const adminEmail = await ask('E-mail do superadmin');
    const adminPass = await ask('Senha do superadmin (mín. 6 caracteres)');
    const adminName = await ask('Nome completo', { required: false, def: 'Administrador' });

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    try {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: adminEmail, password: adminPass, email_confirm: true,
        user_metadata: { full_name: adminName, user_type: 'superadmin' },
      });
      if (createErr) throw createErr;
      const uid = created.user.id;

      // O trigger cria profile + user_roles como 'vendedor'. Promovemos a superadmin.
      await admin.from('profiles').update({
        full_name: adminName, user_type: 'superadmin', is_active: true,
      }).eq('id', uid);
      await admin.from('user_roles').delete().eq('user_id', uid);
      await admin.from('user_roles').insert({ user_id: uid, role: 'superadmin' });

      ok(`Superadmin criado: ${adminEmail}`);
      adminCreated = true;
    } catch (e) {
      err(`Não foi possível criar o superadmin: ${e.message}`);
      log(`${c.yellow}Você pode criar manualmente depois pelo painel/sistema.${c.reset}`);
    }
  }

  // ---------------------------------------------------------------------------
  step(4, 'Gravando o arquivo .env');
  const envContent =
    `VITE_SUPABASE_URL="${supabaseUrl}"\n` +
    `VITE_SUPABASE_PUBLISHABLE_KEY="${anonKey}"\n`;
  writeFileSync(join(ROOT, '.env'), envContent, 'utf8');
  ok('.env criado.');

  // ---------------------------------------------------------------------------
  step(5, 'Pronto! Próximos passos');
  log(`${c.green}Banco configurado e zerado para a nova loja.${c.reset}\n`);
  log(`  ${c.bold}Web (Vercel):${c.reset}`);
  log(`    1. Crie um projeto na Vercel apontando para este repositório.`);
  log(`    2. Em Environment Variables, adicione VITE_SUPABASE_URL e`);
  log(`       VITE_SUPABASE_PUBLISHABLE_KEY (os mesmos do .env).`);
  log(`    3. Deploy.\n`);
  log(`  ${c.bold}Desktop (instalador .exe):${c.reset}`);
  log(`    npm install`);
  log(`    npm run build:installer   ${c.gray}# gera release/SGA - PDV-Setup.exe${c.reset}\n`);
  if (!adminCreated) {
    log(`  ${c.yellow}Lembre de criar o primeiro superadmin (pelo painel Supabase ou no sistema).${c.reset}\n`);
  }
  ok('Instalação concluída.');

  await rl.close();
}

main().catch((e) => { err(e.message); process.exit(1); });
