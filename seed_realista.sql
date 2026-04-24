-- Limpando os dados anteriores para garantir que os testes entrem bonitinho sem lixo
-- (Se você já tiver dados valiosos em Fornecedores não rode a parte de DELETE)
DELETE FROM products;
DELETE FROM categories;
DELETE FROM suppliers;

-- Utilizando CTEs (Expressões Comuns de Tabela) para gerar e capturar os IDs de Categorias e Fornecedores
WITH
  -- 1. Inserindo Categorias Padrão
  ins_cat_esporte AS (INSERT INTO categories (name, description) VALUES ('Calçado Esportivo', 'Tênis de corrida, caminhada e quadra') RETURNING id),
  ins_cat_casual AS (INSERT INTO categories (name, description) VALUES ('Calçado Casual', 'Sapatilhas, Sandálias, Saltos e Botas') RETURNING id),
  ins_cat_dia_a_dia AS (INSERT INTO categories (name, description) VALUES ('Uso Diário', 'Chinelos e pantufas') RETURNING id),
  ins_cat_acessorios AS (INSERT INTO categories (name, description) VALUES ('Acessórios', 'Meias, cadarços, palmilhas') RETURNING id),
  
  -- 2. Inserindo Fornecedores Reais (marcas)
  ins_sup_nike AS (INSERT INTO suppliers (name, company_name, cnpj) VALUES ('Fábrica Nike', 'Nike do Brasil LTDA', '00.000.000/0001-00') RETURNING id),
  ins_sup_alpargatas AS (INSERT INTO suppliers (name, company_name, cnpj) VALUES ('Alpargatas S/A', 'Havaianas Oficial', '11.111.111/0001-11') RETURNING id),
  ins_sup_vizzano AS (INSERT INTO suppliers (name, company_name) VALUES ('Distribuidora Beira-Rio', 'Vizzano/Moleca S/A') RETURNING id)
  
-- 3. Finalmente Inserindo Produtos Corretamente Encadeados
INSERT INTO products (name, code, description, sale_price, cost_price, minimum_stock, stock_quantity, category_id, supplier_id)
VALUES 
(
  'Tênis Nike Revolution 6 Flex', '789123456001', 'Tênis esportivo caminhada leve masculino.', 
  349.90, 180.00, 5, 12, 
  (SELECT id FROM ins_cat_esporte), (SELECT id FROM ins_sup_nike)
),
(
  'Sapatilha Moleca Vintage', '789123456002', 'Sapatilha feminina preta bico redondo.', 
  69.90, 30.00, 10, 25, 
  (SELECT id FROM ins_cat_casual), (SELECT id FROM ins_sup_vizzano)
),
(
  'Chinelo Havaianas Tradicional', '789123456003', 'Chinelo Havaianas unissex azul marinho.', 
  39.90, 15.00, 20, 50, 
  (SELECT id FROM ins_cat_dia_a_dia), (SELECT id FROM ins_sup_alpargatas)
),
(
  'Bota Coturno Tratorada Feminina', '789123456004', 'Bota coturno Fashion tratorada couro sintético preto.', 
  219.90, 95.00, 4, 8, 
  (SELECT id FROM ins_cat_casual), (SELECT id FROM ins_sup_vizzano)
),
(
  'Sandália Vizzano Salto Fino', '789123456005', 'Sandália salto fino Vizzano festa dourada.', 
  159.90, 70.00, 3, 15, 
  (SELECT id FROM ins_cat_casual), (SELECT id FROM ins_sup_vizzano)
),
(
  'Kit Meia Cano Curto (3 Pares)', '789123456006', 'Meia cano curto algodão sortida.', 
  29.90, 12.00, 10, 30, 
  (SELECT id FROM ins_cat_acessorios), NULL
);
