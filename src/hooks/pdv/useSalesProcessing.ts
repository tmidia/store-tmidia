
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CartItem, SaleData } from './types';

export const useSalesProcessing = () => {
  const finalizarVenda = async (
    dadosVenda: SaleData,
    carrinho: CartItem[],
    caixaAberto: boolean,
    sessionId: string | null,
    onSuccess: () => void
  ) => {
    if (!caixaAberto) {
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
      // Registrar a venda na tabela financial_transactions
      const { error } = await supabase
        .from('financial_transactions')
        .insert({
          type: 'venda',
          amount: dadosVenda.total,
          description: `Venda - ${dadosVenda.formaPagamento} - ${carrinho.length} item(s)`,
          reference_id: sessionId, // Vincular à sessão de caixa
          notes: JSON.stringify({
            forma_pagamento: dadosVenda.formaPagamento,
            valor_recebido: dadosVenda.valorRecebido,
            troco: dadosVenda.troco,
            desconto: dadosVenda.desconto,
            subtotal: dadosVenda.subtotal,
            session_id: sessionId,
            items: carrinho.map(item => ({
              nome: item.nome,
              codigo: item.codigo,
              quantidade: item.quantidade,
              preco: item.preco
            }))
          }),
          transaction_date: new Date().toISOString().split('T')[0]
        });

      if (error) {
        console.error('Erro ao registrar venda:', error);
        toast({
          title: "Erro ao registrar venda",
          description: "A venda foi processada, mas houve erro no registro.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Venda finalizada!",
          description: `Total: R$ ${dadosVenda.total.toFixed(2)}`,
        });
      }

      onSuccess();

    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      toast({
        title: "Erro ao finalizar venda",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return {
    finalizarVenda
  };
};
