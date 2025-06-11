
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { FinancialOverview } from '@/components/financeiro/FinancialOverview';
import { CashFlow } from '@/components/financeiro/CashFlow';
import { AccountsReceivable } from '@/components/financeiro/AccountsReceivable';
import { AccountsPayable } from '@/components/financeiro/AccountsPayable';
import { FinancialCategories } from '@/components/financeiro/FinancialCategories';

const Financeiro = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Financeiro</h2>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="cashflow" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Fluxo de Caixa
          </TabsTrigger>
          <TabsTrigger value="receivable" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Contas a Receber
          </TabsTrigger>
          <TabsTrigger value="payable" className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            Contas a Pagar
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            Categorias
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
