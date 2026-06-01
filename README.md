# SGA — Sistema de Gestão e PDV

> Sistema completo de gestão para lojas: ponto de venda (PDV) com impressão de cupom,
> controle de estoque, financeiro, relatórios e equipe — tudo no navegador ou instalado no caixa.

![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-Desktop-47848F?logo=electron&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)

<!--
  📸 Telas do sistema:
  Salve um print real (ex.: o Dashboard ou o PDV) em docs/dashboard.png
  e descomente a linha abaixo para ele aparecer aqui no topo:

  ![SGA - Dashboard](docs/dashboard.png)
-->

---

## Índice
- [Sobre](#sobre)
- [Telas](#telas)
- [Por que escolher o SGA?](#por-que-escolher-o-sga)
- [O que você pode fazer](#o-que-você-pode-fazer)
- [Instalação Rápida](#instalação-rápida)
- [Primeiros Passos](#primeiros-passos)
- [App Desktop (Caixa)](#app-desktop-caixa)
- [Tecnologias](#tecnologias)
- [Suporte](#suporte)

---

## Sobre
O **SGA** é um sistema de gestão e ponto de venda para lojas (calçados, acessórios, variedades).
Cada loja roda no **seu próprio banco de dados** (Supabase), com os dados totalmente isolados.
Você pode usá-lo direto no **navegador** ou instalar o **aplicativo de caixa** no Windows,
com impressão de cupom na impressora térmica.

## Telas
> Para exibir prints reais aqui: salve as imagens na pasta [`docs/`](docs/) (ex.: `docs/dashboard.png`,
> `docs/pdv.png`) e referencie com `![Dashboard](docs/dashboard.png)`. Veja [docs/README.md](docs/README.md).

## Por que escolher o SGA?
- **Instalação em minutos:** deploy na Vercel + assistente que configura tudo sozinho.
- **PDV completo:** venda rápida, formas de pagamento, cupom impresso (ESC/POS).
- **Gestão de verdade:** produtos, estoque, fornecedores, financeiro e relatórios.
- **Controle de equipe:** papéis (superadmin, gerente, vendedor, caixa) com permissões.
- **Dados isolados:** cada loja tem o próprio banco — nenhuma loja vê dados de outra.
- **App de caixa:** versão instalável (Windows) com impressão térmica integrada.

## O que você pode fazer

**Ponto de Venda (PDV)**
- Vender por código de barras ou busca por nome
- Formas de pagamento e troco
- Abertura/fechamento de caixa e sangria
- Impressão de cupom não-fiscal (impressora térmica ESC/POS)

**Produtos e Estoque**
- Cadastro de produtos, categorias e variações
- Controle de estoque e alerta de estoque baixo
- Fornecedores

**Financeiro**
- Contas a pagar e a receber
- Fluxo de caixa e transações
- Despesas e categorias financeiras

**Relatórios**
- Vendas por período
- Financeiro
- Estoque

**Equipe**
- Usuários com papéis e permissões por módulo

---

## Instalação Rápida

Você cria um projeto Supabase (grátis), publica na Vercel e o **assistente configura o banco
sozinho**. Sem precisar rodar comando nenhum.

### 1. Crie o banco da loja
- Acesse [supabase.com](https://supabase.com) → **New project** (guarde a senha do banco).

### 2. Publique na Vercel
Faça **fork** / **Use this template** deste repositório e conecte na Vercel, ou clique:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tmidia/store-tmidia)

> Pode publicar **sem configurar variáveis** — o assistente faz isso pelo navegador.

### 3. Abra o link e configure
Ao abrir a URL pela primeira vez, aparece a **tela de configuração**. Informe:
- **URL** e **chave anon** do projeto → `Settings → API`
- **Token de acesso** → [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)
- **E-mail e senha** do administrador

Clique em **Configurar e entrar**. O sistema cria todas as tabelas, o usuário admin e já entra
funcionando. 🎉

> Em outros computadores da mesma loja, use o link **"Já tenho o banco — só conectar"** no
> assistente (informa só a URL + chave anon).

---

## Primeiros Passos
1. Faça login com o administrador criado no assistente.
2. Cadastre **categorias**, **fornecedores** e **produtos**.
3. Crie os **usuários** da equipe (Usuários) com os papéis adequados.
4. Abra o **PDV**, faça uma venda de teste e confira a impressão do cupom.

---

## App Desktop (Caixa)
Para o caixa com impressora térmica, gere o instalador Windows:

```bash
npm install
npm run setup            # configura o .env da loja
npm run build:installer  # gera release/SGA - PDV-Setup-1.0.0.exe
```

Envie o `.exe` ao cliente. Por ser um app não assinado, ao abrir aparece o aviso do SmartScreen
→ **Mais informações → Executar assim mesmo**.

> Veja o passo-a-passo completo em [SETUP.md](SETUP.md).

---

## Tecnologias
- **Vite** + **React** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Supabase** (banco, autenticação, RLS)
- **Electron** (app desktop + impressão ESC/POS)

---

## Suporte
Dúvidas ou problemas na instalação? Entre em contato com a **T-Mídia**.

---

<sub>© T-Mídia — SGA PDV</sub>
