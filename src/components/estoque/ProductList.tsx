
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, AlertTriangle, Edit } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  code: string;
  stock_quantity: number;
  minimum_stock: number;
  categories?: { name: string };
}

interface ProductListProps {
  products: Product[];
  onMovimentarClick: (product: Product) => void;
}

const getStockStatus = (current: number, minimum: number) => {
  if (current === 0) return { label: 'Sem estoque', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
  if (current <= minimum) return { label: 'Estoque baixo', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle };
  return { label: 'Normal', color: 'bg-green-100 text-green-800', icon: Package };
};

export const ProductList = ({ products, onMovimentarClick }: ProductListProps) => {
  return (
    <Card className="border-0 shadow-md bg-white">
      <CardHeader>
        <CardTitle>Produtos em Estoque</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map(product => {
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
                  
                  <Button variant="outline" size="sm" className="whitespace-nowrap" onClick={() => onMovimentarClick(product)}>
                    <Edit className="mr-1 h-4 w-4" />
                    Movimentar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        
        {products.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-600">Tente ajustar o termo de busca.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
