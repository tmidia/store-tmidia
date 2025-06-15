
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/formatters';
import { InventoryReportHeader } from './inventory/InventoryReportHeader';
import { InventoryKPIs } from './inventory/InventoryKPIs';
import { InventorySummaryCards } from './inventory/InventorySummaryCards';
import { InventoryProductsTable } from './inventory/InventoryProductsTable';

type Product = {
  id: string;
  name: string;
  stock_quantity: number;
  minimum_stock: number;
  cost_price: string | null;
  categories: { name: string } | null;
  suppliers: { name: string } | null;
};

type ValuableProduct = Product & {
  totalValue: number;
};

export const InventoryReport = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ['inventory-report', refreshTrigger],
    queryFn: async () => {
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (name),
          suppliers (name)
        `);

      if (error) throw error;
      
      const typedProducts: Product[] = products || [];

      const totalProducts = typedProducts.length;
      const lowStockProducts = typedProducts.filter(p => p.stock_quantity <= p.minimum_stock);
      const outOfStockProducts = typedProducts.filter(p => p.stock_quantity === 0);
      
      const totalValue = typedProducts.reduce((sum, p) => 
        sum + (p.stock_quantity * Number(p.cost_price || 0)), 0
      );

      const mostValuableProducts: ValuableProduct[] = typedProducts
        .map(p => ({
          ...p,
          totalValue: p.stock_quantity * Number(p.cost_price || 0)
        }))
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 10);

      return {
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        totalValue,
        mostValuableProducts,
        allProducts: typedProducts
      };
    }
  });

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const exportToPDF = () => {
    console.log('Exportando relatório de estoque para PDF...', {
      dados: inventoryData
    });
  };

  const getStockStatus = (product: { stock_quantity: number; minimum_stock: number; }) => {
    if (product.stock_quantity === 0) {
      return { label: 'Sem Estoque', variant: 'destructive' as const };
    } else if (product.stock_quantity <= product.minimum_stock) {
      return { label: 'Estoque Baixo', variant: 'secondary' as const };
    }
    return { label: 'Normal', variant: 'default' as const };
  };

  return (
    <div className="space-y-6">
      <InventoryReportHeader
        onRefresh={handleRefresh}
        onExport={exportToPDF}
        isDataAvailable={!!inventoryData}
      />
      
      {inventoryData && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Dados atualizados:</strong> {new Date().toLocaleString('pt-BR')}
          </p>
        </div>
      )}

      <InventoryKPIs
        totalProducts={inventoryData?.totalProducts || 0}
        totalValue={inventoryData?.totalValue || 0}
        lowStockCount={inventoryData?.lowStockProducts.length || 0}
        outOfStockCount={inventoryData?.outOfStockProducts.length || 0}
        formatCurrency={formatCurrency}
      />
      
      <InventorySummaryCards
        lowStockProducts={inventoryData?.lowStockProducts || []}
        mostValuableProducts={inventoryData?.mostValuableProducts || []}
        isLoading={isLoading}
        formatCurrency={formatCurrency}
      />

      <InventoryProductsTable
        products={inventoryData?.allProducts || []}
        isLoading={isLoading}
        getStockStatus={getStockStatus}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};
