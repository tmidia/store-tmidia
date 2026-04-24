import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';

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

interface CompanyInfo {
  company_name: string;
  cnpj: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  receipt_footer: string;
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

const generateThermalReceiptHTML = (data: ReceiptData, company: CompanyInfo): string => {
  const formatValue = (val: number) => val.toFixed(2);
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { box-sizing: border-box; }
          html, body {
            margin: 0; padding: 0;
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px; line-height: 1.4;
            width: 302px;
            color: #000 !important; background: #fff !important;
          }
          .txt-center { text-align: center; }
          .txt-right { text-align: right; }
          .bold { font-weight: bold; }
          .hr { border-bottom: 1px dashed #000; margin: 4px 0; height: 1px; }
          .hr-double { border-bottom: 2px solid #000; margin: 6px 0; height: 1px; }
          table { width: 100%; border-collapse: collapse; margin: 2px 0; }
          .footer { margin-top: 15px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="txt-center bold" style="font-size: 14pt;">${company.company_name.toUpperCase()}</div>
        <div class="txt-center" style="font-size: 9pt;">
          ${company.address ? `${company.address}<br>` : ''}
          ${company.city ? `${company.city}${company.state ? `/${company.state}` : ''}` : ''}${company.phone ? ` - Tel: ${company.phone}` : ''}${company.cnpj ? `<br>CNPJ: ${company.cnpj}` : ''}
        </div>
        
        <div class="hr"></div>
        <div class="txt-center bold">CUPOM NÃO FISCAL</div>
        <div style="font-size: 10pt;">
          Venda: #${data.numeroVenda}<br>
          Data: ${new Date(data.dataVenda).toLocaleString('pt-BR')}
        </div>
        
        <div class="hr"></div>
        <table style="font-size: 10pt;">
          <thead>
            <tr class="bold">
              <th align="left">ITEM</th>
              <th align="right">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map(item => `
              <tr>
                <td colspan="2" style="padding-top: 5px;">${item.codigo} - ${item.nome.toUpperCase()}</td>
              </tr>
              <tr>
                <td align="left">&nbsp;&nbsp;${item.quantidade} x R$ ${formatValue(item.preco)}</td>
                <td align="right">R$ ${formatValue(item.quantidade * item.preco)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="hr"></div>
        <table style="font-size: 11pt;">
          <tr>
            <td>Subtotal:</td>
            <td align="right">R$ ${formatValue(data.subtotal)}</td>
          </tr>
          ${data.desconto > 0 ? `
          <tr>
            <td>Desconto:</td>
            <td align="right">- R$ ${formatValue(data.valorDesconto)}</td>
          </tr>` : ''}
          <tr class="bold" style="font-size: 13pt;">
            <td>TOTAL:</td>
            <td align="right">R$ ${formatValue(data.total)}</td>
          </tr>
        </table>
        
        <div class="hr-double"></div>
        <table style="font-size: 10pt;">
          <tr>
            <td>PAGAMENTO:</td>
            <td align="right" class="bold">${formatFormaPagamento(data.formaPagamento).toUpperCase()}</td>
          </tr>
          ${data.formaPagamento === 'dinheiro' ? `
          <tr>
            <td>RECEBIDO:</td>
            <td align="right">R$ ${formatValue(parseFloat(data.valorRecebido))}</td>
          </tr>
          <tr>
            <td>TROCO:</td>
            <td align="right" class="bold">R$ ${formatValue(data.troco)}</td>
          </tr>` : ''}
        </table>
        
        <div class="footer txt-center">
          ${company.receipt_footer || 'Obrigado pela preferência!'}<br>
          <br>
          --- FIM DO CUPOM ---
          <div style="height: 60px;"></div>
        </div>
      </body>
    </html>
  `;
};

const DEFAULT_COMPANY: CompanyInfo = {
  company_name: 'Minha Loja',
  cnpj: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  receipt_footer: 'Obrigado pela preferência!',
};

const ReceiptModal = ({ isOpen, onClose, receiptData, autoPrint = true }: ReceiptModalProps) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [hasPrinted, setHasPrinted] = useState(false);
  const [company, setCompany] = useState<CompanyInfo>(DEFAULT_COMPANY);
  const [companyLoaded, setCompanyLoaded] = useState(false);

  useEffect(() => {
    supabase
      .from('company_settings')
      .select('company_name, cnpj, phone, address, city, state, receipt_footer')
      .single()
      .then(({ data }) => {
        if (data) setCompany({ ...DEFAULT_COMPANY, ...data });
        setCompanyLoaded(true);
      });
  }, []);

  // Auto-print só depois que os dados da empresa chegam do banco
  useEffect(() => {
    if (isOpen && autoPrint && !hasPrinted && companyLoaded) {
      const timer = setTimeout(() => {
        handlePrint();
        setHasPrinted(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoPrint, hasPrinted, companyLoaded]);

  const handlePrint = async () => {
    setIsPrinting(true);

    const electronApi = (window as any).electronAPI;
    console.log('[PDV] Impressão - electronAPI disponível?', !!electronApi, 'printReceiptRaw?', typeof electronApi?.printReceiptRaw);

    if (electronApi?.printReceiptRaw) {
      console.log('[PDV] Usando pipeline RAW ESC/POS (Electron)');
      try {
        const result = await electronApi.printReceiptRaw({ data: receiptData, company });
        if (result?.success) {
          console.log('[PDV] Impresso com sucesso em:', result.printer);
        } else {
          console.error('[PDV] Falha na impressão RAW:', result?.error);
        }
      } catch (e) {
        console.error('[PDV] Erro ao chamar impressão RAW:', e);
      }
      setIsPrinting(false);
      return;
    }

    console.warn('[PDV] electronAPI indisponível - caindo no fallback HTML (vai abrir diálogo do Windows)');
    const htmlContent = generateThermalReceiptHTML(receiptData, company);
    const printWindow = window.open('', '_blank', 'width=400,height=700');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        setTimeout(() => printWindow.close(), 1000);
      }, 300);
    }
    setTimeout(() => setIsPrinting(false), 2000);
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
            <h3 className="font-bold text-lg uppercase">{company.company_name}</h3>
            {company.address && <p className="text-xs text-muted-foreground mt-1">{company.address}</p>}
            {company.city && <p className="text-xs text-muted-foreground">{company.city}{company.state ? `/${company.state}` : ''}</p>}
            {(company.cnpj || company.phone) && (
              <p className="text-xs text-muted-foreground">
                {company.cnpj ? `CNPJ: ${company.cnpj}` : ''}{company.cnpj && company.phone ? ' | ' : ''}{company.phone ? `Tel: ${company.phone}` : ''}
              </p>
            )}
            <Separator className="my-3 border-dashed" />
            <h4 className="font-bold mb-1">CUPOM NÃO FISCAL</h4>
            <p className="text-sm">Venda: {receiptData.numeroVenda}</p>
            <p className="text-sm">Data: {receiptData.dataVenda.toLocaleString('pt-BR')}</p>
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
