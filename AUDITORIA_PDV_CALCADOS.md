# AUDITORIA TÉCNICA — Sistema PDV Loja de Calçados e Acessórios
> **Documento destinado ao desenvolvedor/agente responsável pela continuidade do projeto**
> Gerado em: Abril/2026 | Projeto base: Lovable (https://lovable.dev/projects/765b82ba-fb7c-4fd7-a02b-b8c7ac456888)

---

## ÍNDICE

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Problemas Críticos Identificados](#3-problemas-críticos-identificados)
4. [Vulnerabilidades de Segurança](#4-vulnerabilidades-de-segurança)
5. [Problemas no Banco de Dados](#5-problemas-no-banco-de-dados)
6. [Schema Corrigido — SQL Completo](#6-schema-corrigido--sql-completo)
7. [Impressão Térmica — Solução Recomendada](#7-impressão-térmica--solução-recomendada)
8. [Checklist de Auditoria](#8-checklist-de-auditoria)
9. [Roteiro de Desenvolvimento Continuado](#9-roteiro-de-desenvolvimento-continuado)
10. [Variáveis de Ambiente (.env)](#10-variáveis-de-ambiente-env)
11. [Regras Gerais para Toda Alteração](#11-regras-gerais-para-toda-alteração)

---

## 1. Visão Geral do Projeto

**O que é:** Sistema de PDV (Ponto de Venda) para loja de calçados e acessórios, com gestão de estoque, financeiro, contas a pagar/receber e impressão em impressora térmica.

**Origem:** Gerado pela plataforma Lovable (IA geradora de código). O código é funcional como base, mas **não está pronto para produção** — contém falhas de segurança, schema incompleto e ausência de funcionalidades críticas para um PDV real.

**Repositório:** Disponível via GitHub (URL no README.md do projeto).

**Status atual:**
- Frontend: parcialmente construído, com erros visuais e funcionais
- Backend/BD: schema incompleto (faltam tabelas essenciais de vendas)
- Segurança: RLS genérico, sem isolamento de dados
- Impressão: não implementada

---

## 2. Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Frontend | React + TypeScript + Vite |
| Estilização | Tailwind CSS + shadcn/ui |
| Backend/BD | Supabase (PostgreSQL + Auth + Storage) |
| Deploy Frontend | Lovable (pode migrar para Vercel) |
| Impressão | **A implementar** — QZ Tray (ver Seção 7) |
| Autenticação | Supabase Auth (email/senha) |

---

## 3. Problemas Críticos Identificados

### 3.1 Sem tabela de Vendas — BLOQUEADOR TOTAL

O plano original do Lovable **não criou as tabelas `sales` e `sale_items`**. Isso significa que o PDV não tem onde registrar vendas com detalhamento. O `financial_transactions` sozinho não resolve — ele é para fluxo de caixa, não para itens de venda.

**Impacto:** O PDV não funciona de forma real sem essas tabelas.

### 3.2 Sem isolamento multi-estabelecimento

Nenhuma tabela principal possui `company_id`. Mesmo que hoje seja uso single-tenant, a ausência desse campo torna **impossível** escalar para múltiplas lojas no futuro e cria risco de vazamento de dados se houver mais de um usuário em contextos diferentes.

### 3.3 PDV no navegador vs. instalado

O PDV está rodando no browser. Isso **funciona** para a maioria das funções, mas tem limitações sérias para um comércio real:

- Impressoras térmicas (ESC/POS) **não são acessíveis diretamente pelo browser**
- Sem modo offline — se cair a internet, o caixa para
- Sem proteção de kiosk (operador pode fechar ou navegar para fora)

**Solução recomendada:** Manter o browser, mas instalar o **QZ Tray** localmente para ponte de impressão. Ver Seção 7.

### 3.4 Erros no Frontend

Os erros visuais/funcionais precisam ser mapeados abrindo o projeto localmente e inspecionando:
- Console do browser (F12) em busca de erros de runtime
- Chamadas ao Supabase que retornam erro por tabela inexistente ou RLS bloqueando
- Componentes com dados mockados que ainda não consomem o Supabase real

---

## 4. Vulnerabilidades de Segurança

### 🔴 CRÍTICO — Deve ser corrigido antes de ir para produção

#### 4.1 RLS Genérico (Row-Level Security)

O Lovable tende a gerar políticas RLS do tipo:

```sql
-- INSEGURO — dá acesso total a qualquer usuário autenticado
CREATE POLICY "Users can do everything"
ON products FOR ALL TO authenticated USING (true);
```

Isso significa que **qualquer usuário logado pode ler e alterar todos os dados do sistema**. Precisa ser revisado tabela por tabela.

**Como auditar:** No Supabase Dashboard → Authentication → Policies. Verificar cada política criada pelo Lovable.

**Correção mínima necessária:**
```sql
-- Somente usuários ativos podem acessar
CREATE POLICY "only_active_users"
ON products FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_active = true
  )
);
```

#### 4.2 Função `has_role()` — Verificar implementação

O plano menciona criar uma função `has_role()` com `SECURITY DEFINER`. Funções com essa flag rodam com permissões elevadas. Se o código aceitar parâmetros sem sanitização, pode ser explorado.

**Como auditar:** No Supabase → SQL Editor, executar:
```sql
SELECT prosrc FROM pg_proc WHERE proname = 'has_role';
```
Verificar se a função valida o input corretamente.

#### 4.3 Storage Bucket `logos` sem política

O bucket criado pelo Lovable provavelmente está configurado como público sem restrição de upload.

**Correção:**
```sql
-- No Supabase Dashboard → Storage → Policies
-- Permitir upload apenas para superadmin/gerente
CREATE POLICY "only_admins_upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'logos'
  AND has_role(auth.uid(), 'superadmin')
);
```

#### 4.4 Variáveis de ambiente expostas

A `SUPABASE_ANON_KEY` é pública por design e aparece no bundle do React — isso é **normal e esperado**. O que não pode acontecer é usar a `SERVICE_ROLE_KEY` no frontend. Verificar se o `.env` não tem:
```
VITE_SUPABASE_SERVICE_ROLE_KEY=...  ← NUNCA colocar isso no frontend
```

### 🟡 ALTO — Corrigir na próxima sprint

#### 4.5 Sem proteção de rota por perfil de usuário

Verificar se as rotas do React estão protegidas por tipo de usuário. Um vendedor não pode acessar o módulo financeiro. Um caixa não pode acessar configurações.

**Verificar em:** `src/routes/` ou equivalente — se não existe proteção por `user_type`, implementar.

#### 4.6 Sem log de auditoria

Operações críticas (abertura/fechamento de caixa, exclusão de produto, alteração de preço) precisam de registro de quem fez o quê e quando. Implementar tabela `audit_logs`.

---

## 5. Problemas no Banco de Dados

### 5.1 Tabelas faltando

| Tabela | Por que falta | Impacto |
|--------|--------------|---------|
| `sales` | Não estava no plano Lovable | PDV não registra vendas |
| `sale_items` | Não estava no plano Lovable | Sem detalhamento de itens vendidos |
| `customers` | Não estava no plano Lovable | Contas a receber sem cadastro real de cliente |
| `audit_logs` | Não estava no plano Lovable | Sem rastreabilidade de ações |

### 5.2 Campos faltando em tabelas existentes

| Tabela | Campo faltando | Motivo |
|--------|---------------|--------|
| `products` | `is_active` | Como desativar sem deletar? |
| `products` | `barcode` | Leitura de código de barras no PDV |
| `products` | `unit` (un, par, kit) | Unidade de venda |
| `cash_sessions` | `user_id` | Quem abriu o caixa? |
| `financial_transactions` | `type` como ENUM | Hoje é string livre — dado inconsistente |
| `accounts_payable` | FK para `financial_categories` | `category` é texto solto hoje |
| Todas | `company_id` | Isolamento multi-tenant |

### 5.3 Tipos incorretos

```sql
-- PROBLEMA: type como TEXT permite qualquer valor
financial_transactions.type TEXT

-- CORRETO: usar ENUM
CREATE TYPE transaction_type AS ENUM (
  'venda', 'sangria', 'suprimento', 'despesa', 'receita_avulsa'
);
```

---

## 6. Schema Corrigido — SQL Completo

> **INSTRUÇÃO:** Executar este SQL no Supabase → SQL Editor.
> Recriar o banco do zero (dropar e recriar) é mais seguro do que tentar migrar.
> Fazer backup dos dados existentes antes, se houver.

```sql
-- ============================================================
-- LIMPEZA (executar apenas se for recriar do zero)
-- ============================================================
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS sale_items CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS financial_transactions CASCADE;
DROP TABLE IF EXISTS accounts_payable CASCADE;
DROP TABLE IF EXISTS accounts_receivable CASCADE;
DROP TABLE IF EXISTS financial_categories CASCADE;
DROP TABLE IF EXISTS cash_sessions CASCADE;
DROP TABLE IF EXISTS product_variations CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS user_permissions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS company_settings CASCADE;
DROP TABLE IF EXISTS system_parameters CASCADE;

DROP TYPE IF EXISTS user_type CASCADE;
DROP TYPE IF EXISTS module_permission CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS payment_method_type CASCADE;
DROP TYPE IF EXISTS sale_status CASCADE;
DROP TYPE IF EXISTS session_status CASCADE;

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_type AS ENUM (
  'superadmin', 'gerente', 'vendedor', 'caixa'
);

CREATE TYPE module_permission AS ENUM (
  'dashboard', 'pdv', 'produtos', 'estoque', 'fornecedores',
  'categorias', 'financeiro', 'relatorios', 'configuracoes', 'usuarios'
);

CREATE TYPE transaction_type AS ENUM (
  'venda', 'sangria', 'suprimento', 'despesa', 'receita_avulsa', 'estorno'
);

CREATE TYPE payment_method_type AS ENUM (
  'dinheiro', 'cartao_credito', 'cartao_debito', 'pix',
  'transferencia', 'cheque', 'crediario', 'misto'
);

CREATE TYPE sale_status AS ENUM (
  'aberta', 'finalizada', 'cancelada', 'estornada'
);

CREATE TYPE session_status AS ENUM (
  'aberta', 'fechada'
);

-- ============================================================
-- TABELA: profiles
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT NOT NULL,
  user_type user_type NOT NULL DEFAULT 'vendedor',
  cpf TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABELA: user_permissions
-- ============================================================
CREATE TABLE user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module module_permission NOT NULL,
  can_view BOOLEAN NOT NULL DEFAULT false,
  can_create BOOLEAN NOT NULL DEFAULT false,
  can_edit BOOLEAN NOT NULL DEFAULT false,
  can_delete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, module)
);

ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABELA: company_settings
-- ============================================================
CREATE TABLE company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL DEFAULT 'Minha Loja',
  cnpj TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  logo_url TEXT,
  receipt_footer TEXT DEFAULT 'Obrigado pela preferência!',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABELA: system_parameters
-- ============================================================
CREATE TABLE system_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  show_dashboard_charts BOOLEAN NOT NULL DEFAULT true,
  enable_pdv BOOLEAN NOT NULL DEFAULT true,
  allow_manual_discount BOOLEAN NOT NULL DEFAULT true,
  max_discount_percent NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  show_low_stock_alert BOOLEAN NOT NULL DEFAULT true,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  show_due_accounts BOOLEAN NOT NULL DEFAULT true,
  show_daily_report BOOLEAN NOT NULL DEFAULT true,
  require_customer_on_sale BOOLEAN NOT NULL DEFAULT false,
  print_receipt_auto BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE system_parameters ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABELA: categories
-- ============================================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABELA: suppliers
-- ============================================================
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company_name TEXT,
  email TEXT,
  phone TEXT,
  cnpj TEXT,
  cpf TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  contact_person TEXT,
  supplier_type TEXT CHECK (supplier_type IN ('pessoa_fisica', 'pessoa_juridica')),
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABELA: products
-- ============================================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  barcode TEXT UNIQUE,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  unit TEXT NOT NULL DEFAULT 'par' CHECK (unit IN ('un', 'par', 'kit', 'cx', 'kg')),
  cost_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  sale_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  minimum_stock INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABELA: product_variations
-- ============================================================
CREATE TABLE product_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT UNIQUE,
  barcode TEXT UNIQUE,
  variation_name TEXT NOT NULL, -- ex: "Vermelho / 38"
  attributes JSONB DEFAULT '{}', -- ex: {"cor": "Vermelho", "tamanho": "38"}
  cost_price NUMERIC(10,2),
  sale_price NUMERIC(10,2),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  minimum_stock INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE product_variations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABELA: customers
-- ============================================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cpf TEXT UNIQUE,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  birth_date DATE,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABELA: cash_sessions
-- ============================================================
CREATE TABLE cash_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  opening_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  closing_amount NUMERIC(10,2),
  expected_amount NUMERIC(10,2),
  difference NUMERIC(10,2),
  status session_status NOT NULL DEFAULT 'aberta',
  notes TEXT,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE cash_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABELA: sales (CRÍTICA — estava faltando no plano original)
-- ============================================================
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_session_id UUID REFERENCES cash_sessions(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
  change_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method payment_method_type NOT NULL DEFAULT 'dinheiro',
  payment_details JSONB DEFAULT '{}', -- para pagamentos mistos ou parcelas
  status sale_status NOT NULL DEFAULT 'finalizada',
  notes TEXT,
  receipt_number SERIAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABELA: sale_items (CRÍTICA — estava faltando no plano original)
-- ============================================================
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  variation_id UUID REFERENCES product_variations(id),
  product_name TEXT NOT NULL, -- snapshot do nome na hora da venda
  variation_name TEXT,        -- snapshot da variação
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABELA: financial_categories
-- ============================================================
CREATE TABLE financial_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE financial_categories ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABELA: financial_transactions
-- ============================================================
CREATE TABLE financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type transaction_type NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  description TEXT NOT NULL,
  notes TEXT,
  reference_id UUID, -- ID da venda ou conta relacionada
  reference_type TEXT, -- 'sale', 'accounts_payable', 'accounts_receivable', 'manual'
  category_id UUID REFERENCES financial_categories(id) ON DELETE SET NULL,
  cash_session_id UUID REFERENCES cash_sessions(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABELA: accounts_payable
-- ============================================================
CREATE TABLE accounts_payable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  supplier_name TEXT NOT NULL, -- snapshot para caso fornecedor seja removido
  category_id UUID REFERENCES financial_categories(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  paid_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  remaining_amount NUMERIC(10,2) GENERATED ALWAYS AS (amount - paid_amount) STORED,
  due_date DATE NOT NULL,
  payment_date DATE,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago_parcial', 'pago', 'vencido', 'cancelado')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE accounts_payable ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABELA: accounts_receivable
-- ============================================================
CREATE TABLE accounts_receivable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_document TEXT,
  customer_phone TEXT,
  sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  paid_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  remaining_amount NUMERIC(10,2) GENERATED ALWAYS AS (amount - paid_amount) STORED,
  due_date DATE NOT NULL,
  payment_date DATE,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago_parcial', 'pago', 'vencido', 'cancelado')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE accounts_receivable ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABELA: audit_logs
-- ============================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout', 'open_cash', 'close_cash'
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- FUNÇÃO: has_role (SECURITY DEFINER seguro)
-- ============================================================
CREATE OR REPLACE FUNCTION has_role(user_id UUID, required_role user_type)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role user_type;
  role_hierarchy INTEGER;
  required_hierarchy INTEGER;
BEGIN
  -- Busca o tipo do usuário
  SELECT p.user_type INTO user_role
  FROM profiles p
  WHERE p.id = user_id AND p.is_active = true;

  IF user_role IS NULL THEN
    RETURN false;
  END IF;

  -- Hierarquia: superadmin > gerente > vendedor > caixa
  role_hierarchy := CASE user_role
    WHEN 'superadmin' THEN 4
    WHEN 'gerente' THEN 3
    WHEN 'vendedor' THEN 2
    WHEN 'caixa' THEN 1
    ELSE 0
  END;

  required_hierarchy := CASE required_role
    WHEN 'superadmin' THEN 4
    WHEN 'gerente' THEN 3
    WHEN 'vendedor' THEN 2
    WHEN 'caixa' THEN 1
    ELSE 0
  END;

  RETURN role_hierarchy >= required_hierarchy;
END;
$$;

-- ============================================================
-- FUNÇÃO: handle_new_user (trigger de auto-criação de perfil)
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, full_name, username, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'user_type')::user_type, 'vendedor')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- FUNÇÃO: update_stock_on_sale (trigger de baixa de estoque)
-- ============================================================
CREATE OR REPLACE FUNCTION update_stock_on_sale()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.variation_id IS NOT NULL THEN
    UPDATE product_variations
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE id = NEW.variation_id;
  ELSE
    UPDATE products
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_sale_item_inserted
  AFTER INSERT ON sale_items
  FOR EACH ROW EXECUTE FUNCTION update_stock_on_sale();

-- ============================================================
-- FUNÇÃO: restore_stock_on_cancel (trigger de estorno)
-- ============================================================
CREATE OR REPLACE FUNCTION restore_stock_on_cancel()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'cancelada' AND OLD.status != 'cancelada' THEN
    IF NEW.variation_id IS NOT NULL THEN
      UPDATE product_variations
      SET stock_quantity = stock_quantity + NEW.quantity
      WHERE id = NEW.variation_id;
    ELSE
      UPDATE products
      SET stock_quantity = stock_quantity + NEW.quantity
      WHERE id = NEW.product_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================================
-- POLÍTICAS RLS — profiles
-- ============================================================
CREATE POLICY "profiles_select_authenticated"
  ON profiles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_admin"
  ON profiles FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'gerente'));

-- ============================================================
-- POLÍTICAS RLS — tabelas gerais (apenas usuários ativos)
-- ============================================================
-- Aplicar este padrão em: categories, suppliers, products, product_variations,
-- customers, financial_categories

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'categories', 'suppliers', 'products', 'product_variations',
    'customers', 'financial_categories', 'company_settings', 'system_parameters'
  ]
  LOOP
    EXECUTE format('
      CREATE POLICY "active_users_select_%1$s"
        ON %1$s FOR SELECT TO authenticated
        USING (EXISTS (
          SELECT 1 FROM profiles WHERE id = auth.uid() AND is_active = true
        ));
      CREATE POLICY "manager_insert_%1$s"
        ON %1$s FOR INSERT TO authenticated
        WITH CHECK (has_role(auth.uid(), ''gerente''));
      CREATE POLICY "manager_update_%1$s"
        ON %1$s FOR UPDATE TO authenticated
        USING (has_role(auth.uid(), ''gerente''));
      CREATE POLICY "admin_delete_%1$s"
        ON %1$s FOR DELETE TO authenticated
        USING (has_role(auth.uid(), ''superadmin''));
    ', t);
  END LOOP;
END;
$$;

-- ============================================================
-- POLÍTICAS RLS — sales (vendedor pode criar, gerente pode tudo)
-- ============================================================
CREATE POLICY "active_users_select_sales"
  ON sales FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_active = true));

CREATE POLICY "vendedor_insert_sales"
  ON sales FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'vendedor'));

CREATE POLICY "manager_update_sales"
  ON sales FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'gerente'));

-- ============================================================
-- POLÍTICAS RLS — financeiro (apenas gerente e superadmin)
-- ============================================================
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'financial_transactions', 'accounts_payable', 'accounts_receivable'
  ]
  LOOP
    EXECUTE format('
      CREATE POLICY "manager_select_%1$s"
        ON %1$s FOR SELECT TO authenticated
        USING (has_role(auth.uid(), ''gerente''));
      CREATE POLICY "manager_insert_%1$s"
        ON %1$s FOR INSERT TO authenticated
        WITH CHECK (has_role(auth.uid(), ''gerente''));
      CREATE POLICY "manager_update_%1$s"
        ON %1$s FOR UPDATE TO authenticated
        USING (has_role(auth.uid(), ''gerente''));
      CREATE POLICY "admin_delete_%1$s"
        ON %1$s FOR DELETE TO authenticated
        USING (has_role(auth.uid(), ''superadmin''));
    ', t);
  END LOOP;
END;
$$;

-- ============================================================
-- POLÍTICAS RLS — audit_logs (somente leitura para admin)
-- ============================================================
CREATE POLICY "admin_select_audit_logs"
  ON audit_logs FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'superadmin'));

-- Sistema pode inserir via trigger (sem política de insert para usuário direto)

-- ============================================================
-- STORAGE: bucket logos
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "admin_upload_logos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'logos'
    AND has_role(auth.uid(), 'gerente')
  );

CREATE POLICY "authenticated_view_logos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'logos');

-- ============================================================
-- DADOS INICIAIS
-- ============================================================
INSERT INTO company_settings (company_name) VALUES ('Minha Loja de Calçados');
INSERT INTO system_parameters DEFAULT VALUES;

INSERT INTO financial_categories (name, type) VALUES
  ('Venda de Produtos', 'receita'),
  ('Receita Diversa', 'receita'),
  ('Fornecedores', 'despesa'),
  ('Aluguel', 'despesa'),
  ('Salários', 'despesa'),
  ('Marketing', 'despesa'),
  ('Despesas Operacionais', 'despesa');
```

---

## 7. Impressão Térmica — Solução Recomendada

### Problema

Impressoras térmicas (ESC/POS) usadas em PDV **não são acessíveis diretamente pelo navegador** por questões de segurança do browser. Não é possível abrir porta USB ou serial direto do React.

### Solução: QZ Tray

**QZ Tray** é um programa leve instalado localmente na máquina do caixa. Ele abre um WebSocket que o browser acessa para enviar comandos de impressão.

**Instalação:**
1. Baixar em https://qz.io/download/
2. Instalar na máquina do caixa (Windows, Mac ou Linux)
3. QZ Tray abre automaticamente com o sistema

**Integração no React:**

```bash
npm install qz-tray
```

```typescript
// src/lib/printer.ts
import qz from 'qz-tray';

export async function connectPrinter() {
  if (!qz.websocket.isActive()) {
    await qz.websocket.connect();
  }
}

export async function printReceipt(receiptData: ReceiptData) {
  await connectPrinter();

  const config = qz.configs.create('NOME_DA_IMPRESSORA_AQUI');

  const data = [
    '\x1B\x40',           // Reset
    '\x1B\x61\x01',       // Centralizar
    '\x1B\x21\x10',       // Fonte maior
    receiptData.companyName + '\n',
    '\x1B\x21\x00',       // Fonte normal
    receiptData.address + '\n',
    'CNPJ: ' + receiptData.cnpj + '\n',
    '--------------------------------\n',
    '\x1B\x61\x00',       // Alinhar esquerda
    'CUPOM NÃO FISCAL\n',
    `Data: ${receiptData.date}\n`,
    `Operador: ${receiptData.operator}\n`,
    '--------------------------------\n',
    ...receiptData.items.map(item =>
      `${item.quantity}x ${item.name.padEnd(20)} R$ ${item.total.toFixed(2)}\n`
    ),
    '--------------------------------\n',
    `TOTAL: R$ ${receiptData.total.toFixed(2)}\n`,
    `Pagamento: ${receiptData.paymentMethod}\n`,
    receiptData.change > 0 ? `Troco: R$ ${receiptData.change.toFixed(2)}\n` : '',
    '--------------------------------\n',
    '\x1B\x61\x01',       // Centralizar
    receiptData.footer + '\n',
    '\n\n\n',
    '\x1D\x56\x00',       // Cortar papel
  ];

  await qz.print(config, data);
}
```

**Configuração do nome da impressora:** Buscar do `system_parameters` ou `company_settings` no Supabase — adicionar campo `thermal_printer_name TEXT` na tabela `system_parameters`.

---

## 8. Checklist de Auditoria

Execute este checklist antes de liberar qualquer versão para produção:

### Banco de Dados
- [ ] Todas as 17 tabelas do schema corrigido foram criadas
- [ ] RLS está habilitado em TODAS as tabelas (verificar via `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`)
- [ ] Função `has_role()` está criada e testada
- [ ] Trigger `on_auth_user_created` está ativo
- [ ] Trigger `on_sale_item_inserted` (baixa de estoque) está ativo
- [ ] Dados iniciais foram inseridos (company_settings, system_parameters, financial_categories)
- [ ] Bucket `logos` criado com políticas corretas
- [ ] SERVICE_ROLE_KEY **não está** no `.env` do frontend

### Segurança
- [ ] Verificar todas as políticas RLS no dashboard do Supabase
- [ ] Testar acesso com usuário tipo `vendedor` — não deve ver financeiro
- [ ] Testar acesso com usuário tipo `caixa` — deve ver só PDV
- [ ] Verificar que rotas do React têm proteção por `user_type`
- [ ] Verificar que nenhuma chave secreta está hardcoded no código

### Frontend / Funcionalidades
- [ ] Login e logout funcionando
- [ ] Cadastro de produto com variações (tamanho/cor) funcionando
- [ ] PDV: adicionar produto por código de barras e por nome
- [ ] PDV: aplicar desconto manual
- [ ] PDV: fechar venda com diferentes formas de pagamento
- [ ] PDV: imprimir cupom (QZ Tray)
- [ ] Abertura e fechamento de caixa com conferência de valor
- [ ] Contas a pagar: cadastro, baixa parcial e total
- [ ] Contas a receber: cadastro, baixa parcial e total
- [ ] Relatório de vendas do dia
- [ ] Configurações da empresa (nome, CNPJ, logo, rodapé do cupom)

### Estoque
- [ ] Ao finalizar venda, estoque baixa automaticamente (trigger)
- [ ] Ao cancelar venda, estoque é restaurado
- [ ] Alerta de estoque mínimo funcionando

---

## 9. Roteiro de Desenvolvimento Continuado

### Fase 1 — Correções Críticas (Fazer Primeiro)
1. Recriar banco de dados com o SQL da Seção 6
2. Atualizar os types TypeScript do Supabase (`npx supabase gen types typescript`)
3. Corrigir todos os erros de console no frontend
4. Implementar proteção de rotas por `user_type`
5. Testar fluxo completo de venda (do PDV ao relatório)

### Fase 2 — Impressão e PDV Completo
1. Instalar e configurar QZ Tray
2. Implementar `src/lib/printer.ts` com layout do cupom
3. Configurar nome da impressora nas settings
4. Testar impressão em impressora térmica real (58mm ou 80mm)
5. Implementar leitura de código de barras (usar biblioteca `quagga2` ou input direto de leitor USB)

### Fase 3 — Funcionalidades Avançadas
1. Relatórios com gráficos (vendas por período, produtos mais vendidos)
2. Crediário próprio (ligado a `accounts_receivable`)
3. Exportação de relatórios para PDF
4. Backup automático de dados
5. Modo offline com sync posterior (PWA com Service Worker)

### Fase 4 — Melhorias de UX
1. Tema escuro/claro
2. Atalhos de teclado no PDV (F2 = novo cliente, F5 = finalizar, ESC = cancelar)
3. Dashboard com métricas em tempo real
4. Notificações de estoque baixo e contas vencendo

---

## 10. Variáveis de Ambiente (.env)

O arquivo `.env` na raiz do projeto deve conter:

```env
# Supabase — obrigatório
VITE_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui

# ATENÇÃO: Estas variáveis NÃO devem existir no .env do frontend
# NUNCA colocar no .env que vai para o browser:
# SUPABASE_SERVICE_ROLE_KEY=...  ← PROIBIDO no frontend
```

**Como obter as chaves:**
1. Acessar https://supabase.com/dashboard
2. Selecionar o projeto
3. Settings → API
4. Copiar `Project URL` e `anon public`

**O `.env` já deve estar no `.gitignore`** — confirmar que está antes de qualquer commit.

---

## 11. Regras Gerais para Toda Alteração

> Estas regras devem ser seguidas por qualquer desenvolvedor ou agente que der continuidade ao projeto.

1. **Nunca alterar o schema do banco sem atualizar os types TypeScript.** Após qualquer mudança no Supabase, rodar: `npx supabase gen types typescript --project-id SEU_PROJECT_ID > src/integrations/supabase/types.ts`

2. **Nunca usar `USING (true)` em política RLS.** Sempre verificar se o usuário está ativo e tem a role adequada.

3. **Nunca deletar registros de venda ou movimentação financeira.** Usar campos de status ('cancelada', 'estornada') — dados financeiros são auditáveis e devem ser imutáveis.

4. **Sempre fazer snapshot de nome/preço nos itens de venda.** Os campos `product_name` e `unit_price` em `sale_items` existem porque o produto pode ter o preço alterado no futuro — a venda deve refletir o valor cobrado na época.

5. **Toda operação crítica de caixa deve ser registrada em `audit_logs`.** Abertura, fechamento, sangria, suprimento e estorno.

6. **Testar em modo anônimo/incognito** para verificar que nenhuma rota está acessível sem autenticação.

7. **Não fazer deploy de versão com erros no console do browser.** Erros de tipo TypeScript e avisos críticos devem ser resolvidos antes de subir.

---

*Documento gerado para auditoria e continuidade do projeto PDV Calçados. Qualquer dúvida sobre decisões técnicas aqui documentadas, consultar o histórico de desenvolvimento do projeto.*
