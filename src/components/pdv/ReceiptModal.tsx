
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ReceiptItem {
  id: string;
  nome: string;
  codigo: string;
  quantidade: number;
  preco: number;
}

interface ReceiptData {
  items: ReceiptItem[];
  subtotal: number;
  desconto: number;
  valorDesconto: number;
  total: number;
  formaPagamento: string;
  valorRecebido: string;
  troco: number;
  dataVenda: Date;
  numeroVenda: string;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: ReceiptData;
  autoPrint?: boolean;
}

const formatFormaPagamento = (forma: string) => {
  const formas: Record<string, string> = {
    'dinheiro': 'Dinheiro',
    'pix': 'PIX',
    'cartao_credito': 'Cartão Crédito',
    'cartao_debito': 'Cartão Débito',
    'cartao': 'Cartão',
    'misto': 'Misto'
  };
  return formas[forma] || forma;
};

/**
 * Gera o HTML do cupom formatado para impressora térmica 80mm (SMX-T80E)
 * Paper width: 80mm (~302px at 96dpi)
 * Usa fonte monospace para alinhamento correto
 */
const generateThermalReceiptHTML = (data: ReceiptData): string => {
  const itemsHTML = data.items.map(item => `
    <tr>
      <td style="text-align:left;font-size:11px;padding:1px 0;">${item.codigo}</td>
      <td style="text-align:left;font-size:11px;padding:1px 0;">${item.nome.substring(0, 18)}</td>
      <td style="text-align:center;font-size:11px;padding:1px 0;">${item.quantidade}</td>
      <td style="text-align:right;font-size:11px;padding:1px 0;">${(item.quantidade * item.preco).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <html>
      <head>
        <title>Cupom - ${data.numeroVenda}</title>
        <style>
          @page { margin: 0; size: 80mm auto; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', 'Lucida Console', monospace;
            font-size: 12px;
            width: 80mm;
            max-width: 80mm;
            padding: 4mm 3mm;
            color: #000;
          }
          .center { text-align: center; }
          .right { text-align: right; }
          .bold { font-weight: bold; }
          .line { border-top: 1px dashed #000; margin: 4px 0; }
          .total-line { border-top: 2px solid #000; margin: 4px 0; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 1px 0; vertical-align: top; }
          .big { font-size: 16px; font-weight: bold; }
          .footer { margin-top: 8px; font-size: 10px; }
        </style>
      </head>
      <body>
        <div class="center bold" style="font-size:14px;">CUPOM DE VENDA</div>
        <div class="center" style="font-size:10px;margin-top:2px;">
          Impressora: SMX-T80E | 80mm
        </div>
        <div class="line"></div>
        <div style="font-size:11px;">
          <div>Venda: <span class="bold">${data.numeroVenda}</span></div>
          <div>Data: ${data.dataVenda.toLocaleString('pt-BR')}</div>
        </div>
        <div class="line"></div>
        <table>
          <tr style="font-size:11px;font-weight:bold;border-bottom:1px dashed #000;">
            <td>COD</td><td>ITEM</td><td style="text-align:center;">QTD</td><td style="text-align:right;">VALOR</td>
          </tr>
          ${itemsHTML}
        </table>
        <div class="line"></div>
        <table>
          <tr>
            <td style="font-size:11px;">Subtotal:</td>
            <td class="right" style="font-size:11px;">R$ ${data.subtotal.toFixed(2)}</td>
          </tr>
          ${data.desconto > 0 ? `
          <tr>
            <td style="font-size:11px;">Desconto (${data.desconto}%):</td>
            <td class="right" style="font-size:11px;">- R$ ${data.valorDesconto.toFixed(2)}</td>
          </tr>` : ''}
        </table>
        <div class="total-line"></div>
        <table>
          <tr>
            <td class="big">TOTAL:</td>
            <td class="big right">R$ ${data.total.toFixed(2)}</td>
          </tr>
        </table>
        <div class="line"></div>
        <table style="font-size:11px;">
          <tr>
            <td>Pagamento:</td>
            <td class="right bold">${formatFormaPagamento(data.formaPagamento)}</td>
          </tr>
          ${data.formaPagamento === 'dinheiro' ? `
          <tr>
            <td>Recebido:</td>
            <td class="right">R$ ${parseFloat(data.valorRecebido).toFixed(2)}</td>
          </tr>
          <tr>
            <td>Troco:</td>
            <td class="right bold">R$ ${data.troco.toFixed(2)}</td>
          </tr>` : ''}
        </table>
        <div class="line"></div>
        <div class="center footer">
          <div style="font-size:11px;">Obrigado pela preferência!</div>
          <div style="margin-top:4px;">--- FIM DO CUPOM ---</div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 1000);
          }
        </script>
      </body>
    </html>
  `;
};

const ReceiptModal = ({ isOpen, onClose, receiptData, autoPrint = true }: ReceiptModalProps) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [hasPrinted, setHasPrinted] = useState(false);

  // Auto-print on open
  useEffect(() => {
    if (isOpen && autoPrint && !hasPrinted) {
      const timer = setTimeout(() => {
        handlePrint();
        setHasPrinted(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoPrint, hasPrinted]);

  const handlePrint = () => {
    setIsPrinting(true);
    const printWindow = window.open('', '_blank', 'width=320,height=600');
    if (printWindow) {
      printWindow.document.write(generateThermalReceiptHTML(receiptData));
      printWindow.document.close();
    }
    setTimeout(() => setIsPrinting(false), 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => { setHasPrinted(false); onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Cupom Fiscal
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 font-mono text-sm">
          <div className="text-center">
            <h3 className="font-bold">CUPOM DE VENDA</h3>
            <p className="text-xs text-muted-foreground">Impressora: SMX-T80E | 80mm | USB+LAN</p>
            <p>Venda: {receiptData.numeroVenda}</p>
            <p>Data: {receiptData.dataVenda.toLocaleString('pt-BR')}</p>
          </div>

          <Separator />

          <div>
            <h4 className="font-bold mb-2">ITENS</h4>
            {receiptData.items.map((item, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between">
                  <span>{item.codigo} - {item.nome}</span>
                </div>
                <div className="flex justify-between">
                  <span>{item.quantidade}x R$ {item.preco.toFixed(2)}</span>
                  <span>R$ {(item.quantidade * item.preco).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>R$ {receiptData.subtotal.toFixed(2)}</span>
            </div>
            {receiptData.desconto > 0 && (
              <div className="flex justify-between text-destructive">
                <span>Desconto ({receiptData.desconto}%):</span>
                <span>- R$ {receiptData.valorDesconto.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg">
              <span>TOTAL:</span>
              <span>R$ {receiptData.total.toFixed(2)}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Pagamento:</span>
              <span>{formatFormaPagamento(receiptData.formaPagamento)}</span>
            </div>
            {receiptData.formaPagamento === 'dinheiro' && (
              <>
                <div className="flex justify-between">
                  <span>Recebido:</span>
                  <span>R$ {parseFloat(receiptData.valorRecebido).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Troco:</span>
                  <span>R$ {receiptData.troco.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          <Separator />

          <div className="text-center">
            <p>Obrigado pela preferência!</p>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handlePrint} disabled={isPrinting} className="flex-1">
            <Printer className="w-4 h-4 mr-2" />
            {isPrinting ? 'Imprimindo...' : 'Reimprimir Cupom'}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptModal;
