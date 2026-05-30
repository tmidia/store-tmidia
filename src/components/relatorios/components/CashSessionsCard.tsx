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
  created_at: string;
  closed_at?: string;
  status: string;
}

interface SessionTransaction {
  reference_id: string | null;
  type: string;
  amount: number;
}

interface CashSessionsCardProps {
  cashSessions: CashSession[];
  sessionTransactions: SessionTransaction[];
}

export const CashSessionsCard = ({ cashSessions, sessionTransactions }: CashSessionsCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formata data com segurança: datas nulas/inválidas não derrubam a tela.
  const safeDateTime = (value?: string | null) => {
    if (!value) return '';
    const d = new Date(value);
    return isNaN(d.getTime()) ? '' : format(d, 'dd/MM/yyyy HH:mm', { locale: ptBR });
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
            const sangriasDaSessao = sessionTransactions.filter(t => t.reference_id === session.id);
            const totalSangrias = sangriasDaSessao.reduce((sum, s) => sum + Number(s.amount), 0);

            const totalVendas = (session.status === 'fechada' && session.expected_amount != null && session.opening_amount != null)
              ? Number(session.expected_amount) - Number(session.opening_amount) + totalSangrias
              : 0;

            return (
              <Card key={session.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Abertura</p>
                      <p className="text-lg font-semibold">{formatCurrency(Number(session.opening_amount))}</p>
                      <p className="text-xs text-gray-400">
                        {safeDateTime(session.created_at)}
                      </p>
                    </div>
                    
                    {session.status === 'fechada' && (
                      <>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Total Vendas</p>
                          <p className="text-lg font-semibold text-cyan-600">{formatCurrency(totalVendas)}</p>
                          <p className="text-xs text-gray-400">&nbsp;</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Sangrias</p>
                          <p className="text-lg font-semibold text-orange-600">{formatCurrency(totalSangrias)}</p>
                          <p className="text-xs text-gray-400">&nbsp;</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-500">Fechamento</p>
                          <p className="text-lg font-semibold">{formatCurrency(Number(session.closing_amount))}</p>
                          <p className="text-xs text-gray-400">
                            {safeDateTime(session.closed_at)}
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
                    
                    {session.status === 'aberta' && (
                      <div className="lg:col-span-5 md:col-span-2 sm:col-span-1 flex items-center">
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
