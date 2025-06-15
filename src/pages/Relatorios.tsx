
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, TrendingUp, Package, DollarSign, Calendar, Download } from 'lucide-react';
import { SalesReport } from '@/components/relatorios/SalesReport';
import { FinancialReport } from '@/components/relatorios/FinancialReport';
import { InventoryReport } from '@/components/relatorios/InventoryReport';
import { CustomReport } from '@/components/relatorios/CustomReport';

const Relatorios = () => {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-1">Análises e relatórios do sistema</p>
        </div>
      </div>

      <Tabs defaultValue="vendas" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vendas" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Vendas</span>
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Financeiro</span>
          </TabsTrigger>
          <TabsTrigger value="estoque" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Estoque</span>
          </TabsTrigger>
          <TabsTrigger value="customizado" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Personalizado</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vendas">
          <SalesReport />
        </TabsContent>

        <TabsContent value="financeiro">
          <FinancialReport />
        </TabsContent>

        <TabsContent value="estoque">
          <InventoryReport />
        </TabsContent>

        <TabsContent value="customizado">
          <CustomReport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Relatorios;
