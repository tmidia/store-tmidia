
-- Criar enum para tipos de usuário
CREATE TYPE public.user_type AS ENUM ('superadmin', 'gerente', 'vendedor', 'estoquista');

-- Criar enum para permissões de módulo
CREATE TYPE public.module_permission AS ENUM ('dashboard', 'pdv', 'produtos', 'estoque', 'financeiro', 'relatorios', 'fornecedores', 'configuracoes', 'usuarios');

-- Atualizar tabela profiles para incluir informações de usuário do sistema
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_type user_type DEFAULT 'vendedor',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE;

-- Criar tabela de permissões de usuário
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  module module_permission NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module)
);

-- Criar tabela de configurações da empresa
CREATE TABLE IF NOT EXISTS public.company_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  cnpj TEXT,
  logo_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de parâmetros do sistema
CREATE TABLE IF NOT EXISTS public.system_parameters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  show_dashboard_charts BOOLEAN DEFAULT true,
  enable_pdv BOOLEAN DEFAULT true,
  allow_manual_discount BOOLEAN DEFAULT true,
  show_low_stock_alert BOOLEAN DEFAULT true,
  show_due_accounts BOOLEAN DEFAULT true,
  show_daily_report BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de integrações
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  n8n_enabled BOOLEAN DEFAULT false,
  n8n_webhook_url TEXT,
  n8n_auth_token TEXT,
  make_enabled BOOLEAN DEFAULT false,
  make_webhook_url TEXT,
  make_auth_token TEXT,
  whatsapp_daily_sales BOOLEAN DEFAULT false,
  whatsapp_low_stock_alert BOOLEAN DEFAULT false,
  whatsapp_due_accounts BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Atualizar tabela suppliers com novos campos
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS cpf TEXT,
ADD COLUMN IF NOT EXISTS supplier_type TEXT DEFAULT 'fornecedor';

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_permissions (apenas superadmin)
CREATE POLICY "Superadmin can manage user permissions" ON public.user_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'superadmin'
    )
  );

-- Políticas RLS para company_settings (apenas superadmin)
CREATE POLICY "Superadmin can manage company settings" ON public.company_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'superadmin'
    )
  );

-- Políticas RLS para system_parameters (apenas superadmin)
CREATE POLICY "Superadmin can manage system parameters" ON public.system_parameters
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'superadmin'
    )
  );

-- Políticas RLS para integrations (apenas superadmin)
CREATE POLICY "Superadmin can manage integrations" ON public.integrations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'superadmin'
    )
  );

-- Triggers para atualizar updated_at
CREATE TRIGGER set_updated_at_company_settings
  BEFORE UPDATE ON public.company_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_system_parameters
  BEFORE UPDATE ON public.system_parameters
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_integrations
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Atualizar usuário atual para superadmin
UPDATE public.profiles 
SET user_type = 'superadmin', 
    full_name = 'T-Mídia Administrator'
WHERE username = 'tmidia';

-- Inserir permissões completas para o superadmin
INSERT INTO public.user_permissions (user_id, module)
SELECT p.id, unnest(ARRAY['dashboard', 'pdv', 'produtos', 'estoque', 'financeiro', 'relatorios', 'fornecedores', 'configuracoes', 'usuarios']::module_permission[])
FROM public.profiles p 
WHERE p.username = 'tmidia'
ON CONFLICT (user_id, module) DO NOTHING;

-- Inserir configurações padrão da empresa
INSERT INTO public.company_settings (company_name, phone) 
VALUES ('Sistema de Gestão - SGA', '(00) 0000-0000')
ON CONFLICT DO NOTHING;

-- Inserir parâmetros padrão do sistema
INSERT INTO public.system_parameters DEFAULT VALUES
ON CONFLICT DO NOTHING;

-- Inserir configurações padrão de integrações
INSERT INTO public.integrations DEFAULT VALUES
ON CONFLICT DO NOTHING;
