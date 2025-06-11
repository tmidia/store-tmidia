
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, Edit, Trash2 } from 'lucide-react';

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
  categories?: { name: string } | null;
  suppliers?: { name: string } | null;
}

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

const ProductCard = ({ product, onEdit, onDelete }: ProductCardProps) => {
  const getStockStatus = (estoque: number, estoqueMinimo: number) => {
    if (estoque === 0) return { label: 'Sem estoque', color: 'bg-red-100 text-red-800' };
    if (estoque <= estoqueMinimo) return { label: 'Estoque baixo', color: 'bg-orange-100 text-orange-800' };
    return { label: 'Normal', color: 'bg-green-100 text-green-800' };
  };

  const stockStatus = getStockStatus(product.stock_quantity, product.minimum_stock);

  return (
    <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {product.name}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">Código: {product.code}</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {product.categories?.name || 'Sem categoria'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-xs text-gray-600">Preço</p>
              <p className="font-semibold text-green-600">R$ {product.sale_price.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Package className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-xs text-gray-600">Estoque</p>
              <p className="font-semibold text-gray-900">{product.stock_quantity} un.</p>
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
                  product.stock_quantity <= product.minimum_stock ? 'bg-orange-500' : 'bg-green-500'
                }`}
                style={{ 
                  width: `${Math.min((product.stock_quantity / (product.minimum_stock * 2)) * 100, 100)}%` 
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
            onClick={() => onEdit(product)}
          >
            <Edit className="w-4 h-4 mr-1" />
            Editar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(product.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
