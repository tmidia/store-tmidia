import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Calculator,
  CreditCard,
  Banknote,
  QrCode,
  DollarSign,
  User,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useProducts } from '@/hooks/useProducts';

const PDV = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [carrinho, setCarrinho] = useState([]);
  const [desconto, setDesconto] = useState(0);
  const [formaPagamento, setFormaPagamento] = useState('');
  const [valorRecebido, setValorRecebido] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [caixaAberto, setCaixaAberto] = useState(false);
  const [modoConsulta, setModoConsulta] = useState(false);

  // Usar produtos reais do banco de dados
  const { produtos, loading } = useProducts();

  const formasPagamento = [
    { value: 'dinheiro', label: 'Dinheiro', icon: Banknote },
    { value: 'pix', label: 'PIX', icon: QrCode },
    { value: 'cartao', label: 'Cartão', icon: CreditCard },
    { value: 'misto', label: 'Misto', icon: Calculator },
  ];

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

  const subtotal = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  const valorDesconto = (subtotal * desconto) / 100;
  const total = subtotal - valorDesconto;
  const troco = parseFloat(valorRecebido) - total;

  const finalizarVenda = () => {
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

    if (!formaPagamento) {
      toast({
        title: "Forma de pagamento",
        description: "Selecione a forma de pagamento.",
        variant: "destructive",
      });
      return;
    }

    if (formaPagamento === 'dinheiro' && (!valorRecebido || parseFloat(valorRecebido) < total)) {
      toast({
        title: "Valor insuficiente",
        description: "O valor recebido é menor que o total da compra.",
        variant: "destructive",
      });
      return;
    }

    // Simular finalização da venda
    toast({
      title: "Venda finalizada!",
      description: `Total: R$ ${total.toFixed(2)} - ${formasPagamento.find(f => f.value === formaPagamento)?.label}`,
    });

    // Limpar carrinho
    setCarrinho([]);
    setDesconto(0);
    setFormaPagamento('');
    setValorRecebido('');
    setClienteNome('');
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

  // Filtrar produtos com base na busca (nome ou código)
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">PDV</h1>
              <p className="text-gray-600 mt-1">Ponto de Venda</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge className={caixaAberto ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {caixaAberto ? "Caixa Aberto" : "Caixa Fechado"}
              </Badge>
              {caixaAberto ? (
                <Button variant="outline" onClick={fecharCaixa} className="text-red-600 hover:text-red-700">
                  Fechar Caixa
                </Button>
              ) : (
                <Button onClick={abrirCaixa} className="bg-green-600 hover:bg-green-700">
                  Abrir Caixa
                </Button>
              )}
            </div>
          </div>

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

          {/* Toggle entre Modo Venda e Modo Consulta */}
          <Card className="border-0 shadow-md bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant={!modoConsulta ? "default" : "outline"}
                  onClick={() => setModoConsulta(false)}
                  className="flex items-center gap-2"
                  disabled={!caixaAberto}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Modo Venda
                </Button>
                <Button
                  variant={modoConsulta ? "default" : "outline"}
                  onClick={() => setModoConsulta(true)}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Consultar Produtos
                </Button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder={modoConsulta ? "Consultar produto por nome ou código..." : "Buscar produto por nome ou código..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Lista de Produtos */}
          <Card className="border-0 shadow-md bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {modoConsulta ? `Consulta de Produtos (${produtosFiltrados.length})` : `Produtos Disponíveis (${produtosFiltrados.length})`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {produtosFiltrados.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {produtosFiltrados.map(produto => (
                    <div 
                      key={produto.id}
                      className={`p-4 border border-gray-200 rounded-lg transition-colors ${
                        !modoConsulta && caixaAberto 
                          ? 'hover:border-primary cursor-pointer' 
                          : modoConsulta 
                            ? 'hover:border-blue-300 cursor-default'
                            : 'opacity-50 cursor-not-allowed'
                      }`}
                      onClick={() => !modoConsulta && caixaAberto && adicionarAoCarrinho(produto)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{produto.name}</h4>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="outline" className="text-xs">
                            {produto.code}
                          </Badge>
                          {modoConsulta && (
                            <Badge variant="secondary" className="text-xs">
                              <Eye className="w-3 h-3 mr-1" />
                              Consulta
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-primary">
                          R$ {produto.sale_price.toFixed(2)}
                        </span>
                        <span className={`text-sm ${produto.stock_quantity <= produto.minimum_stock ? 'text-red-600' : 'text-gray-600'}`}>
                          Estoque: {produto.stock_quantity}
                        </span>
                      </div>
                      {modoConsulta && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>Preço de Custo: R$ {produto.cost_price.toFixed(2)}</div>
                            <div>Estoque Mínimo: {produto.minimum_stock}</div>
                            {produto.description && (
                              <div className="text-gray-600">Descrição: {produto.description}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Carrinho e Pagamento - Só exibir se não estiver em modo consulta */}
        {!modoConsulta && (
          <div className="space-y-6">
            {/* Informações do Cliente */}
            <Card className="border-0 shadow-md bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Nome do cliente (opcional)"
                  value={clienteNome}
                  onChange={(e) => setClienteNome(e.target.value)}
                  disabled={!caixaAberto}
                />
              </CardContent>
            </Card>

            {/* Carrinho */}
            <Card className="border-0 shadow-md bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Carrinho ({carrinho.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {carrinho.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Carrinho vazio</p>
                  ) : (
                    carrinho.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 text-sm">{item.nome}</h5>
                          <p className="text-primary font-semibold">R$ {item.preco.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => alterarQuantidade(item.id, item.quantidade - 1)}
                            className="h-8 w-8 p-0"
                            disabled={!caixaAberto}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="font-medium min-w-[20px] text-center">{item.quantidade}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => alterarQuantidade(item.id, item.quantidade + 1)}
                            className="h-8 w-8 p-0"
                            disabled={!caixaAberto}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removerDoCarrinho(item.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            disabled={!caixaAberto}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resumo e Pagamento */}
            <Card className="border-0 shadow-md bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">Resumo da Venda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="flex-1">Desconto (%):</span>
                    <Input
                      type="number"
                      value={desconto}
                      onChange={(e) => setDesconto(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                      className="w-20 h-8"
                      min="0"
                      max="100"
                      disabled={!caixaAberto}
                    />
                  </div>

                  {desconto > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Desconto:</span>
                      <span>- R$ {valorDesconto.toFixed(2)}</span>
                    </div>
                  )}

                  <Separator />
                  
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-primary">R$ {total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Forma de Pagamento:</label>
                  <Select value={formaPagamento} onValueChange={setFormaPagamento} disabled={!caixaAberto}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a forma de pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {formasPagamento.map(forma => (
                        <SelectItem key={forma.value} value={forma.value}>
                          <div className="flex items-center space-x-2">
                            <forma.icon className="w-4 h-4" />
                            <span>{forma.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {formaPagamento === 'dinheiro' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Valor Recebido:</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={valorRecebido}
                        onChange={(e) => setValorRecebido(e.target.value)}
                        placeholder="0,00"
                        disabled={!caixaAberto}
                      />
                      {valorRecebido && parseFloat(valorRecebido) >= total && (
                        <div className="flex justify-between text-green-600">
                          <span>Troco:</span>
                          <span className="font-semibold">R$ {troco.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Button 
                  onClick={finalizarVenda}
                  className="w-full h-12 bg-primary hover:bg-blue-dark text-lg font-semibold"
                  disabled={carrinho.length === 0 || !caixaAberto}
                >
                  <DollarSign className="w-5 h-5 mr-2" />
                  Finalizar Venda
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Painel de Consulta - Só exibir se estiver em modo consulta */}
        {modoConsulta && (
          <div className="space-y-6">
            <Card className="border-0 shadow-md bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Modo Consulta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>• Consulte produtos por nome ou código</p>
                  <p>• Visualize preços e estoque em tempo real</p>
                  <p>• Informações detalhadas disponíveis</p>
                  <p>• Funciona mesmo com caixa fechado</p>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Modo somente leitura - Vendas desabilitadas
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDV;
