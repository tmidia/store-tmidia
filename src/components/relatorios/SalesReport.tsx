import { useState } from 'react';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ptBR } from 'date-fns/locale';

import { DateFilters } from './components/DateFilters';
import { CashSessionsCard } from './components/CashSessionsCard';
import { DebugInfoCard } from './components/DebugInfoCard';
import { SalesKPICards } from './components/SalesKPICards';
import { PaymentMethodCards } from './components/PaymentMethodCards';
import { SalesChart } from './components/SalesChart';
import { NoDataCard } from './components/NoDataCard';

export const SalesReport = () => {
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
      
      console.log('🏦 Buscando sessões de caixa para o período:', { startDate, endDate });

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

      console.log('🏦 Sessões de caixa encontradas:', data);
      return data || [];
    }
  });

  // Query para buscar TODAS as transações (para debug)
  const { data: allTransactions } = useQuery({
    queryKey: ['all-transactions-debug'],
    queryFn: async () => {
      console.log('🔍 Buscando TODAS as transações para debug...');
      
      const { data: allData, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar todas as transações:', error);
        return [];
      }

      console.log('📊 TODAS as transações encontradas:', allData);
      console.log('📊 Total de transações:', allData?.length || 0);
      
      // Filtrar apenas vendas para mostrar no debug
      const vendas = allData?.filter(t => t.type === 'venda') || [];
      console.log('💰 Transações de venda encontradas:', vendas);
      console.log('💰 Total de vendas:', vendas.length);

      return allData || [];
    }
  });

  const { data: salesData, isLoading, refetch } = useQuery({
    queryKey: ['sales-report', appliedDateFrom, appliedDateTo],
    queryFn: async () => {
      const startDate = format(appliedDateFrom, 'yyyy-MM-dd');
      const endDate = format(appliedDateTo, 'yyyy-MM-dd');
      
      console.log('🔍 Buscando vendas para o período:', {
        inicio: startDate,
        fim: endDate,
        appliedDateFrom,
        appliedDateTo
      });

      // Primeira consulta: buscar por tipo 'venda'
      const { data: vendasType, error: vendasError } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('type', 'venda')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate)
        .order('transaction_date', { ascending: true });

      console.log('💰 Resultado busca por type="venda":', vendasType);
      
      // Segunda consulta: buscar por descrição contendo 'Venda'
      const { data: vendasDesc, error: descError } = await supabase
        .from('financial_transactions')
        .select('*')
        .ilike('description', '%venda%')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate)
        .order('transaction_date', { ascending: true });

      console.log('💰 Resultado busca por description contendo "venda":', vendasDesc);

      // Terceira consulta: buscar TODAS as transações no período
      const { data: allInPeriod, error: allError } = await supabase
        .from('financial_transactions')
        .select('*')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate)
        .order('transaction_date', { ascending: true });

      console.log('📊 TODAS as transações no período:', allInPeriod);

      if (vendasError) {
        console.error('❌ Erro ao buscar vendas por tipo:', vendasError);
      }
      if (descError) {
        console.error('❌ Erro ao buscar vendas por descrição:', descError);
      }
      if (allError) {
        console.error('❌ Erro ao buscar todas as transações:', allError);
      }

      // Usar a consulta que retornou mais resultados
      let transactions = vendasType || [];
      if (vendasDesc && vendasDesc.length > transactions.length) {
        transactions = vendasDesc;
      }

      console.log('📊 Transações selecionadas para processamento:', transactions);

      if (!transactions || transactions.length === 0) {
        console.log('⚠️ Nenhuma transação encontrada para o período');
        return {
          chartData: [],
          totalVendas: 0,
          totalReceita: 0,
          ticketMedio: 0,
          paymentTotals: {},
          transactions: [],
          debugInfo: {
            periodo: { startDate, endDate },
            vendasType: vendasType?.length || 0,
            vendasDesc: vendasDesc?.length || 0,
            allInPeriod: allInPeriod?.length || 0
          }
        };
      }

      // Agrupar por data
      const groupedData = transactions.reduce((acc: any, transaction) => {
        const date = transaction.transaction_date;
        if (!acc[date]) {
          acc[date] = { date, vendas: 0, receita: 0 };
        }
        acc[date].vendas += 1;
        acc[date].receita += Number(transaction.amount || 0);
        return acc;
      }, {});

      const chartData = Object.values(groupedData).map((item: any) => ({
        ...item,
        date: format(new Date(item.date), 'dd/MM', { locale: ptBR })
      }));

      // Calcular totais por forma de pagamento
      const paymentTotals = transactions.reduce((acc: any, transaction) => {
        let paymentMethod = 'outros';
        
        try {
          if (transaction.notes) {
            const notes = JSON.parse(transaction.notes);
            paymentMethod = notes.forma_pagamento || 'outros';
          }
        } catch (e) {
          console.log('Erro ao fazer parse das notes:', e);
        }

        if (!acc[paymentMethod]) {
          acc[paymentMethod] = { total: 0, count: 0 };
        }
        acc[paymentMethod].total += Number(transaction.amount || 0);
        acc[paymentMethod].count += 1;
        return acc;
      }, {});

      const totalVendas = transactions.length;
      const totalReceita = transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const ticketMedio = totalVendas > 0 ? totalReceita / totalVendas : 0;

      console.log('Dados processados:', {
        totalVendas,
        totalReceita,
        ticketMedio,
        paymentTotals
      });

      return {
        chartData,
        totalVendas,
        totalReceita,
        ticketMedio,
        paymentTotals,
        transactions,
        debugInfo: {
          periodo: { startDate, endDate },
          vendasType: vendasType?.length || 0,
          vendasDesc: vendasDesc?.length || 0,
          allInPeriod: allInPeriod?.length || 0
        }
      };
    }
  });

  const handleSearch = () => {
    console.log('Aplicando filtros:', {
      dateFrom: format(dateFrom, 'yyyy-MM-dd'),
      dateTo: format(dateTo, 'yyyy-MM-dd')
    });
    
    setAppliedDateFrom(dateFrom);
    setAppliedDateTo(dateTo);
  };

  const exportToPDF = () => {
    console.log('Exportando relatório de vendas para PDF...', {
      periodo: {
        inicio: format(appliedDateFrom, 'dd/MM/yyyy'),
        fim: format(appliedDateTo, 'dd/MM/yyyy')
      },
      dados: salesData
    });
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

      <CashSessionsCard cashSessions={cashSessions || []} />

      <DebugInfoCard 
        allTransactions={allTransactions}
        cashSessions={cashSessions}
        debugInfo={salesData?.debugInfo}
      />

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
