
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const FinancialOverview = () => {
  const currentDate = new Date();
  const startMonth = startOfMonth(currentDate);
  const endMonth = endOfMonth(currentDate);

  // Buscar dados financeiros do mês atual
  const { data: monthlyData } = useQuery({
    queryKey: ['financial-overview', format(currentDate, 'yyyy-MM')],
    queryFn: async () => {
      const [receivableResponse, payableResponse, transactionsResponse] = await Promise.all([
        supabase
          .from('accounts_receivable')
          .select('amount, paid_amount, status')
          .gte('due_date', format(startMonth, 'yyyy-MM-dd'))
          .lte('due_date', format(endMonth, 'yyyy-MM-dd')),
        
        supabase
          .from('accounts_payable')
          .select('amount, paid_amount, status')
          .gte('due_date', format(startMonth, 'yyyy-MM-dd'))
          .lte('due_date', format(endMonth, 'yyyy-MM-dd')),
        
        supabase
          .from('financial_transactions')
          .select('type, amount')
          .gte('transaction_date', format(startMonth, 'yyyy-MM-dd'))
          .lte('transaction_date', format(endMonth, 'yyyy-MM-dd'))
      ]);

      const receivable = receivableResponse.data || [];
      const payable = payableResponse.data || [];
      const transactions = transactionsResponse.data || [];

      // Calcular totais
      const totalReceivable = receivable.reduce((sum, item) => sum + (item.amount || 0), 0);
      const receivedAmount = receivable.reduce((sum, item) => sum + (item.paid_amount || 0), 0);
      const pendingReceivable = receivable
        .filter(item => item.status === 'pendente')
        .reduce((sum, item) => sum + (item.amount - (item.paid_amount || 0)), 0);

      const totalPayable = payable.reduce((sum, item) => sum + (item.amount || 0), 0);
      const paidAmount = payable.reduce((sum, item) => sum + (item.paid_amount || 0), 0);
      const pendingPayable = payable
        .filter(item => item.status === 'pendente')
        .reduce((sum, item) => sum + (item.amount - (item.paid_amount || 0)), 0);

      const totalRevenue = transactions
        .filter(t => ['entrada', 'venda', 'recebimento'].includes(t.type))
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const totalExpenses = transactions
        .filter(t => ['saida', 'pagamento'].includes(t.type))
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      return {
        totalReceivable,
        receivedAmount,
        pendingReceivable,
        totalPayable,
        paidAmount,
        pendingPayable,
        totalRevenue,
        totalExpenses,
        netResult: totalRevenue - totalExpenses
      };
    }
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5" />
        <h3 className="text-lg font-semibold">
          Resumo de {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
        </h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(monthlyData?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Entradas e vendas realizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(monthlyData?.totalExpenses || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Saídas e pagamentos realizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resultado Líquido</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              (monthlyData?.netResult || 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(monthlyData?.netResult || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Receitas - Despesas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas Pendentes</CardTitle>
            <Wallet className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-sm">
                <span className="text-green-600 font-medium">A receber: </span>
                {formatCurrency(monthlyData?.pendingReceivable || 0)}
              </div>
              <div className="text-sm">
                <span className="text-red-600 font-medium">A pagar: </span>
                {formatCurrency(monthlyData?.pendingPayable || 0)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
