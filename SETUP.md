# 🏪 Instalação de uma loja nova (SGA PDV)

Cada loja usa um **projeto Supabase próprio** (banco isolado e zerado), então
nenhuma loja enxerga os dados de outra.

Há **duas formas** de configurar. A recomendada é pelo **assistente no navegador**.

---

## ✅ Forma 1 — Assistente no navegador (recomendado)

Sem terminal, sem mexer em arquivo.

1. **Crie um projeto Supabase** para a loja: https://supabase.com → *New project*
   (defina e guarde a senha do banco).
2. **Publique este app na Vercel** (sem precisar configurar variáveis):
   - Faça *fork* / *Use this template* deste repositório, ou use o botão abaixo.

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tmidia/store-tmidia)

3. **Abra o link** que a Vercel gerou. Vai aparecer a **tela de configuração**.
4. Cole os dados do Supabase (todos no painel do projeto novo):
   - **URL do projeto** e **chave anon** → `Settings → API`
   - **Token de acesso** → https://supabase.com/dashboard/account/tokens (*Generate new token*)
   - **E-mail e senha** do administrador da loja
5. Clique em **Configurar e entrar**. O sistema cria o banco sozinho, cria o
   admin e já entra funcionando. 🎉

> O token de acesso é usado **só nessa hora** para criar o banco e **não fica salvo**.
> As credenciais da loja ficam salvas no navegador deste computador.

---

## 🛠️ Forma 2 — Assistente pelo terminal (alternativa)

Se preferir configurar pela máquina:

```bash
npm install
npm run setup
```

Ele pede as credenciais, aplica o schema, cria o admin e grava o `.env`.

---

## 💻 Instalador desktop (PDV no caixa, com impressão térmica)

O instalador `.exe` precisa ser **gerado por loja** (as credenciais ficam embutidas):

```bash
npm run setup            # configura o .env para a loja desejada
npm run build:installer  # gera release/SGA - PDV-Setup-1.0.0.exe
```

Envie o `.exe` para o cliente. Ao abrir o `.exe`, o cliente verá o aviso do
SmartScreen (app não assinado) → **Mais informações → Executar assim mesmo**.

---

## Observações
- **Internet:** esta versão usa o banco na nuvem; precisa de internet.
- **Custo Supabase:** o plano free dá 2 projetos por organização e pausa
  projetos inativos por ~1 semana. Para produção, considere o plano Pro.
- **Reconfigurar:** para trocar de loja no navegador, limpe os dados do site
  (localStorage) e o assistente aparece de novo.
