
import { useState } from 'react';
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
  User
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const PDV = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [carrinho, setCarrinho] = useState([]);
  const [desconto, setDesconto] = useState(0);
  const [formaPagamento, setFormaPagamento] = useState('');
  const [valorRecebido, setValorRecebido] = useState('');
  const [clienteNome, setClienteNome] = useState('');

  // Produtos simulados
  const produtos = [
    { id: 1, nome: 'Capa iPhone 14 Pro', codigo: '001', preco: 29.90, estoque: 25 },
    { id: 2, nome: 'Chinelo Havaianas', codigo: '002', preco: 35.00, estoque: 8 },
    { id: 3, nome: 'Copo Térmico', codigo: '003', preco: 45.00, estoque: 12 },
    { id: 4, nome: 'Carregador iPhone', codigo: '004', preco: 55.00, estoque: 15 },
    { id: 5, nome: 'Fone Bluetooth', codigo: '005', preco: 89.90, estoque: 6 },
  ];

  const formasPagamento = [
    { value: 'dinheiro', label: 'Dinheiro', icon: Banknote },
    { value: 'pix', label: 'PIX', icon: QrCode },
    { value: 'cartao', label: 'Cartão', icon: CreditCard },
    { value: 'misto', label: 'Misto', icon: Calculator },
  ];

  const adicionarAoCarrinho = (produto) => {
    const itemExistente = carrinho.find(item => item.id === produto.id);
    
    if (itemExistente) {
      if (itemExistente.quantidade < produto.estoque) {
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
      setCarrinho([...carrinho, { ...produto, quantidade: 1 }]);
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
    if (novaQuantidade > produto.estoque) {
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

  const produtosFiltrados = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <Badge className="bg-green-100 text-green-800 px-3 py-1">
              Caixa Aberto
            </Badge>
          </div>

          {/* Busca de Produtos */}
          <Card className="border-0 shadow-md bg-white">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar produto por nome ou código de barras..."
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
              <CardTitle className="text-lg font-semibold">Produtos Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {produtosFiltrados.map(produto => (
                  <div 
                    key={produto.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary cursor-pointer transition-colors"
                    onClick={() => adicionarAoCarrinho(produto)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{produto.nome}</h4>
                      <Badge variant="outline" className="text-xs">
                        {produto.codigo}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-primary">
                        R$ {produto.preco.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-600">
                        Estoque: {produto.estoque}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Carrinho e Pagamento */}
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
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="font-medium min-w-[20px] text-center">{item.quantidade}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => alterarQuantidade(item.id, item.quantidade + 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removerDoCarrinho(item.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
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
                <Select value={formaPagamento} onValueChange={setFormaPagamento}>
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
                disabled={carrinho.length === 0}
              >
                <DollarSign className="w-5 h-5 mr-2" />
                Finalizar Venda
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PDV;
