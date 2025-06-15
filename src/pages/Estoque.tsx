import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Package, 
  Search, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Edit
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  code: string;
  stock_quantity: number;
  minimum_stock: number;
  categories?: { name: string };
}

const Estoque = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [movementType, setMovementType] = useState<'entrada' | 'saida'>('entrada');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          code,
          stock_quantity,
          minimum_stock,
          categories(name)
        `)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      toast({
        title: "Erro ao carregar estoque",
        description: "Não foi possível carregar os dados do estoque.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStockMovement = async () => {
    if (!selectedProduct || !quantity || !reason) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para continuar.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newQuantity = movementType === 'entrada' 
        ? selectedProduct.stock_quantity + parseInt(quantity)
        : selectedProduct.stock_quantity - parseInt(quantity);

      if (newQuantity < 0) {
        toast({
          title: "Estoque insuficiente",
          description: "Não é possível retirar mais produtos do que o disponível em estoque.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('products')
        .update({ stock_quantity: newQuantity })
        .eq('id', selectedProduct.id);

      if (error) throw error;

      toast({
        title: "Movimentação realizada!",
        description: `${movementType === 'entrada' ? 'Entrada' : 'Saída'} de ${quantity} unidades registrada com sucesso.`,
      });

      setIsDialogOpen(false);
      setSelectedProduct(null);
      setQuantity('');
      setReason('');
      fetchProducts();
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      toast({
        title: "Erro na movimentação",
        description: "Não foi possível realizar a movimentação. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (current: number, minimum: number) => {
    if (current === 0) return { label: 'Sem estoque', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
    if (current <= minimum) return { label: 'Estoque baixo', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle };
    return { label: 'Normal', color: 'bg-green-100 text-green-800', icon: Package };
  };

  const lowStockProducts = products.filter(p => p.stock_quantity <= p.minimum_stock);
  const outOfStockProducts = products.filter(p => p.stock_quantity === 0);
  const totalProducts = products.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Controle de Estoque</h1>
          <p className="text-gray-600 mt-1">Gerencie e monitore seu estoque</p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md bg-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total de Produtos</p>
                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Estoque Baixo</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Sem Estoque</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-green-600">---</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="border-0 shadow-md bg-white">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar produto por nome ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Produtos */}
      <Card className="border-0 shadow-md bg-white">
        <CardHeader>
          <CardTitle>Produtos em Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProducts.map(product => {
              const status = getStockStatus(product.stock_quantity, product.minimum_stock);
              const StatusIcon = status.icon;
              
              return (
                <div key={product.id} className="flex flex-col gap-4 rounded-lg border p-4 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center space-x-4">
                    <StatusIcon className="h-6 w-6 text-gray-400" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-600">Código: {product.code}</p>
                      <p className="text-xs text-gray-500">{product.categories?.name || 'Sem categoria'}</p>
                    </div>
                  </div>
                  
                  <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-end">
                    <div className="flex items-center space-x-2 sm:space-x-4">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{product.stock_quantity} un.</p>
                        <p className="text-xs text-gray-600">Min: {product.minimum_stock}</p>
                      </div>
                      
                      <Badge className={`${status.color} whitespace-nowrap`}>
                        {status.label}
                      </Badge>
                    </div>
                    
                    <Dialog open={isDialogOpen && selectedProduct?.id === product.id} onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (open) setSelectedProduct(product);
                      else setSelectedProduct(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="whitespace-nowrap">
                          <Edit className="mr-1 h-4 w-4" />
                          Movimentar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Movimentação de Estoque</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-sm text-gray-600">Estoque atual: {product.stock_quantity} unidades</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <Button
                              variant={movementType === 'entrada' ? 'default' : 'outline'}
                              onClick={() => setMovementType('entrada')}
                              className="w-full"
                            >
                              <TrendingUp className="mr-2 h-4 w-4" />
                              Entrada
                            </Button>
                            <Button
                              variant={movementType === 'saida' ? 'default' : 'outline'}
                              onClick={() => setMovementType('saida')}
                              className="w-full"
                            >
                              <TrendingDown className="mr-2 h-4 w-4" />
                              Saída
                            </Button>
                          </div>
                          
                          <div>
                            <Label htmlFor="quantity">Quantidade</Label>
                            <Input
                              id="quantity"
                              type="number"
                              value={quantity}
                              onChange={(e) => setQuantity(e.target.value)}
                              placeholder="Digite a quantidade"
                              min="1"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="reason">Motivo</Label>
                            <Input
                              id="reason"
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                              placeholder="Ex: Venda, Compra, Ajuste, etc."
                            />
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button onClick={handleStockMovement} className="flex-1">
                              Confirmar Movimentação
                            </Button>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-600">Tente ajustar o termo de busca.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Estoque;
