
# Plano: Criar todo o Banco de Dados do Projeto

Este plano cria todas as tabelas, enums, triggers, funcoes e politicas de seguranca necessarias para o sistema de PDV/loja funcionar completamente.

---

## Resumo das Tabelas a Criar

| Tabela | Descricao |
|--------|-----------|
| **profiles** | Perfis de usuarios (vinculados a autenticacao) |
| **user_permissions** | Permissoes de acesso por modulo |
| **categories** | Categorias e subcategorias de produtos |
| **suppliers** | Fornecedores |
| **products** | Produtos |
| **product_variations** | Variacoes de produtos (tamanho, cor, etc.) |
| **cash_sessions** | Sessoes de caixa (abertura/fechamento) |
| **financial_transactions** | Transacoes financeiras (vendas, sangrias, etc.) |
| **accounts_payable** | Contas a pagar |
| **accounts_receivable** | Contas a receber |
| **financial_categories** | Categorias financeiras (receita/despesa) |
| **company_settings** | Configuracoes da empresa |
| **system_parameters** | Parametros do sistema |

---

## O que sera feito

### 1. Criar Enums
- `user_type`: superadmin, gerente, vendedor, caixa
- `module_permission`: dashboard, pdv, produtos, estoque, fornecedores, categorias, financeiro, relatorios, configuracoes, usuarios

### 2. Criar todas as 13 tabelas
Cada tabela sera criada com os campos necessarios conforme o codigo existente, com valores default e tipos corretos.

### 3. Habilitar RLS em todas as tabelas
Todas as tabelas terao Row-Level Security ativado para proteger os dados.

### 4. Criar Politicas de Seguranca (RLS)
- Usuarios autenticados poderao ler e manipular dados
- Profiles: usuarios podem ver todos os perfis mas so editar o proprio
- Permissoes: somente leitura para usuarios comuns

### 5. Criar Trigger para auto-criacao de perfil
Quando um usuario se cadastra, o perfil e criado automaticamente.

### 6. Criar funcao `has_role` para seguranca
Funcao SECURITY DEFINER para verificar roles sem recursao.

### 7. Criar Storage Bucket
- Bucket `logos` para upload de logos da empresa

---

## Detalhes Tecnicos

A migracao SQL sera executada em uma unica operacao contendo:

```text
1. CREATE TYPE user_type (superadmin, gerente, vendedor, caixa)
2. CREATE TYPE module_permission (10 modulos)
3. CREATE TABLE profiles (id, username, full_name, user_type, cpf, avatar_url, is_active, timestamps)
4. CREATE TABLE user_permissions (id, user_id, module, timestamps)
5. CREATE TABLE categories (id, name, description, parent_id, timestamps)
6. CREATE TABLE suppliers (id, name, email, phone, cnpj, cpf, address, city, state, zip_code, contact_person, supplier_type, company_name, timestamps)
7. CREATE TABLE products (id, name, code, description, category_id, subcategory_id, supplier_id, cost_price, sale_price, stock_quantity, minimum_stock, timestamps)
8. CREATE TABLE product_variations (id, product_id, sku, variation_name, attributes, cost_price, sale_price, stock_quantity, minimum_stock, is_active, timestamps)
9. CREATE TABLE cash_sessions (id, opening_amount, closing_amount, expected_amount, difference, status, closed_at, timestamps)
10. CREATE TABLE financial_transactions (id, type, amount, description, notes, reference_id, user_id, transaction_date, timestamps)
11. CREATE TABLE accounts_payable (id, supplier_id, supplier_name, amount, paid_amount, remaining_amount, due_date, description, category, status, timestamps)
12. CREATE TABLE accounts_receivable (id, customer_name, customer_document, customer_phone, amount, paid_amount, remaining_amount, due_date, description, status, timestamps)
13. CREATE TABLE financial_categories (id, name, type, timestamps)
14. CREATE TABLE company_settings (id, company_name, cnpj, phone, logo_url, timestamps)
15. CREATE TABLE system_parameters (id, show_dashboard_charts, enable_pdv, allow_manual_discount, show_low_stock_alert, show_due_accounts, show_daily_report, timestamps)
16. Funcao has_role() com SECURITY DEFINER
17. Trigger handle_new_user para auto-criar perfil
18. Politicas RLS para todas as tabelas
19. Storage bucket "logos"
```

Apos a criacao do banco, o sistema estara pronto para:
- Login e cadastro de usuarios
- Cadastro de categorias, produtos e fornecedores
- Operacao do PDV (abertura/fechamento de caixa, vendas)
- Gestao financeira (contas a pagar/receber, fluxo de caixa)
- Configuracoes da empresa e parametros do sistema
