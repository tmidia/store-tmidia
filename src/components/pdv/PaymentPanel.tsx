import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Banknote, QrCode, CreditCard, Calculator, X } from 'lucide-react';
import ReceiptModal from './ReceiptModal';
import { useSystemParameters } from '@/hooks/useSystemParameters';
import { useState } from 'react';

interface CartItem {
  id: string;
  preco: number;
  quantidade: number;
  nome: string;
  codigo: string;
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
  isOpen: boolean;
  onClose: () => void;
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
  caixaAberto,
  isOpen,
  onClose
}: PaymentPanelProps) => {
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastSaleData, setLastSaleData] = useState<any>(null);
  const { isReceiptPrintingEnabled, isManualDiscountAllowed } = useSystemParameters();

  const classicCard = "group-[.pdv-classic]:bg-slate-300 group-[.pdv-classic]:border-2 group-[.pdv-classic]:border-t-slate-200 group-[.pdv-classic]:border-l-slate-200 group-[.pdv-classic]:border-b-slate-500 group-[.pdv-classic]:border-r-slate-500 group-[.pdv-classic]:shadow-none group-[.pdv-classic]:rounded-none group-[.pdv-classic]:text-black";
  const classicInput = "group-[.pdv-classic]:bg-white group-[.pdv-classic]:border-2 group-[.pdv-classic]:border-t-slate-600 group-[.pdv-classic]:border-l-slate-600 group-[.pdv-classic]:border-b-slate-200 group-[.pdv-classic]:border-r-slate-200 group-[.pdv-classic]:shadow-inner group-[.pdv-classic]:rounded-none group-[.pdv-classic]:text-black";
  const classicButton = "group-[.pdv-classic]:bg-slate-300 group-[.pdv-classic]:border-2 group-[.pdv-classic]:border-t-slate-200 group-[.pdv-classic]:border-l-slate-200 group-[.pdv-classic]:border-b-slate-500 group-[.pdv-classic]:border-r-slate-500 group-[.pdv-classic]:text-black group-[.pdv-classic]:shadow-none group-[.pdv-classic]:rounded-none group-[.pdv-classic]:hover:bg-slate-400 group-[.pdv-classic]:active:border-t-slate-500 group-[.pdv-classic]:active:border-l-slate-500 group-[.pdv-classic]:active:border-b-slate-200 group-[.pdv-classic]:active:border-r-slate-200";
  
  const formasPagamento = [
    { value: 'dinheiro', label: 'Dinheiro', icon: Banknote },
    { value: 'pix', label: 'PIX', icon: QrCode },
    { value: 'cartao_credito', label: 'Cartão de Crédito', icon: CreditCard },
    { value: 'cartao_debito', label: 'Cartão de Débito', icon: CreditCard },
    { value: 'misto', label: 'Misto', icon: Calculator },
  ];

  const subtotal = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  const valorDesconto = (subtotal * desconto) / 100;
  const total = subtotal - valorDesconto;
  const troco = parseFloat(valorRecebido) - total;

  const handleFinalizarVenda = () => {
    const dadosVenda = {
      formaPagamento,
      valorRecebido,
      total,
      subtotal,
      desconto,
      valorDesconto,
      troco
    };

    // Preparar dados para o cupom
    const receiptData = {
      items: carrinho.map(item => ({
        id: item.id,
        nome: item.nome,
        codigo: item.codigo,
        quantidade: item.quantidade,
        preco: item.preco
      })),
      subtotal,
      desconto,
      valorDesconto,
      total,
      formaPagamento,
      valorRecebido,
      troco,
      dataVenda: new Date(),
      numeroVenda: `V${Date.now().toString().slice(-6)}`
    };

    setLastSaleData(receiptData);
    
    // Chamar função original de finalizar venda
    onFinalizarVenda(dadosVenda);
    
    // Mostrar modal de impressão se estiver habilitado
    if (isReceiptPrintingEnabled()) {
      setShowReceiptModal(true);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[480px] group-[.pdv-classic]:bg-slate-300 group-[.pdv-classic]:text-black">
          <DialogHeader>
            <DialogTitle className="text-2xl flex justify-between items-center">
              Finalizar Venda
              <DialogClose asChild>
                <Button variant="ghost" size="icon"><X className="h-5 w-5"/></Button>
              </DialogClose>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2 p-4 bg-gray-50 rounded-lg group-[.pdv-classic]:bg-slate-200">
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
                  className="w-24 h-9"
                  min="0"
                  max="100"
                  disabled={!caixaAberto || !isManualDiscountAllowed()}
                />
              </div>
              {desconto > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Desconto:</span>
                  <span>- R$ {valorDesconto.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-xl font-semibold">
                <span>Total a Pagar:</span>
                <span className="text-primary group-[.pdv-classic]:text-blue-800">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3 px-4">
              <label className="text-sm font-medium">Forma de Pagamento:</label>
              <Select value={formaPagamento} onValueChange={onFormaPagamentoChange} disabled={!caixaAberto}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
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
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Troco:</span>
                      <span>R$ {troco.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleFinalizarVenda}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-lg font-semibold"
              disabled={carrinho.length === 0 || !caixaAberto || !formaPagamento}
            >
              <DollarSign className="w-5 h-5 mr-2" />
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {showReceiptModal && lastSaleData && (
        <ReceiptModal
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          receiptData={lastSaleData}
        />
      )}
    </>
  );
};

export default PaymentPanel;
