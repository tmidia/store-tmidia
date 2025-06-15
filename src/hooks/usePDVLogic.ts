import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useProducts } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';

interface CartItem {
  id: string;
  preco: number;
  quantidade: number;
  nome: string;
  codigo: string;
  estoque: number;
}

export const usePDVLogic = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [carrinho, setCarrinho] = useState<CartItem[]>([]);
  const [desconto, setDesconto] = useState(0);
  const [formaPagamento, setFormaPagamento] = useState('');
  const [valorRecebido, setValorRecebido] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [caixaAberto, setCaixaAberto] = useState(false);
  const [modoConsulta, setModoConsulta] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const { produtos, loading } = useProducts();

  // Verificar se o caixa está aberto ao carregar a página
  useEffect(() => {
    const caixaStatus = localStorage.getItem('caixaAberto');
    const sessionIdLocal = localStorage.getItem('sessionId');
    setCaixaAberto(caixaStatus === 'true');
    if (sessionIdLocal) {
      setSessionId(sessionIdLocal);
    }
  }, []);

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

  const abrirCaixa = async () => {
    const valorInicial = prompt("Digite o valor inicial do caixa:");
    if (valorInicial && !isNaN(parseFloat(valorInicial))) {
      try {
        // Salvar sessão de caixa no banco de dados
        const { data, error } = await supabase
          .from('cash_sessions')
          .insert({
            opening_amount: parseFloat(valorInicial),
            status: 'open'
          })
          .select()
          .single();

        if (error) {
          console.error('Erro ao abrir caixa:', error);
          toast({
            title: "Erro ao abrir caixa",
            description: "Não foi possível registrar a abertura do caixa.",
            variant: "destructive",
          });
          return;
        }

        localStorage.setItem('caixaAberto', 'true');
        localStorage.setItem('valorInicialCaixa', valorInicial);
        localStorage.setItem('dataAberturaCaixa', new Date().toISOString());
        localStorage.setItem('sessionId', data.id);
        
        setSessionId(data.id);
        setCaixaAberto(true);
        
        toast({
          title: "Caixa aberto!",
          description: `Valor inicial: R$ ${parseFloat(valorInicial).toFixed(2)}`,
        });
      } catch (error) {
        console.error('Erro ao abrir caixa:', error);
        toast({
          title: "Erro ao abrir caixa",
          description: "Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  const fecharCaixa = async () => {
    const valorFinal = prompt("Digite o valor final do caixa:");
    if (valorFinal && !isNaN(parseFloat(valorFinal)) && sessionId) {
      try {
        const valorInicialStr = localStorage.getItem('valorInicialCaixa');
        const valorInicial = valorInicialStr ? parseFloat(valorInicialStr) : 0;
        const valorFinalNum = parseFloat(valorFinal);
        
        // Calcular vendas do dia para o valor esperado
        const { data: vendas } = await supabase
          .from('financial_transactions')
          .select('amount')
          .eq('type', 'venda')
          .gte('created_at', new Date().toISOString().split('T')[0]);

        const totalVendas = vendas?.reduce((sum, venda) => sum + Number(venda.amount), 0) || 0;
        const valorEsperado = valorInicial + totalVendas;
        const diferenca = valorFinalNum - valorEsperado;

        // Atualizar sessão de caixa
        const { error } = await supabase
          .from('cash_sessions')
          .update({
            closing_amount: valorFinalNum,
            expected_amount: valorEsperado,
            difference: diferenca,
            closed_at: new Date().toISOString(),
            status: 'closed'
          })
          .eq('id', sessionId);

        if (error) {
          console.error('Erro ao fechar caixa:', error);
          toast({
            title: "Erro ao fechar caixa",
            description: "Não foi possível registrar o fechamento do caixa.",
            variant: "destructive",
          });
          return;
        }

        localStorage.setItem('caixaAberto', 'false');
        localStorage.setItem('valorFinalCaixa', valorFinal);
        localStorage.setItem('dataFechamentoCaixa', new Date().toISOString());
        localStorage.removeItem('sessionId');
        
        setSessionId(null);
        setCaixaAberto(false);
        
        const mensagem = diferenca === 0 
          ? `Caixa fechado! Valor final: R$ ${valorFinalNum.toFixed(2)} (Conferido)`
          : `Caixa fechado! Valor final: R$ ${valorFinalNum.toFixed(2)} (Diferença: R$ ${diferenca.toFixed(2)})`;
        
        toast({
          title: "Caixa fechado!",
          description: mensagem,
          variant: diferenca === 0 ? "default" : "destructive",
        });
      } catch (error) {
        console.error('Erro ao fechar caixa:', error);
        toast({
          title: "Erro ao fechar caixa",
          description: "Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  const finalizarVenda = async (dadosVenda: any) => {
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

      // Limpar dados
      setCarrinho([]);
      setDesconto(0);
      setFormaPagamento('');
      setValorRecebido('');
      setClienteNome('');

    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      toast({
        title: "Erro ao finalizar venda",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const produtosFiltrados = produtos.filter(produto =>
    produto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    searchTerm,
    setSearchTerm,
    carrinho,
    desconto,
    setDesconto,
    formaPagamento,
    setFormaPagamento,
    valorRecebido,
    setValorRecebido,
    clienteNome,
    setClienteNome,
    caixaAberto,
    modoConsulta,
    setModoConsulta,
    produtos,
    produtosFiltrados,
    loading,
    adicionarAoCarrinho,
    removerDoCarrinho,
    alterarQuantidade,
    abrirCaixa,
    fecharCaixa,
    finalizarVenda
  };
};
