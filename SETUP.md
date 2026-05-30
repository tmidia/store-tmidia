# 🏪 Instalação de uma loja nova (SGA PDV)

Guia para colocar o sistema no ar para **uma loja**, com **banco próprio e zerado**
(dados totalmente isolados de outras lojas).

> Cada loja = um projeto Supabase próprio. Assim nenhuma loja vê os dados de outra.

---

## Pré-requisitos (uma vez por máquina)
- [Node.js](https://nodejs.org) instalado (versão 18+).
- Conta no [Supabase](https://supabase.com) (grátis) e na [Vercel](https://vercel.com) (grátis).
- O código do projeto (clone/cópia deste repositório).

---

## Passo 1 — Criar o projeto Supabase da loja
1. Acesse https://supabase.com → **New project**.
2. Dê um nome (ex.: `loja-tenis`), defina uma **senha do banco** (guarde-a) e a região.
3. Aguarde o projeto provisionar.

## Passo 2 — Rodar o assistente
No terminal, dentro da pasta do projeto:

```bash
npm install
npm run setup
```

O assistente vai pedir (tudo no painel do Supabase do projeto novo):
- **URL** e **chave anon** → `Settings → API`
- **Connection string (Session pooler)** → botão **Connect → Session pooler** (porta 5432),
  trocando `[YOUR-PASSWORD]` pela senha do banco do Passo 1
- (opcional) criar o **superadmin** → precisa da **Service Role key** (`Settings → API`)

Ele então:
1. cria todas as tabelas, regras de segurança (RLS), funções e gatilhos — **banco zerado**;
2. cria o primeiro usuário superadmin (se você quiser);
3. grava o arquivo `.env` do app.

## Passo 3 — Publicar na web (Vercel)
1. Na Vercel: **Add New → Project** → importe este repositório.
2. Em **Environment Variables**, adicione (os mesmos valores do `.env`):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
3. **Deploy**. Pronto — a loja está no ar.

## Passo 4 — Gerar o instalador desktop (opcional)
Para o PDV instalado no caixa (com impressão térmica):

```bash
npm run build:installer
```

O instalador sai em `release/SGA - PDV-Setup-1.0.0.exe`. Envie esse `.exe` para o cliente.

> O `.exe` carrega as credenciais embutidas, então **gere um por loja** (após rodar o setup daquela loja).

---

## Observações importantes
- **Internet:** esta versão usa o banco na nuvem; precisa de internet para funcionar.
- **Senha do banco:** nunca compartilhe a connection string com a senha. O `.env` guarda só a chave anon (pública por design).
- **Custo Supabase:** o plano free dá 2 projetos por organização e pausa projetos inativos por ~1 semana. Para lojas em produção, considere o plano Pro.
- **Atualizações:** ao mudar o código, rode `npm run build:installer` de novo e reenvie o `.exe`.
