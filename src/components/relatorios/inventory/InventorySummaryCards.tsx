
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown } from 'lucide-react';

interface LowStockProduct {
  id: string;
  name: string;
  stock_quantity: number;
  minimum_stock: number;
}

interface ValuableProduct {
  id: string;
  name: string;
  stock_quantity: number;
  cost_price: number | null;
  totalValue: number;
}

interface InventorySummaryCardsProps {
  lowStockProducts: LowStockProduct[];
  mostValuableProducts: ValuableProduct[];
  isLoading: boolean;
  formatCurrency: (value: number) => string;
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export const InventorySummaryCards = ({
  lowStockProducts,
  mostValuableProducts,
  isLoading,
  formatCurrency,
}: InventorySummaryCardsProps) => {
  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Produtos com Estoque Baixo
          </CardTitle>
          <CardDescription>Produtos que precisam de reposição</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-3">
              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum produto com estoque baixo</p>
              ) : (
                lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Atual: {product.stock_quantity} | Mínimo: {product.minimum_stock}
                      </p>
                    </div>
                    <Badge variant="secondary">Baixo</Badge>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            Produtos Mais Valiosos
          </CardTitle>
          <CardDescription>Top 5 produtos por valor em estoque</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-3">
              {mostValuableProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Qtd: {product.stock_quantity} × {formatCurrency(product.cost_price || 0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{formatCurrency(product.totalValue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
