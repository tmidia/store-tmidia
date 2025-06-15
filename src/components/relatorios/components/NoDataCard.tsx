
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface NoDataCardProps {
  appliedDateFrom: Date;
  appliedDateTo: Date;
  transactionsLength: number;
}

export const NoDataCard = ({ appliedDateFrom, appliedDateTo, transactionsLength }: NoDataCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Debug - Informações de Busca</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <p><strong>Período consultado:</strong> {format(appliedDateFrom, 'yyyy-MM-dd')} até {format(appliedDateTo, 'yyyy-MM-dd')}</p>
          <p><strong>Transações encontradas:</strong> {transactionsLength}</p>
          <p className="text-orange-600">
            Nenhuma venda encontrada no período. Verifique se há vendas registradas nas datas selecionadas.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
