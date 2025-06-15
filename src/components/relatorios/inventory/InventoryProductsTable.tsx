
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ResponsiveTable, ResponsiveTableRow } from '@/components/financeiro/ResponsiveTable';

type Product = {
  id: string;
  name: string;
  categories: { name: string } | null;
  stock_quantity: number;
  minimum_stock: number;
  cost_price: number | null;
};

type StockStatus = {
    label: string;
    variant: 'default' | 'secondary' | 'destructive';
};

interface InventoryProductsTableProps {
  products: Product[];
  isLoading: boolean;
  getStockStatus: (product: Product) => StockStatus;
  formatCurrency: (value: number) => string;
}

const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
);

export const InventoryProductsTable = ({
  products,
  isLoading,
  getStockStatus,
  formatCurrency
}: InventoryProductsTableProps) => {
  const headers = ["Produto", "Categoria", "Estoque", "Mínimo", "Status", "Valor Unitário", "Valor Total"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Todos os Produtos</CardTitle>
        <CardDescription>Lista completa do inventário com detalhes</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum produto encontrado no inventário.
          </div>
        ) : (
          <ResponsiveTable headers={headers}>
            {products.map((product) => {
              const status = getStockStatus(product);
              const totalValue = product.stock_quantity * (product.cost_price || 0);

              return (
                <ResponsiveTableRow
                  key={product.id}
                  mobileContent={
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <p className="font-medium">{product.name}</p>
                        <Badge variant={status.variant} className="flex-shrink-0">{status.label}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1">
                          <div><strong>Categoria:</strong> {product.categories?.name || '-'}</div>
                          <div><strong>Estoque:</strong> {product.stock_quantity}</div>
                          <div><strong>Mínimo:</strong> {product.minimum_stock}</div>
                          <div><strong>Unitário:</strong> {formatCurrency(product.cost_price || 0)}</div>
                      </div>
                      <div className="flex justify-end items-center mt-2 border-t pt-2">
                        <p className="text-right"><span className="font-semibold text-base">Total: {formatCurrency(totalValue)}</span></p>
                      </div>
                    </div>
                  }
                >
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.categories?.name || '-'}</TableCell>
                  <TableCell>{product.stock_quantity}</TableCell>
                  <TableCell>{product.minimum_stock}</TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(product.cost_price || 0)}</TableCell>
                  <TableCell>{formatCurrency(totalValue)}</TableCell>
                </ResponsiveTableRow>
              );
            })}
          </ResponsiveTable>
        )}
      </CardContent>
    </Card>
  );
};
