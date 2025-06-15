
import { useState } from 'react';
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
}

const ReceiptModal = ({ isOpen, onClose, receiptData }: ReceiptModalProps) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    
    // Criar conteúdo HTML para impressão
    const printContent = `
      <div style="font-family: 'Courier New', monospace; font-size: 12px; max-width: 300px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2>CUPOM FISCAL</h2>
          <p>Venda: ${receiptData.numeroVenda}</p>
          <p>Data: ${receiptData.dataVenda.toLocaleString('pt-BR')}</p>
        </div>
        
        <div style="border-top: 1px dashed #000; padding-top: 10px; margin-bottom: 10px;">
          <h3>ITENS</h3>
          ${receiptData.items.map(item => `
            <div style="margin-bottom: 8px;">
              <div>${item.codigo} - ${item.nome}</div>
              <div style="display: flex; justify-content: space-between;">
                <span>${item.quantidade}x R$ ${item.preco.toFixed(2)}</span>
                <span>R$ ${(item.quantidade * item.preco).toFixed(2)}</span>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div style="border-top: 1px dashed #000; padding-top: 10px;">
          <div style="display: flex; justify-content: space-between;">
            <span>Subtotal:</span>
            <span>R$ ${receiptData.subtotal.toFixed(2)}</span>
          </div>
          ${receiptData.desconto > 0 ? `
            <div style="display: flex; justify-content: space-between;">
              <span>Desconto (${receiptData.desconto}%):</span>
              <span>- R$ ${receiptData.valorDesconto.toFixed(2)}</span>
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-top: 5px;">
            <span>TOTAL:</span>
            <span>R$ ${receiptData.total.toFixed(2)}</span>
          </div>
        </div>
        
        <div style="border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px;">
          <div style="display: flex; justify-content: space-between;">
            <span>Forma de Pagamento:</span>
            <span>${receiptData.formaPagamento.toUpperCase()}</span>
          </div>
          ${receiptData.formaPagamento === 'dinheiro' ? `
            <div style="display: flex; justify-content: space-between;">
              <span>Valor Recebido:</span>
              <span>R$ ${parseFloat(receiptData.valorRecebido).toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Troco:</span>
              <span>R$ ${receiptData.troco.toFixed(2)}</span>
            </div>
          ` : ''}
        </div>
        
        <div style="text-align: center; margin-top: 20px; border-top: 1px dashed #000; padding-top: 10px;">
          <p>Obrigado pela preferência!</p>
        </div>
      </div>
    `;

    // Criar nova janela para impressão
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Cupom Fiscal - ${receiptData.numeroVenda}</title>
            <style>
              @media print {
                body { margin: 0; }
                @page { margin: 0.5cm; }
              }
            </style>
          </head>
          <body>
            ${printContent}
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }

    setIsPrinting(false);
  };

  const formatFormaPagamento = (forma: string) => {
    const formas = {
      'dinheiro': 'Dinheiro',
      'pix': 'PIX',
      'cartao': 'Cartão',
      'misto': 'Misto'
    };
    return formas[forma as keyof typeof formas] || forma;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
          {/* Cabeçalho */}
          <div className="text-center">
            <h3 className="font-bold">CUPOM FISCAL</h3>
            <p>Venda: {receiptData.numeroVenda}</p>
            <p>Data: {receiptData.dataVenda.toLocaleString('pt-BR')}</p>
          </div>

          <Separator />

          {/* Itens */}
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

          {/* Totais */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>R$ {receiptData.subtotal.toFixed(2)}</span>
            </div>
            
            {receiptData.desconto > 0 && (
              <div className="flex justify-between text-red-600">
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

          {/* Pagamento */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Forma de Pagamento:</span>
              <span>{formatFormaPagamento(receiptData.formaPagamento)}</span>
            </div>
            
            {receiptData.formaPagamento === 'dinheiro' && (
              <>
                <div className="flex justify-between">
                  <span>Valor Recebido:</span>
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
          <Button
            onClick={handlePrint}
            disabled={isPrinting}
            className="flex-1"
          >
            <Printer className="w-4 h-4 mr-2" />
            {isPrinting ? 'Imprimindo...' : 'Imprimir Cupom'}
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
