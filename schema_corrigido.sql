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
