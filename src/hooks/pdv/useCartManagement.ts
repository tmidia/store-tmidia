
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { CartItem } from './types';

export const useCartManagement = (produtos: any[], caixaAberto: boolean) => {
  const [carrinho, setCarrinho] = useState<CartItem[]>([]);

  const adicionarAoCarrinho = (produto: any) => {
    if (!caixaAberto) {
      toast({
        title: "Caixa fechado",
        description: "Abra o caixa para realizar vendas.",
        variant: "destructive",
      });
      return;
    }

    const itemExistente = carrinho.find(item => item.id === produto.id);
    
    if (itemExistente) {
      if (itemExistente.quantidade < produto.stock_quantity) {
        setCarrinho(carrinho.map(item => 
          item.id === produto.id 
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        ));
      } else {
        toast({
          title: "Estoque insuficiente",
          description: "Não há mais unidades disponíveis.",
          variant: "destructive",
        });
      }
    } else {
      setCarrinho([...carrinho, { 
        ...produto, 
        quantidade: 1,
        preco: produto.sale_price,
        nome: produto.name,
        codigo: produto.code,
        estoque: produto.stock_quantity
      }]);
    }
  };

  const removerDoCarrinho = (id: string) => {
    setCarrinho(carrinho.filter(item => item.id !== id));
  };

  const alterarQuantidade = (id: string, novaQuantidade: number) => {
    if (novaQuantidade === 0) {
      removerDoCarrinho(id);
      return;
    }
    
    const produto = produtos.find(p => p.id === id);
    if (produto && novaQuantidade > produto.stock_quantity) {
      toast({
        title: "Estoque insuficiente",
        description: "Quantidade maior que o estoque disponível.",
        variant: "destructive",
      });
      return;
    }

    setCarrinho(carrinho.map(item => 
      item.id === id ? { ...item, quantidade: novaQuantidade } : item
    ));
  };

  const limparCarrinho = () => {
    setCarrinho([]);
  };

  return {
    carrinho,
    adicionarAoCarrinho,
    removerDoCarrinho,
    alterarQuantidade,
    limparCarrinho
  };
};
