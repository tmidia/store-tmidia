
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Tag } from 'lucide-react';
import { FinancialOverview } from '@/components/financeiro/FinancialOverview';
import { CashFlow } from '@/components/financeiro/CashFlow';
import { AccountsReceivable } from '@/components/financeiro/AccountsReceivable';
import { AccountsPayable } from '@/components/financeiro/AccountsPayable';
import { FinancialCategories } from '@/components/financeiro/FinancialCategories';

const Financeiro = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex-1 space-y-4 p-2 sm:p-4 md:p-8 pt-4 sm:pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Financeiro</h2>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto">
          <TabsTrigger value="overview" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Visão Geral</span>
            <span className="sm:hidden">Visão</span>
          </TabsTrigger>
          <TabsTrigger value="cashflow" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
            <Wallet className="w-4 h-4" />
            <span className="hidden sm:inline">Fluxo de Caixa</span>
            <span className="sm:hidden">Fluxo</span>
          </TabsTrigger>
          <TabsTrigger value="receivable" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Contas a Receber</span>
            <span className="sm:hidden">Receber</span>
          </TabsTrigger>
          <TabsTrigger value="payable" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
            <TrendingDown className="w-4 h-4" />
            <span className="hidden sm:inline">Contas a Pagar</span>
            <span className="sm:hidden">Pagar</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm col-span-2 sm:col-span-1">
            <Tag className="w-4 h-4" />
            <span>Categorias</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <FinancialOverview />
        </TabsContent>
        
        <TabsContent value="cashflow" className="space-y-4">
          <CashFlow />
        </TabsContent>
        
        <TabsContent value="receivable" className="space-y-4">
          <AccountsReceivable />
        </TabsContent>
        
        <TabsContent value="payable" className="space-y-4">
          <AccountsPayable />
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-4">
          <FinancialCategories />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Financeiro;
