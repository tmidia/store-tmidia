
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
    <div className="flex-1 w-full max-w-full overflow-hidden">
      <div className="space-y-4 p-3 sm:p-4 md:p-6 lg:p-8 w-full">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Financeiro</h2>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 w-full">
          <div className="w-full overflow-x-auto">
            <TabsList className="grid grid-cols-5 w-full min-w-max h-auto gap-1 p-1">
              <TabsTrigger 
                value="overview" 
                className="flex flex-col items-center gap-1 p-2 min-w-[70px] text-xs font-medium"
              >
                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="leading-tight text-center">Visão</span>
              </TabsTrigger>
              <TabsTrigger 
                value="cashflow" 
                className="flex flex-col items-center gap-1 p-2 min-w-[70px] text-xs font-medium"
              >
                <Wallet className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="leading-tight text-center">Fluxo</span>
              </TabsTrigger>
              <TabsTrigger 
                value="receivable" 
                className="flex flex-col items-center gap-1 p-2 min-w-[70px] text-xs font-medium"
              >
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="leading-tight text-center">Receber</span>
              </TabsTrigger>
              <TabsTrigger 
                value="payable" 
                className="flex flex-col items-center gap-1 p-2 min-w-[70px] text-xs font-medium"
              >
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="leading-tight text-center">Pagar</span>
              </TabsTrigger>
              <TabsTrigger 
                value="categories" 
                className="flex flex-col items-center gap-1 p-2 min-w-[90px] text-xs font-medium"
              >
                <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="leading-tight text-center">Categorias</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="w-full overflow-hidden">
            <TabsContent value="overview" className="space-y-4 m-0">
              <FinancialOverview />
            </TabsContent>
            
            <TabsContent value="cashflow" className="space-y-4 m-0">
              <CashFlow />
            </TabsContent>
            
            <TabsContent value="receivable" className="space-y-4 m-0">
              <AccountsReceivable />
            </TabsContent>
            
            <TabsContent value="payable" className="space-y-4 m-0">
              <AccountsPayable />
            </TabsContent>
            
            <TabsContent value="categories" className="space-y-4 m-0">
              <FinancialCategories />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Financeiro;
