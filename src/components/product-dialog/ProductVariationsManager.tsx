import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Save, X, Package } from 'lucide-react';
import { useProductVariations, type ProductVariation } from '@/hooks/useProductVariations';
import { formatCurrency } from '@/utils/formatters';

interface ProductVariationsManagerProps {
  productId: string;
  productCode: string;
}

const ProductVariationsManager = ({ productId, productCode }: ProductVariationsManagerProps) => {
  const { variations, loading, fetchVariations, saveVariation, deleteVariation } = useProductVariations(productId);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    sku: '',
    variation_name: '',
    cost_price: '',
    sale_price: '',
    stock_quantity: '',
    minimum_stock: ''
  });

  // Carregar variações quando o componente montar
  useState(() => {
    if (productId) {
      fetchVariations(productId);
    }
  });

  const resetForm = () => {
    setFormData({
      sku: '',
      variation_name: '',
      cost_price: '',
      sale_price: '',
      stock_quantity: '',
      minimum_stock: ''
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleStartAdd = () => {
    setFormData({
      sku: `${productCode}-`,
      variation_name: '',
      cost_price: '',
      sale_price: '',
      stock_quantity: '0',
      minimum_stock: '0'
    });
    setIsAdding(true);
    setEditingId(null);
  };

  const handleStartEdit = (variation: ProductVariation) => {
    setFormData({
      sku: variation.sku,
      variation_name: variation.variation_name,
      cost_price: variation.cost_price.toString(),
      sale_price: variation.sale_price.toString(),
      stock_quantity: variation.stock_quantity.toString(),
      minimum_stock: variation.minimum_stock.toString()
    });
    setEditingId(variation.id);
    setIsAdding(false);
  };

  const handleSave = async () => {
    const data = {
      product_id: productId,
      sku: formData.sku,
      variation_name: formData.variation_name,
      cost_price: parseFloat(formData.cost_price) || 0,
      sale_price: parseFloat(formData.sale_price) || 0,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      minimum_stock: parseInt(formData.minimum_stock) || 0
    };

    const editingVariation = editingId ? variations.find(v => v.id === editingId) : null;
    const success = await saveVariation(data, editingVariation);
    
    if (success) {
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta variação?')) {
      await deleteVariation(id);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Package className="w-5 h-5" />
            Variações do Produto
          </CardTitle>
          {!isAdding && !editingId && (
            <Button size="sm" onClick={handleStartAdd}>
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Variação
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Formulário de adição/edição */}
        {(isAdding || editingId) && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  placeholder="Código único"
                />
              </div>
              <div>
                <Label htmlFor="variation_name">Nome da Variação *</Label>
                <Input
                  id="variation_name"
                  value={formData.variation_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, variation_name: e.target.value }))}
                  placeholder="Ex: P/Azul, M/Vermelho"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <Label htmlFor="cost_price">Preço Custo</Label>
                <Input
                  id="cost_price"
                  type="number"
                  step="0.01"
                  value={formData.cost_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, cost_price: e.target.value }))}
                  placeholder="0,00"
                />
              </div>
              <div>
                <Label htmlFor="sale_price">Preço Venda</Label>
                <Input
                  id="sale_price"
                  type="number"
                  step="0.01"
                  value={formData.sale_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, sale_price: e.target.value }))}
                  placeholder="0,00"
                />
              </div>
              <div>
                <Label htmlFor="stock_quantity">Estoque</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="minimum_stock">Estoque Mín.</Label>
                <Input
                  id="minimum_stock"
                  type="number"
                  value={formData.minimum_stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, minimum_stock: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={resetForm}>
                <X className="w-4 h-4 mr-1" />
                Cancelar
              </Button>
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={!formData.sku || !formData.variation_name}
              >
                <Save className="w-4 h-4 mr-1" />
                Salvar
              </Button>
            </div>
          </div>
        )}

        {/* Tabela de variações */}
        {variations.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Variação</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead className="text-right">Estoque</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variations.map(variation => (
                <TableRow key={variation.id}>
                  <TableCell className="font-mono text-sm">{variation.sku}</TableCell>
                  <TableCell>{variation.variation_name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(variation.sale_price)}</TableCell>
                  <TableCell className="text-right">
                    <span className={variation.stock_quantity <= variation.minimum_stock ? 'text-red-600 font-semibold' : ''}>
                      {variation.stock_quantity}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleStartEdit(variation)}
                        disabled={isAdding || editingId !== null}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleDelete(variation.id)}
                        disabled={isAdding || editingId !== null}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>Nenhuma variação cadastrada</p>
            <p className="text-sm">Clique em "Adicionar Variação" para começar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductVariationsManager;
