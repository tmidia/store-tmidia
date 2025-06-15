
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Transaction {
  id: string;
  transaction_date: string;
  type: string;
  description: string;
  amount: number;
}

interface DebugInfo {
  periodo: {
    startDate: string;
    endDate: string;
  };
  vendasType: number;
  vendasDesc: number;
  allInPeriod: number;
}

interface DebugInfoCardProps {
  allTransactions?: Transaction[];
  cashSessions?: any[];
  debugInfo?: DebugInfo;
}

export const DebugInfoCard = ({ allTransactions, cashSessions, debugInfo }: DebugInfoCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-yellow-800">🔍 Informações de Debug</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <p><strong>Total de transações no sistema:</strong> {allTransactions?.length || 0}</p>
          <p><strong>Vendas no sistema:</strong> {allTransactions?.filter(t => t.type === 'venda').length || 0}</p>
          <p><strong>Sessões de caixa no período:</strong> {cashSessions?.length || 0}</p>
          {debugInfo && (
            <>
              <p><strong>Período consultado:</strong> {debugInfo.periodo.startDate} até {debugInfo.periodo.endDate}</p>
              <p><strong>Vendas por tipo "venda":</strong> {debugInfo.vendasType}</p>
              <p><strong>Vendas por descrição:</strong> {debugInfo.vendasDesc}</p>
              <p><strong>Todas transações no período:</strong> {debugInfo.allInPeriod}</p>
            </>
          )}
          
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
  );
};
