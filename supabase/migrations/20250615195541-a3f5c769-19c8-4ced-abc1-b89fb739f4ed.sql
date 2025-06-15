
-- Deletar todas as transações de venda do dia 15/06/2025
DELETE FROM financial_transactions 
WHERE transaction_date = '2025-06-15' 
AND type = 'venda';

-- Deletar também transações que possam ter descrição contendo 'venda' no mesmo período
DELETE FROM financial_transactions 
WHERE transaction_date = '2025-06-15' 
AND description ILIKE '%venda%';
