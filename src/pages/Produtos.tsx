
import { useState } from 'react';
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
  Filter, 
  Edit, 
  Trash2, 
  Package,
  BarChart3,
  DollarSign
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Produtos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Dados simulados
  const [produtos, setProdutos] = useState([
    {
      id: 1,
      nome: 'Capa iPhone 14 Pro',
      categoria: 'Acessórios',
      codigo: '001',
      precoVenda: 29.90,
      precoCusto: 15.00,
      estoque: 25,
      estoqueMinimo: 10,
      fornecedor: 'Tech Acessórios',
      descricao: 'Capa transparente para iPhone 14 Pro'
    },
    {
      id: 2,
      nome: 'Chinelo Havaianas',
      categoria: 'Calçados',
      codigo: '002',
      precoVenda: 35.00,
      precoCusto: 20.00,
      estoque: 8,
      estoqueMinimo: 15,
      fornecedor: 'Distribuidora Brasil',
      descricao: 'Chinelo Havaianas tradicional'
    },
    {
      id: 3,
      nome: 'Copo Térmico Personalizado',
      categoria: 'Presentes',
      codigo: '003',
      precoVenda: 45.00,
      precoCusto: 25.00,
      estoque: 12,
      estoqueMinimo: 8,
      fornecedor: 'Presentes & Cia',
      descricao: 'Copo térmico 500ml com personalização'
    }
  ]);

  const categorias = ['Acessórios', 'Calçados', 'Presentes', 'Eletrônicos', 'Roupas'];

  const handleSaveProduct = (productData) => {
    if (editingProduct) {
      setProdutos(produtos.map(p => p.id === editingProduct.id ? { ...productData, id: editingProduct.id } : p));
      toast({
        title: "Produto atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
    } else {
      const newProduct = { ...productData, id: Date.now() };
      setProdutos([...produtos, newProduct]);
      toast({
        title: "Produto cadastrado!",
        description: "Novo produto adicionado ao estoque.",
      });
    }
    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id) => {
    setProdutos(produtos.filter(p => p.id !== id));
    toast({
      title: "Produto removido!",
      description: "O produto foi excluído do sistema.",
      variant: "destructive",
    });
  };

  const filteredProducts = produtos.filter(produto => {
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || produto.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (estoque, estoqueMinimo) => {
    if (estoque === 0) return { label: 'Sem estoque', color: 'bg-red-100 text-red-800' };
    if (estoque <= estoqueMinimo) return { label: 'Estoque baixo', color: 'bg-orange-100 text-orange-800' };
    return { label: 'Normal', color: 'bg-green-100 text-green-800' };
  };

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
            categorias={categorias}
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
                  {categorias.map(categoria => (
                    <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
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
          const stockStatus = getStockStatus(produto.estoque, produto.estoqueMinimo);
          return (
            <Card key={produto.id} className="border-0 shadow-md bg-white hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {produto.nome}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Código: {produto.codigo}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {produto.categoria}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-xs text-gray-600">Preço</p>
                      <p className="font-semibold text-green-600">R$ {produto.precoVenda.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">Estoque</p>
                      <p className="font-semibold text-gray-900">{produto.estoque} un.</p>
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
                          produto.estoque <= produto.estoqueMinimo ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                        style={{ 
                          width: `${Math.min((produto.estoque / (produto.estoqueMinimo * 2)) * 100, 100)}%` 
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
const ProductDialog = ({ product, categorias, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    nome: product?.nome || '',
    categoria: product?.categoria || '',
    codigo: product?.codigo || '',
    precoVenda: product?.precoVenda || '',
    precoCusto: product?.precoCusto || '',
    estoque: product?.estoque || '',
    estoqueMinimo: product?.estoqueMinimo || '',
    fornecedor: product?.fornecedor || '',
    descricao: product?.descricao || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      precoVenda: parseFloat(formData.precoVenda),
      precoCusto: parseFloat(formData.precoCusto),
      estoque: parseInt(formData.estoque),
      estoqueMinimo: parseInt(formData.estoqueMinimo)
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
            <Label htmlFor="nome">Nome do Produto *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="codigo">Código *</Label>
            <Input
              id="codigo"
              value={formData.codigo}
              onChange={(e) => setFormData({...formData, codigo: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="categoria">Categoria *</Label>
            <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map(categoria => (
                  <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="fornecedor">Fornecedor</Label>
            <Input
              id="fornecedor"
              value={formData.fornecedor}
              onChange={(e) => setFormData({...formData, fornecedor: e.target.value})}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="precoCusto">Preço de Custo *</Label>
            <Input
              id="precoCusto"
              type="number"
              step="0.01"
              value={formData.precoCusto}
              onChange={(e) => setFormData({...formData, precoCusto: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="precoVenda">Preço de Venda *</Label>
            <Input
              id="precoVenda"
              type="number"
              step="0.01"
              value={formData.precoVenda}
              onChange={(e) => setFormData({...formData, precoVenda: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="estoque">Quantidade em Estoque *</Label>
            <Input
              id="estoque"
              type="number"
              value={formData.estoque}
              onChange={(e) => setFormData({...formData, estoque: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="estoqueMinimo">Estoque Mínimo *</Label>
            <Input
              id="estoqueMinimo"
              type="number"
              value={formData.estoqueMinimo}
              onChange={(e) => setFormData({...formData, estoqueMinimo: e.target.value})}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            value={formData.descricao}
            onChange={(e) => setFormData({...formData, descricao: e.target.value})}
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
