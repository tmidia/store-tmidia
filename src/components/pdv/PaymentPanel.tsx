
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Banknote, QrCode, CreditCard, Calculator } from 'lucide-react';

interface CartItem {
  id: string;
  preco: number;
  quantidade: number;
}

interface PaymentPanelProps {
  carrinho: CartItem[];
  desconto: number;
  onDescontoChange: (value: number) => void;
  formaPagamento: string;
  onFormaPagamentoChange: (value: string) => void;
  valorRecebido: string;
  onValorRecebidoChange: (value: string) => void;
  onFinalizarVenda: (dadosVenda: any) => void;
  caixaAberto: boolean;
}

const PaymentPanel = ({ 
  carrinho, 
  desconto, 
  onDescontoChange, 
  formaPagamento, 
  onFormaPagamentoChange, 
  valorRecebido, 
  onValorRecebidoChange, 
  onFinalizarVenda, 
  caixaAberto 
}: PaymentPanelProps) => {
  const formasPagamento = [
    { value: 'dinheiro', label: 'Dinheiro', icon: Banknote },
    { value: 'pix', label: 'PIX', icon: QrCode },
    { value: 'cartao', label: 'Cartão', icon: CreditCard },
    { value: 'misto', label: 'Misto', icon: Calculator },
  ];

  const subtotal = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  const valorDesconto = (subtotal * desconto) / 100;
  const total = subtotal - valorDesconto;
  const troco = parseFloat(valorRecebido) - total;

  const handleFinalizarVenda = () => {
    onFinalizarVenda({
      formaPagamento,
      valorRecebido,
      total,
      subtotal,
      desconto,
      valorDesconto,
      troco
    });
  };

  return (
    <Card className="border-0 shadow-md bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Resumo da Venda</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>R$ {subtotal.toFixed(2)}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="flex-1">Desconto (%):</span>
            <Input
              type="number"
              value={desconto}
              onChange={(e) => onDescontoChange(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
              className="w-20 h-8"
              min="0"
              max="100"
              disabled={!caixaAberto}
            />
          </div>

          {desconto > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Desconto:</span>
              <span>- R$ {valorDesconto.toFixed(2)}</span>
            </div>
          )}

          <Separator />
          
          <div className="flex justify-between text-lg font-semibold">
            <span>Total:</span>
            <span className="text-primary">R$ {total.toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">Forma de Pagamento:</label>
          <Select value={formaPagamento} onValueChange={onFormaPagamentoChange} disabled={!caixaAberto}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a forma de pagamento" />
            </SelectTrigger>
            <SelectContent>
              {formasPagamento.map(forma => (
                <SelectItem key={forma.value} value={forma.value}>
                  <div className="flex items-center space-x-2">
                    <forma.icon className="w-4 h-4" />
                    <span>{forma.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {formaPagamento === 'dinheiro' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor Recebido:</label>
              <Input
                type="number"
                step="0.01"
                value={valorRecebido}
                onChange={(e) => onValorRecebidoChange(e.target.value)}
                placeholder="0,00"
                disabled={!caixaAberto}
              />
              {valorRecebido && parseFloat(valorRecebido) >= total && (
                <div className="flex justify-between text-green-600">
                  <span>Troco:</span>
                  <span className="font-semibold">R$ {troco.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <Button 
          onClick={handleFinalizarVenda}
          className="w-full h-12 bg-primary hover:bg-blue-dark text-lg font-semibold"
          disabled={carrinho.length === 0 || !caixaAberto}
        >
          <DollarSign className="w-5 h-5 mr-2" />
          Finalizar Venda
        </Button>
      </CardContent>
    </Card>
  );
};

export default PaymentPanel;
