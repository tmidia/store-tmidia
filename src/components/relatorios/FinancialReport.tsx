
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, TrendingUp, TrendingDown, DollarSign, CreditCard, Search } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';

const chartConfig = {
  receitas: { label: "Receitas", color: "#10b981" },
  despesas: { label: "Despesas", color: "#ef4444" },
  resultado: { label: "Resultado", color: "#3b82f6" }
};

export const FinancialReport = () => {
  const [dateFrom, setDateFrom] = useState<Date>(startOfMonth(new Date()));
  const [dateTo, setDateTo] = useState<Date>(endOfMonth(new Date()));
  const [appliedDateFrom, setAppliedDateFrom] = useState<Date>(startOfMonth(new Date()));
  const [appliedDateTo, setAppliedDateTo] = useState<Date>(endOfMonth(new Date()));

  const { data: financialData, isLoading } = useQuery({
    queryKey: ['financial-report', appliedDateFrom, appliedDateTo],
    queryFn: async () => {
      const [transactionsResponse, receivableResponse, payableResponse] = await Promise.all([
        supabase
          .from('financial_transactions')
          .select('*')
          .gte('transaction_date', format(appliedDateFrom, 'yyyy-MM-dd'))
          .lte('transaction_date', format(appliedDateTo, 'yyyy-MM-dd')),
        
        supabase
          .from('accounts_receivable')
          .select('*')
          .gte('due_date', format(appliedDateFrom, 'yyyy-MM-dd'))
          .lte('due_date', format(appliedDateTo, 'yyyy-MM-dd')),
        
        supabase
          .from('accounts_payable')
          .select('*')
          .gte('due_date', format(appliedDateFrom, 'yyyy-MM-dd'))
          .lte('due_date', format(appliedDateTo, 'yyyy-MM-dd'))
      ]);

      const transactions = transactionsResponse.data || [];
      const receivables = receivableResponse.data || [];
      const payables = payableResponse.data || [];

      // Calcular totais
      const totalReceitas = transactions
        .filter(t => ['entrada', 'venda', 'recebimento'].includes(t.type))
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      const totalDespesas = transactions
        .filter(t => ['saida', 'pagamento'].includes(t.type))
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      const contasAReceber = receivables
        .filter(r => r.status === 'pendente')
        .reduce((sum, r) => sum + Number(r.remaining_amount || 0), 0);

      const contasAPagar = payables
        .filter(p => p.status === 'pendente')
        .reduce((sum, p) => sum + Number(p.remaining_amount || 0), 0);

      // Dados para gráfico de pizza
      const pieData = [
        { name: 'Receitas', value: totalReceitas, color: chartConfig.receitas.color },
        { name: 'Despesas', value: totalDespesas, color: chartConfig.despesas.color }
      ];

      // Evolução financeira por dia
      const dailyData = transactions.reduce((acc: any, transaction) => {
        const date = transaction.transaction_date;
        if (!acc[date]) {
          acc[date] = { date, receitas: 0, despesas: 0, resultado: 0 };
        }
        
        if (['entrada', 'venda', 'recebimento'].includes(transaction.type)) {
          acc[date].receitas += Number(transaction.amount || 0);
        } else if (['saida', 'pagamento'].includes(transaction.type)) {
          acc[date].despesas += Number(transaction.amount || 0);
        }
        
        acc[date].resultado = acc[date].receitas - acc[date].despesas;
        return acc;
      }, {});

      const chartData = Object.values(dailyData).map((item: any) => ({
        ...item,
        date: format(new Date(item.date), 'dd/MM', { locale: ptBR })
      }));

      return {
        totalReceitas,
        totalDespesas,
        resultado: totalReceitas - totalDespesas,
        contasAReceber,
        contasAPagar,
        pieData,
        chartData
      };
    }
  });

  const handleSearch = () => {
    setAppliedDateFrom(dateFrom);
    setAppliedDateTo(dateTo);
  };

  const exportToPDF = () => {
    console.log('Exportando relatório financeiro para PDF...', {
      periodo: {
        inicio: format(appliedDateFrom, 'dd/MM/yyyy'),
        fim: format(appliedDateTo, 'dd/MM/yyyy')
      },
      dados: financialData
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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
              disabled={!financialData}
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* KPIs Financeiros */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(financialData?.totalReceitas || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(financialData?.totalDespesas || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resultado</CardTitle>
            <DollarSign className={`h-4 w-4 ${(financialData?.resultado || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(financialData?.resultado || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(financialData?.resultado || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas Pendentes</CardTitle>
            <CreditCard className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-xs">
                <span className="text-green-600 font-medium">A receber: </span>
                <span className="text-xs">{formatCurrency(financialData?.contasAReceber || 0)}</span>
              </div>
              <div className="text-xs">
                <span className="text-red-600 font-medium">A pagar: </span>
                <span className="text-xs">{formatCurrency(financialData?.contasAPagar || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição Financeira</CardTitle>
            <CardDescription>Receitas vs Despesas no período</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={financialData?.pieData || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {financialData?.pieData?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolução Financeira</CardTitle>
            <CardDescription>Resultado financeiro por dia</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={financialData?.chartData || []}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="resultado" 
                      stroke={chartConfig.resultado.color} 
                      strokeWidth={2}
                      name="Resultado"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
