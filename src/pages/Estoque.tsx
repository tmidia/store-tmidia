
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EstoqueStats } from '@/components/estoque/EstoqueStats';
import { ProductList } from '@/components/estoque/ProductList';
import { StockMovementDialog } from '@/components/estoque/StockMovementDialog';

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
          categories!category_id(name)
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

  const handleMovimentarClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedProduct(null);
    }
  };

  const handleConfirmMovement = async (movementType: 'entrada' | 'saida', quantity: string, reason: string) => {
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Controle de Estoque</h1>
          <p className="text-gray-600 mt-1">Gerencie e monitore seu estoque</p>
        </div>
      </div>

      {/* Estatísticas */}
      <EstoqueStats products={products} />

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
      <ProductList products={filteredProducts} onMovimentarClick={handleMovimentarClick} />
      
      {/* Dialog de Movimentação */}
      <StockMovementDialog
        isOpen={isDialogOpen}
        onOpenChange={handleOpenChange}
        product={selectedProduct}
        onConfirm={handleConfirmMovement}
      />
    </div>
  );
};

export default Estoque;
