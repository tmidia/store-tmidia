import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useProducts } from '@/hooks/useProducts';
import { useSystemParameters } from '@/hooks/useSystemParameters';
import PDVHeader from '@/components/pdv/PDVHeader';
import ProductSearch from '@/components/pdv/ProductSearch';
import ProductList from '@/components/pdv/ProductList';
import ShoppingCart from '@/components/pdv/ShoppingCart';
import PaymentPanel from '@/components/pdv/PaymentPanel';
import ConsultationPanel from '@/components/pdv/ConsultationPanel';

const PDV = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [carrinho, setCarrinho] = useState([]);
  const [desconto, setDesconto] = useState(0);
  const [formaPagamento, setFormaPagamento] = useState('');
  const [valorRecebido, setValorRecebido] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [caixaAberto, setCaixaAberto] = useState(false);
  const [modoConsulta, setModoConsulta] = useState(false);

  const { produtos, loading } = useProducts();
  const { isPDVEnabled } = useSystemParameters();

  // Verificar se o PDV está habilitado
  if (!isPDVEnabled()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 text-center">
          <CardContent>
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">PDV Desabilitado</h2>
            <p className="text-gray-600">O módulo PDV está desabilitado nas configurações do sistema.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verificar se o caixa está aberto ao carregar a página
  useEffect(() => {
    const caixaStatus = localStorage.getItem('caixaAberto');
    setCaixaAberto(caixaStatus === 'true');
  }, []);

  const adicionarAoCarrinho = (produto) => {
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

  const removerDoCarrinho = (id) => {
    setCarrinho(carrinho.filter(item => item.id !== id));
  };

  const alterarQuantidade = (id, novaQuantidade) => {
    if (novaQuantidade === 0) {
      removerDoCarrinho(id);
      return;
    }
    
    const produto = produtos.find(p => p.id === id);
    if (novaQuantidade > produto.stock_quantity) {
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

  const finalizarVenda = (dadosVenda) => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Produtos */}
        <div className="lg:col-span-2 space-y-6">
          <PDVHeader 
            caixaAberto={caixaAberto}
            onAbrirCaixa={abrirCaixa}
            onFecharCaixa={fecharCaixa}
          />

          {!caixaAberto && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Caixa fechado - Vendas bloqueadas (Consulta de produtos permitida)</span>
                </div>
              </CardContent>
            </Card>
          )}

          <ProductSearch 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            modoConsulta={modoConsulta}
            onModoConsultaChange={setModoConsulta}
            caixaAberto={caixaAberto}
          />

          <ProductList 
            produtos={produtosFiltrados}
            modoConsulta={modoConsulta}
            caixaAberto={caixaAberto}
            onAdicionarAoCarrinho={adicionarAoCarrinho}
          />
        </div>

        {/* Carrinho e Pagamento - Só exibir se não estiver em modo consulta */}
        {!modoConsulta && (
          <div className="space-y-6">
            <ShoppingCart 
              carrinho={carrinho}
              clienteNome={clienteNome}
              onClienteNomeChange={setClienteNome}
              onRemoverDoCarrinho={removerDoCarrinho}
              onAlterarQuantidade={alterarQuantidade}
              caixaAberto={caixaAberto}
            />

            <PaymentPanel 
              carrinho={carrinho}
              desconto={desconto}
              onDescontoChange={setDesconto}
              formaPagamento={formaPagamento}
              onFormaPagamentoChange={setFormaPagamento}
              valorRecebido={valorRecebido}
              onValorRecebidoChange={setValorRecebido}
              onFinalizarVenda={finalizarVenda}
              caixaAberto={caixaAberto}
            />
          </div>
        )}

        {/* Painel de Consulta - Só exibir se estiver em modo consulta */}
        {modoConsulta && (
          <div className="space-y-6">
            <ConsultationPanel />
          </div>
        )}
      </div>
    </div>
  );
};

export default PDV;
