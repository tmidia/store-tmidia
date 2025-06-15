
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CashSession {
  id: string;
  opening_amount: number;
  closing_amount?: number;
  expected_amount?: number;
  difference?: number;
  opened_at: string;
  closed_at?: string;
  status: string;
}

interface CashSessionsCardProps {
  cashSessions: CashSession[];
}

export const CashSessionsCard = ({ cashSessions }: CashSessionsCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (!cashSessions || cashSessions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Sessões de Caixa
        </CardTitle>
        <CardDescription>
          Controle de abertura e fechamento do caixa no período selecionado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cashSessions.map((session) => {
            const totalVendas = (session.status === 'closed' && session.expected_amount)
              ? Number(session.expected_amount) - Number(session.opening_amount)
              : 0;

            return (
              <Card key={session.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Abertura</p>
                      <p className="text-lg font-semibold">{formatCurrency(Number(session.opening_amount))}</p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(session.opened_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                    
                    {session.status === 'closed' && (
                      <>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Total Vendas</p>
                          <p className="text-lg font-semibold text-cyan-600">{formatCurrency(totalVendas)}</p>
                          <p className="text-xs text-gray-400">&nbsp;</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Fechamento</p>
                          <p className="text-lg font-semibold">{formatCurrency(Number(session.closing_amount))}</p>
                          <p className="text-xs text-gray-400">
                            {session.closed_at && format(new Date(session.closed_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-500">Esperado</p>
                          <p className="text-lg font-semibold">{formatCurrency(Number(session.expected_amount))}</p>
                          <p className="text-xs text-gray-400">&nbsp;</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-500">Diferença</p>
                          <p className={`text-lg font-semibold ${Number(session.difference) === 0 ? 'text-green-600' : Number(session.difference) > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {formatCurrency(Number(session.difference))}
                          </p>
                          <p className="text-xs text-gray-400">
                            {Number(session.difference) === 0 ? 'Conferido' : Number(session.difference) > 0 ? 'Sobra' : 'Falta'}
                          </p>
                        </div>
                      </>
                    )}
                    
                    {session.status === 'open' && (
                      <div className="lg:col-span-4 md:col-span-2 sm:col-span-1 flex items-center">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                          Caixa Aberto
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </CardContent>
    </Card>
  );
};
