import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, TrendingUp, DollarSign, ShoppingCart, Search, CreditCard, Banknote, QrCode } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const chartConfig = {
  vendas: { label: "Vendas", color: "#3b82f6" },
  receita: { label: "Receita", color: "#10b981" }
};

const paymentColors = {
  dinheiro: "#10b981",
  cartao: "#3b82f6", 
  pix: "#f59e0b",
  misto: "#8b5cf6"
};

export const SalesReport = () => {
  const [dateFrom, setDateFrom] = useState<Date>(startOfMonth(new Date()));
  const [dateTo, setDateTo] = useState<Date>(endOfMonth(new Date()));
  const [appliedDateFrom, setAppliedDateFrom] = useState<Date>(startOfMonth(new Date()));
  const [appliedDateTo, setAppliedDateTo] = useState<Date>(endOfMonth(new Date()));

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'dinheiro': return <Banknote className="w-4 h-4" />;
      case 'cartao': return <CreditCard className="w-4 h-4" />;
      case 'pix': return <QrCode className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'dinheiro': return 'Dinheiro';
      case 'cartao': return 'Cartão';
      case 'pix': return 'PIX';
      case 'misto': return 'Misto';
      default: return 'Outros';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros de Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Período de Análise
          </CardTitle>
          <CardDescription>
            Selecione o período desejado e clique em "Buscar" para aplicar os filtros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Inicial</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
                    {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateFrom} onSelect={(date) => date && setDateFrom(date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Final</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateTo && "text-muted-foreground")}>
                    {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateTo} onSelect={(date) => date && setDateTo(date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <Button onClick={handleSearch} className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Buscar
            </Button>

            <Button 
              onClick={exportToPDF} 
              variant="outline" 
              className="flex items-center gap-2"
              disabled={!salesData}
            >
              <Download className="w-4 h-4" />
              Exportar PDF
            </Button>
          </div>

          {appliedDateFrom && appliedDateTo && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Período aplicado:</strong> {format(appliedDateFrom, 'dd/MM/yyyy', { locale: ptBR })} até {format(appliedDateTo, 'dd/MM/yyyy', { locale: ptBR })}
              </p>
              {salesData && (
                <p className="text-xs text-blue-600 mt-1">
                  Encontradas {salesData.totalVendas} vendas no período
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Information */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">🔍 Informações de Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Total de transações no sistema:</strong> {allTransactions?.length || 0}</p>
            <p><strong>Vendas no sistema:</strong> {allTransactions?.filter(t => t.type === 'venda').length || 0}</p>
            {salesData?.debugInfo && (
              <>
                <p><strong>Período consultado:</strong> {salesData.debugInfo.periodo.startDate} até {salesData.debugInfo.periodo.endDate}</p>
                <p><strong>Vendas por tipo "venda":</strong> {salesData.debugInfo.vendasType}</p>
                <p><strong>Vendas por descrição:</strong> {salesData.debugInfo.vendasDesc}</p>
                <p><strong>Todas transações no período:</strong> {salesData.debugInfo.allInPeriod}</p>
              </>
            )}
            
            {/* Mostrar algumas transações recentes */}
            {allTransactions && allTransactions.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-yellow-800 mb-2">Últimas 5 transações:</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allTransactions.slice(0, 5).map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.transaction_date}</TableCell>
                        <TableCell>{transaction.type}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{formatCurrency(Number(transaction.amount))}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* KPIs de Vendas */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesData?.totalVendas || 0}</div>
            <p className="text-xs text-muted-foreground">transações no período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salesData?.totalReceita || 0)}</div>
            <p className="text-xs text-muted-foreground">no período selecionado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salesData?.ticketMedio || 0)}</div>
            <p className="text-xs text-muted-foreground">por transação</p>
          </CardContent>
        </Card>
      </div>

      {/* Vendas por Forma de Pagamento */}
      {salesData?.paymentTotals && Object.keys(salesData.paymentTotals).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Forma de Pagamento</CardTitle>
            <CardDescription>Distribuição das vendas conforme meio de pagamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(salesData.paymentTotals).map(([method, data]: [string, any]) => (
                <Card key={method} className="border-l-4" style={{ borderLeftColor: paymentColors[method as keyof typeof paymentColors] || '#6b7280' }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(method)}
                        <span className="text-sm font-medium">{getPaymentMethodLabel(method)}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-bold">{formatCurrency(data.total)}</div>
                      <p className="text-xs text-muted-foreground">{data.count} transação(ões)</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráfico de Vendas */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução das Vendas</CardTitle>
          <CardDescription>Vendas e receita por dia no período selecionado</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData?.chartData || []}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="vendas" fill={chartConfig.vendas.color} name="Vendas" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Debug - Mostrar transações encontradas se não houver dados */}
      {salesData?.totalVendas === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Debug - Informações de Busca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Período consultado:</strong> {format(appliedDateFrom, 'yyyy-MM-dd')} até {format(appliedDateTo, 'yyyy-MM-dd')}</p>
              <p><strong>Transações encontradas:</strong> {salesData?.transactions?.length || 0}</p>
              <p className="text-orange-600">
                Nenhuma venda encontrada no período. Verifique se há vendas registradas nas datas selecionadas.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
