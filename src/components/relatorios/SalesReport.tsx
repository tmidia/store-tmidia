import { useState } from 'react';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ptBR } from 'date-fns/locale';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';

import { DateFilters } from './components/DateFilters';
import { CashSessionsCard } from './components/CashSessionsCard';
import { DebugInfoCard } from './components/DebugInfoCard';
import { SalesKPICards } from './components/SalesKPICards';
import { PaymentMethodCards } from './components/PaymentMethodCards';
import { SalesChart } from './components/SalesChart';
import { NoDataCard } from './components/NoDataCard';

export const SalesReport = () => {
  const { isSuperAdmin } = useRoleBasedAccess();
  const [dateFrom, setDateFrom] = useState<Date>(startOfMonth(new Date()));
  const [dateTo, setDateTo] = useState<Date>(endOfMonth(new Date()));
  const [appliedDateFrom, setAppliedDateFrom] = useState<Date>(startOfMonth(new Date()));
  const [appliedDateTo, setAppliedDateTo] = useState<Date>(endOfMonth(new Date()));

  // Query para buscar sessões de caixa
  const { data: cashSessions } = useQuery({
    queryKey: ['cash-sessions', appliedDateFrom, appliedDateTo],
    queryFn: async () => {
      const startDate = format(appliedDateFrom, 'yyyy-MM-dd');
      const endDate = format(appliedDateTo, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('cash_sessions')
        .select('*')
        .gte('opened_at', startDate)
        .lte('opened_at', endDate + 'T23:59:59')
        .order('opened_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar sessões de caixa:', error);
        return [];
      }
      return (data || []) as unknown as Array<{ id: string; opening_amount: number; closing_amount: number; expected_amount: number; difference: number; opened_at: string; closed_at: string; status: string; user_id: string; created_at: string; updated_at: string }>;
    }
  });

  const sessionIds = cashSessions?.map(s => s.id) ?? [];

  const { data: sessionTransactions } = useQuery({
    queryKey: ['session-transactions', sessionIds],
    queryFn: async () => {
      if (!sessionIds.length) {
        return [];
      }
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('reference_id, type, amount')
        .in('reference_id', sessionIds)
        .eq('type', 'sangria');

      if (error) {
        console.error('Erro ao buscar transações de sangria:', error);
        return [];
      }
      return data || [];
    },
    enabled: sessionIds.length > 0,
  });

  // Query para buscar TODAS as transações (para debug)
  const { data: allTransactions } = useQuery({
    queryKey: ['all-transactions-debug'],
    queryFn: async () => {
      const { data: allData, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return [];
      return allData || [];
    }
  });

  const { data: salesData, isLoading, refetch } = useQuery({
    queryKey: ['sales-report', appliedDateFrom, appliedDateTo],
    queryFn: async () => {
      const startDate = format(appliedDateFrom, 'yyyy-MM-dd');
      const endDate = format(appliedDateTo, 'yyyy-MM-dd');
      
      console.log('🔍 Buscando vendas para o período:', { startDate, endDate });

      // Buscando na tabela sales real!
      const { data: vendas, error: vendasError } = await supabase
        .from('sales')
        .select('*, sale_items(*)')
        .gte('created_at', startDate + 'T00:00:00Z')
        .lte('created_at', endDate + 'T23:59:59Z')
        .order('created_at', { ascending: true });

      if (vendasError) {
        console.error('❌ Erro ao buscar vendas originais:', vendasError);
      }

      const transactions = vendas || [];

      if (transactions.length === 0) {
        return {
          chartData: [],
          totalVendas: 0,
          totalReceita: 0,
          ticketMedio: 0,
          paymentTotals: {},
          transactions: [],
          debugInfo: { period: { startDate, endDate }, count: 0 }
        };
      }

      // Agrupar por data (usando dia do created_at)
      const groupedData = transactions.reduce((acc: any, sale) => {
        const dateStr = sale.created_at ? sale.created_at.split('T')[0] : '';
        if (!dateStr) return acc;
        
        if (!acc[dateStr]) {
          acc[dateStr] = { date: dateStr, vendas: 0, receita: 0 };
        }
        acc[dateStr].vendas += 1;
        acc[dateStr].receita += Number(sale.total_amount || 0);
        return acc;
      }, {});

      const chartData = Object.values(groupedData).map((item: any) => ({
        ...item,
        date: format(new Date(item.date), 'dd/MM', { locale: ptBR })
      }));

      // Calcular totais por forma de pagamento
      const paymentTotals = transactions.reduce((acc: any, sale) => {
        let paymentMethod = sale.payment_method || 'outros';
        
        if (!acc[paymentMethod]) {
          acc[paymentMethod] = { total: 0, count: 0 };
        }
        acc[paymentMethod].total += Number(sale.total_amount || 0);
        acc[paymentMethod].count += 1;
        return acc;
      }, {});

      const totalVendas = transactions.length;
      const totalReceita = transactions.reduce((sum, t) => sum + Number(t.total_amount || 0), 0);
      const ticketMedio = totalVendas > 0 ? totalReceita / totalVendas : 0;

      return {
        chartData,
        totalVendas,
        totalReceita,
        ticketMedio,
        paymentTotals,
        transactions,
        debugInfo: { period: { startDate, endDate }, count: totalVendas }
      };
    }
  });

  const handleSearch = () => {
    setAppliedDateFrom(dateFrom);
    setAppliedDateTo(dateTo);
  };

  const exportToPDF = () => {
    console.log('Exportando...');
  };

  return (
    <div className="space-y-6">
      <DateFilters
        dateFrom={dateFrom}
        dateTo={dateTo}
        appliedDateFrom={appliedDateFrom}
        appliedDateTo={appliedDateTo}
        totalVendas={salesData?.totalVendas}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onSearch={handleSearch}
        onExportToPDF={exportToPDF}
        hasData={!!salesData}
      />

      <CashSessionsCard
        cashSessions={cashSessions || []}
        sessionTransactions={sessionTransactions || []}
      />

      {isSuperAdmin() && (
        <DebugInfoCard 
          allTransactions={allTransactions}
          cashSessions={cashSessions}
          debugInfo={salesData?.debugInfo}
        />
      )}

      <SalesKPICards
        totalVendas={salesData?.totalVendas || 0}
        totalReceita={salesData?.totalReceita || 0}
        ticketMedio={salesData?.ticketMedio || 0}
      />

      <PaymentMethodCards paymentTotals={salesData?.paymentTotals || {}} />

      <SalesChart 
        chartData={salesData?.chartData || []}
        isLoading={isLoading}
      />

      {salesData?.totalVendas === 0 && (
        <NoDataCard
          appliedDateFrom={appliedDateFrom}
          appliedDateTo={appliedDateTo}
          transactionsLength={salesData?.transactions?.length || 0}
        />
      )}
    </div>
  );
};
