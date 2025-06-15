
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, BarChart3, AlertTriangle, TrendingDown } from 'lucide-react';

interface InventoryKPIsProps {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  formatCurrency: (value: number) => string;
}

export const InventoryKPIs = ({
  totalProducts,
  totalValue,
  lowStockCount,
  outOfStockCount,
  formatCurrency,
}: InventoryKPIsProps) => {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProducts}</div>
          <p className="text-xs text-muted-foreground">produtos cadastrados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
          <p className="text-xs text-muted-foreground">em estoque</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {lowStockCount}
          </div>
          <p className="text-xs text-muted-foreground">produtos em alerta</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sem Estoque</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {outOfStockCount}
          </div>
          <p className="text-xs text-muted-foreground">produtos zerados</p>
        </CardContent>
      </Card>
    </div>
  );
};
