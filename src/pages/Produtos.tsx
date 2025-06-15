
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import ProductDialog from '@/components/ProductDialog';
import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import EmptyProductState from '@/components/EmptyProductState';

interface Product {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  category_id?: string | null;
  supplier_id?: string | null;
  cost_price: number;
  sale_price: number;
  stock_quantity: number;
  minimum_stock: number;
  created_at?: string | null;
  updated_at?: string | null;
  categories?: { name: string } | null;
  suppliers?: { name: string } | null;
}

const Produtos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { produtos, categories, suppliers, loading, saveProduct, deleteProduct } = useProducts();

  const handleSaveProduct = async (productData: any) => {
    const success = await saveProduct(productData, editingProduct);
    if (success) {
      setIsDialogOpen(false);
      setEditingProduct(null);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const filteredProducts = produtos.filter(produto => {
    const matchesSearch = produto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || produto.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600 mt-1">Gerencie seu catálogo de produtos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-blue-dark w-full sm:w-auto" onClick={handleNewProduct}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Filtros */}
      <ProductFilters
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        categories={categories}
        onSearchChange={setSearchTerm}
        onCategoryChange={setSelectedCategory}
      />

      {/* Lista de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(produto => (
          <ProductCard
            key={produto.id}
            product={produto as any}
            onEdit={handleEditProduct}
            onDelete={deleteProduct}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && <EmptyProductState />}

      <ProductDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        product={editingProduct as any}
        onSave={handleSaveProduct}
      />
    </div>
  );
};

export default Produtos;
