import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CartItem, SaleData } from './types';
import type { Database } from '@/integrations/supabase/types';

export const useSalesProcessing = () => {
  const finalizarVenda = async (
    dadosVenda: SaleData,
    carrinho: CartItem[],
    caixaAberto: boolean,
    sessionId: string | null,
    onSuccess: () => void
  ) => {
    if (!caixaAberto || !sessionId) {
      toast({
        title: "Caixa fechado",
        description: "Abra o caixa para realizar vendas.",
        variant: "destructive",
      });
      return;
    }

    if (carrinho.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos para finalizar a venda.",
        variant: "destructive",
      });
      return;
    }

    if (!dadosVenda.formaPagamento) {
      toast({
        title: "Forma de pagamento",
        description: "Selecione a forma de pagamento.",
        variant: "destructive",
      });
      return;
    }

    if (dadosVenda.formaPagamento === 'dinheiro' && (!dadosVenda.valorRecebido || parseFloat(dadosVenda.valorRecebido) < dadosVenda.total)) {
      toast({
        title: "Valor insuficiente",
        description: "O valor recebido é menor que o total da compra.",
        variant: "destructive",
      });
      return;
    }

    try {
      // 1. Identificar o usuário logado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      // 2. Inserir a Venda na tabela 'sales'
      const paymentMethodSafe = dadosVenda.formaPagamento as Database['public']['Enums']['payment_method_type'];
      
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert({
          user_id: user.id,
          cash_session_id: sessionId,
          subtotal: dadosVenda.subtotal,
          discount_amount: dadosVenda.valorDesconto,
          discount_percent: dadosVenda.desconto,
          total_amount: dadosVenda.total,
          amount_paid: parseFloat(dadosVenda.valorRecebido || dadosVenda.total.toString()),
          change_amount: dadosVenda.troco || 0,
          payment_method: paymentMethodSafe,
          status: 'finalizada'
        })
        .select()
        .single();

      if (saleError || !saleData) {
        console.error('Erro ao criar a venda:', saleError);
        throw new Error('Falha ao registrar cabeçalho da venda no banco.');
      }

      // 3. Inserir os itens na tabela 'sale_items'
      const saleItemsToInsert = carrinho.map(item => ({
        sale_id: saleData.id,
        product_id: item.product_id,
        variation_id: item.variation_id || null,
        product_name: item.nome,
        variation_name: item.variation_name || null,
        quantity: item.quantidade,
        unit_price: item.preco,
        total_price: item.preco * item.quantidade,
        discount_amount: 0 // Individual discounts could be tracked here if available
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItemsToInsert);

      if (itemsError) {
        console.error('Erro ao inserir itens da venda:', itemsError);
        throw new Error('Falha ao registrar itens da venda no banco.');
      }

      // 4. Registrar a transação financeira para o fechamento de caixa
      const { error: finError } = await supabase
        .from('financial_transactions')
        .insert({
          type: 'venda',
          amount: dadosVenda.total,
          description: `Venda - ${dadosVenda.formaPagamento} - ${carrinho.length} item(s)`,
          reference_id: saleData.id, // Agora referenciamos a venda real recém-criada
          cash_session_id: sessionId,
          user_id: user.id,
          notes: JSON.stringify({
            forma_pagamento: dadosVenda.formaPagamento,
            valor_recebido: dadosVenda.valorRecebido,
            troco: dadosVenda.troco,
            desconto: dadosVenda.desconto,
            subtotal: dadosVenda.subtotal,
            sale_id: saleData.id // guardamos também no json para debug
          }),
          transaction_date: new Date().toISOString().split('T')[0]
        });

      if (finError) {
        console.error('Erro ao registrar transação financeira:', finError);
        // Não jogamos erro mortal aqui para não cancelar o flow da UI, pois sale e items já foram salvos
      }

      toast({
        title: "Venda finalizada!",
        description: `Venda nº ${saleData.receipt_number || saleData.id.split('-')[0]} - Total: R$ ${dadosVenda.total.toFixed(2)}`,
      });

      const receiptData = {
        numeroVenda: (saleData.receipt_number || saleData.id.split('-')[0]).toString(),
        dataVenda: new Date(),
        items: carrinho.map(c => ({
          id: c.id,
          nome: c.nome,
          codigo: c.code || c.codigo,
          quantidade: c.quantidade,
          preco: c.preco
        })),
        subtotal: dadosVenda.subtotal,
        desconto: dadosVenda.desconto,
        valorDesconto: dadosVenda.valorDesconto,
        total: dadosVenda.total,
        formaPagamento: dadosVenda.formaPagamento,
        valorRecebido: dadosVenda.valorRecebido || dadosVenda.total.toString(),
        troco: dadosVenda.troco || 0,
      };

      onSuccess(receiptData);

    } catch (error: any) {
      console.error('Erro ao finalizar venda:', error);
      toast({
        title: "Erro ao finalizar venda",
        description: error.message || "Ocorreu um erro no servidor. Verifique sua conexão.",
        variant: "destructive",
      });
    }
  };

  return {
    finalizarVenda
  };
};
