
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type Product = {
  id: string;
  name: string;
  categories: { name: string } | null;
  stock_quantity: number;
  minimum_stock: number;
  cost_price: string | null;
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Todos os Produtos</CardTitle>
        <CardDescription>Lista completa do inventário com detalhes</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Mínimo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valor Unitário</TableHead>
                  <TableHead>Valor Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const status = getStockStatus(product);
                  const totalValue = product.stock_quantity * Number(product.cost_price || 0);

                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.categories?.name || '-'}</TableCell>
                      <TableCell>{product.stock_quantity}</TableCell>
                      <TableCell>{product.minimum_stock}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(Number(product.cost_price || 0))}</TableCell>
                      <TableCell>{formatCurrency(totalValue)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
