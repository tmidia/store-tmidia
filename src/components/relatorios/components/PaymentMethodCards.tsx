
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CreditCard, Banknote, QrCode, DollarSign } from 'lucide-react';

const paymentColors = {
  dinheiro: "#10b981",
  cartao_credito: "#3b82f6", 
  cartao_debito: "#06b6d4",
  pix: "#f59e0b",
  misto: "#8b5cf6",
  // Manter compatibilidade com registros antigos
  cartao: "#3b82f6"
};

interface PaymentTotals {
  [key: string]: {
    total: number;
    count: number;
  };
}

interface PaymentMethodCardsProps {
  paymentTotals: PaymentTotals;
}

export const PaymentMethodCards = ({ paymentTotals }: PaymentMethodCardsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'dinheiro': return <Banknote className="w-4 h-4" />;
      case 'cartao_credito': return <CreditCard className="w-4 h-4" />;
      case 'cartao_debito': return <CreditCard className="w-4 h-4" />;
      case 'cartao': return <CreditCard className="w-4 h-4" />;
      case 'pix': return <QrCode className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'dinheiro': return 'Dinheiro';
      case 'cartao_credito': return 'Cartão de Crédito';
      case 'cartao_debito': return 'Cartão de Débito';
      case 'cartao': return 'Cartão (legado)';
      case 'pix': return 'PIX';
      case 'misto': return 'Misto';
      default: return 'Outros';
    }
  };

  if (!paymentTotals || Object.keys(paymentTotals).length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas por Forma de Pagamento</CardTitle>
        <CardDescription>Distribuição das vendas conforme meio de pagamento</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(paymentTotals).map(([method, data]: [string, any]) => (
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
  );
};
