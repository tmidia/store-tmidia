
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package,
  DollarSign
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  code: string;
  description?: string;
  category_id?: string;
  supplier_id?: string;
  cost_price: number;
  sale_price: number;
  stock_quantity: number;
  minimum_stock: number;
  categories?: { name: string };
  suppliers?: { name: string };
}

interface Category {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
}

const Produtos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSuppliers();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name),
          suppliers(name)
        `);

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      toast({
        title: "Erro ao carregar produtos",
        description: "Não foi possível carregar a lista de produtos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
    }
  };

  const handleSaveProduct = async (productData: any) => {
    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        
        toast({
          title: "Produto atualizado!",
          description: "As alterações foram salvas com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;

        toast({
          title: "Produto cadastrado!",
          description: "Novo produto adicionado ao estoque.",
        });
      }
      
      setIsDialogOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast({
        title: "Erro ao salvar produto",
        description: "Não foi possível salvar o produto. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Produto removido!",
        description: "O produto foi excluído do sistema.",
        variant: "destructive",
      });
      
      fetchProducts();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast({
        title: "Erro ao excluir produto",
        description: "Não foi possível excluir o produto. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = produtos.filter(produto => {
    const matchesSearch = produto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || produto.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (estoque: number, estoqueMinimo: number) => {
    if (estoque === 0) return { label: 'Sem estoque', color: 'bg-red-100 text-red-800' };
    if (estoque <= estoqueMinimo) return { label: 'Estoque baixo', color: 'bg-orange-100 text-orange-800' };
    return { label: 'Normal', color: 'bg-green-100 text-green-800' };
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600 mt-1">Gerencie seu catálogo de produtos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-blue-dark" onClick={() => setEditingProduct(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <ProductDialog 
            product={editingProduct} 
            categories={categories}
            suppliers={suppliers}
            onSave={handleSaveProduct}
            onClose={() => setIsDialogOpen(false)}
          />
        </Dialog>
      </div>

      {/* Filtros */}
      <Card className="border-0 shadow-md bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome ou código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full lg:w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map(categoria => (
                    <SelectItem key={categoria.id} value={categoria.id}>{categoria.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(produto => {
          const stockStatus = getStockStatus(produto.stock_quantity, produto.minimum_stock);
          return (
            <Card key={produto.id} className="border-0 shadow-md bg-white hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {produto.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Código: {produto.code}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {produto.categories?.name || 'Sem categoria'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-xs text-gray-600">Preço</p>
                      <p className="font-semibold text-green-600">R$ {produto.sale_price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">Estoque</p>
                      <p className="font-semibold text-gray-900">{produto.stock_quantity} un.</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge className={stockStatus.color}>
                    {stockStatus.label}
                  </Badge>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          produto.stock_quantity <= produto.minimum_stock ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                        style={{ 
                          width: `${Math.min((produto.stock_quantity / (produto.minimum_stock * 2)) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setEditingProduct(produto);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteProduct(produto.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <Card className="border-0 shadow-md bg-white">
          <CardContent className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-600">Tente ajustar os filtros ou cadastre um novo produto.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Componente do Dialog para adicionar/editar produtos
const ProductDialog = ({ product, categories, suppliers, onSave, onClose }: {
  product: Product | null;
  categories: Category[];
  suppliers: Supplier[];
  onSave: (data: any) => void;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category_id: product?.category_id || '',
    code: product?.code || '',
    sale_price: product?.sale_price || '',
    cost_price: product?.cost_price || '',
    stock_quantity: product?.stock_quantity || '',
    minimum_stock: product?.minimum_stock || '',
    supplier_id: product?.supplier_id || '',
    description: product?.description || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      sale_price: parseFloat(formData.sale_price.toString()),
      cost_price: parseFloat(formData.cost_price.toString()),
      stock_quantity: parseInt(formData.stock_quantity.toString()),
      minimum_stock: parseInt(formData.minimum_stock.toString()),
      category_id: formData.category_id || null,
      supplier_id: formData.supplier_id || null
    });
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {product ? 'Editar Produto' : 'Novo Produto'}
        </DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome do Produto *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="code">Código *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select value={formData.category_id} onValueChange={(value) => setFormData({...formData, category_id: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(categoria => (
                  <SelectItem key={categoria.id} value={categoria.id}>{categoria.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="supplier">Fornecedor</Label>
            <Select value={formData.supplier_id} onValueChange={(value) => setFormData({...formData, supplier_id: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o fornecedor" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map(supplier => (
                  <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cost_price">Preço de Custo *</Label>
            <Input
              id="cost_price"
              type="number"
              step="0.01"
              value={formData.cost_price}
              onChange={(e) => setFormData({...formData, cost_price: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="sale_price">Preço de Venda *</Label>
            <Input
              id="sale_price"
              type="number"
              step="0.01"
              value={formData.sale_price}
              onChange={(e) => setFormData({...formData, sale_price: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="stock_quantity">Quantidade em Estoque *</Label>
            <Input
              id="stock_quantity"
              type="number"
              value={formData.stock_quantity}
              onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="minimum_stock">Estoque Mínimo *</Label>
            <Input
              id="minimum_stock"
              type="number"
              value={formData.minimum_stock}
              onChange={(e) => setFormData({...formData, minimum_stock: e.target.value})}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Descrição detalhada do produto..."
          />
        </div>

        <div className="flex space-x-2 pt-4">
          <Button type="submit" className="flex-1 bg-primary hover:bg-blue-dark">
            {product ? 'Salvar Alterações' : 'Cadastrar Produto'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default Produtos;
