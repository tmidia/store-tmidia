
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Package, AlertTriangle, TrendingDown, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const InventoryReport = () => {
  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ['inventory-report'],
    queryFn: async () => {
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (name),
          suppliers (name)
        `);

      if (error) throw error;

      const totalProducts = products?.length || 0;
      const lowStockProducts = products?.filter(p => p.stock_quantity <= p.minimum_stock) || [];
      const outOfStockProducts = products?.filter(p => p.stock_quantity === 0) || [];
      
      const totalValue = products?.reduce((sum, p) => 
        sum + (p.stock_quantity * Number(p.cost_price || 0)), 0
      ) || 0;

      // Produtos mais valiosos
      const mostValuableProducts = products
        ?.map(p => ({
          ...p,
          totalValue: p.stock_quantity * Number(p.cost_price || 0)
        }))
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 10) || [];

      return {
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        totalValue,
        mostValuableProducts,
        allProducts: products || []
      };
    }
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStockStatus = (product: any) => {
    if (product.stock_quantity === 0) {
      return { label: 'Sem Estoque', variant: 'destructive' as const };
    } else if (product.stock_quantity <= product.minimum_stock) {
      return { label: 'Estoque Baixo', variant: 'secondary' as const };
    }
    return { label: 'Normal', variant: 'default' as const };
  };

  return (
    <div className="space-y-6">
      {/* Header com botão de exportação */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Relatório de Estoque</h2>
          <p className="text-sm text-muted-foreground">Análise completa do inventário</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Exportar PDF
        </Button>
      </div>

      {/* KPIs de Estoque */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryData?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">produtos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(inventoryData?.totalValue || 0)}</div>
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
              {inventoryData?.lowStockProducts.length || 0}
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
              {inventoryData?.outOfStockProducts.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">produtos zerados</p>
          </CardContent>
        </Card>
      </div>

      {/* Produtos com Estoque Baixo ou Zerado */}
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
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {inventoryData?.lowStockProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum produto com estoque baixo</p>
                ) : (
                  inventoryData?.lowStockProducts.slice(0, 5).map((product: any) => (
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
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {inventoryData?.mostValuableProducts.slice(0, 5).map((product: any) => (
                  <div key={product.id} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Qtd: {product.stock_quantity} × {formatCurrency(Number(product.cost_price || 0))}
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

      {/* Tabela Completa */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Produtos</CardTitle>
          <CardDescription>Lista completa do inventário com detalhes</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
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
                  {inventoryData?.allProducts.map((product: any) => {
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
    </div>
  );
};
