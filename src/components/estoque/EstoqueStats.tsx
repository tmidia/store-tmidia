
import { Card, CardContent } from '@/components/ui/card';
import { Package, AlertTriangle, TrendingUp } from 'lucide-react';

interface Product {
  stock_quantity: number;
  minimum_stock: number;
}

interface EstoqueStatsProps {
  products: Product[];
}

export const EstoqueStats = ({ products }: EstoqueStatsProps) => {
  const lowStockProducts = products.filter(p => p.stock_quantity <= p.minimum_stock);
  const outOfStockProducts = products.filter(p => p.stock_quantity === 0);
  const totalProducts = products.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
  );
};
