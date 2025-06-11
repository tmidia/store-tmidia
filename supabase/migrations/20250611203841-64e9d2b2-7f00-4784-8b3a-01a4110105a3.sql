
-- Criar enum para tipos de movimentação financeira
CREATE TYPE public.transaction_type AS ENUM ('entrada', 'saida', 'abertura_caixa', 'fechamento_caixa', 'sangria', 'suprimento', 'venda', 'recebimento', 'pagamento');

-- Criar enum para status de contas
CREATE TYPE public.account_status AS ENUM ('pendente', 'pago', 'vencido', 'cancelado');

-- Criar tabela de movimentações financeiras
CREATE TABLE public.financial_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type transaction_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  reference_id UUID, -- Para referenciar vendas, contas, etc
  cash_balance DECIMAL(10,2), -- Saldo após a transação
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  transaction_date DATE DEFAULT CURRENT_DATE,
  notes TEXT
);

-- Criar tabela de sessões de caixa
CREATE TABLE public.cash_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  opening_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  closing_amount DECIMAL(10,2),
  expected_amount DECIMAL(10,2),
  difference DECIMAL(10,2),
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  notes TEXT
);

-- Criar tabela de contas a receber
CREATE TABLE public.accounts_receivable (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_document TEXT,
  customer_phone TEXT,
  amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  remaining_amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  issue_date DATE DEFAULT CURRENT_DATE,
  status account_status DEFAULT 'pendente',
  description TEXT,
  payment_method TEXT,
  reference_id UUID, -- Para referenciar vendas
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de contas a pagar
CREATE TABLE public.accounts_payable (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  supplier_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  remaining_amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  issue_date DATE DEFAULT CURRENT_DATE,
  status account_status DEFAULT 'pendente',
  description TEXT,
  payment_method TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de categorias financeiras
CREATE TABLE public.financial_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa')),
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_payable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_categories ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (usuários autenticados podem ver todos os dados)
CREATE POLICY "Authenticated users can manage financial transactions" ON public.financial_transactions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage cash sessions" ON public.cash_sessions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage accounts receivable" ON public.accounts_receivable
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage accounts payable" ON public.accounts_payable
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage financial categories" ON public.financial_categories
  FOR ALL USING (auth.role() = 'authenticated');

-- Triggers para atualizar updated_at
CREATE TRIGGER set_updated_at_accounts_receivable
  BEFORE UPDATE ON public.accounts_receivable
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_accounts_payable
  BEFORE UPDATE ON public.accounts_payable
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_financial_categories
  BEFORE UPDATE ON public.financial_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Inserir categorias financeiras padrão
INSERT INTO public.financial_categories (name, type, description, color) VALUES
  ('Vendas', 'receita', 'Receitas provenientes de vendas', '#10B981'),
  ('Serviços', 'receita', 'Receitas de prestação de serviços', '#06B6D4'),
  ('Outras Receitas', 'receita', 'Outras fontes de receita', '#8B5CF6'),
  ('Fornecedores', 'despesa', 'Pagamentos a fornecedores', '#EF4444'),
  ('Salários', 'despesa', 'Folha de pagamento', '#F59E0B'),
  ('Aluguel', 'despesa', 'Aluguel e taxas prediais', '#6B7280'),
  ('Energia Elétrica', 'despesa', 'Conta de energia elétrica', '#FBBF24'),
  ('Telefone/Internet', 'despesa', 'Telecomunicações', '#3B82F6'),
  ('Marketing', 'despesa', 'Investimentos em marketing', '#EC4899'),
  ('Outras Despesas', 'despesa', 'Outras despesas operacionais', '#6B7280')
ON CONFLICT (name) DO NOTHING;
