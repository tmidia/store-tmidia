
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useProducts } from '@/hooks/useProducts';

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

  const { produtos, loading } = useProducts();

  // Verificar se o caixa está aberto ao carregar a página
  useEffect(() => {
    const caixaStatus = localStorage.getItem('caixaAberto');
    setCaixaAberto(caixaStatus === 'true');
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

  const abrirCaixa = () => {
    const valorInicial = prompt("Digite o valor inicial do caixa:");
    if (valorInicial && !isNaN(parseFloat(valorInicial))) {
      localStorage.setItem('caixaAberto', 'true');
      localStorage.setItem('valorInicialCaixa', valorInicial);
      localStorage.setItem('dataAberturaCaixa', new Date().toISOString());
      setCaixaAberto(true);
      
      toast({
        title: "Caixa aberto!",
        description: `Valor inicial: R$ ${parseFloat(valorInicial).toFixed(2)}`,
      });
    }
  };

  const fecharCaixa = () => {
    const valorFinal = prompt("Digite o valor final do caixa:");
    if (valorFinal && !isNaN(parseFloat(valorFinal))) {
      localStorage.setItem('caixaAberto', 'false');
      localStorage.setItem('valorFinalCaixa', valorFinal);
      localStorage.setItem('dataFechamentoCaixa', new Date().toISOString());
      setCaixaAberto(false);
      
      toast({
        title: "Caixa fechado!",
        description: `Valor final: R$ ${parseFloat(valorFinal).toFixed(2)}`,
      });
    }
  };

  const finalizarVenda = (dadosVenda: any) => {
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

    toast({
      title: "Venda finalizada!",
      description: `Total: R$ ${dadosVenda.total.toFixed(2)}`,
    });

    // Limpar dados
    setCarrinho([]);
    setDesconto(0);
    setFormaPagamento('');
    setValorRecebido('');
    setClienteNome('');
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
