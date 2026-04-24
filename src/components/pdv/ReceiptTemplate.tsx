import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface ReceiptData {
  receipt_number: string | number;
  date: Date | string;
  items: Array<{
    id: string;
    nome: string;
    quantidade: number;
    preco: number;
    code: string;
  }>;
  subtotal: number;
  desconto: number;
  total: number;
  formaPagamento: string;
  valorRecebido: number;
  troco: number;
  customer_name?: string;
}

interface ReceiptTemplateProps {
  data: ReceiptData;
}

const formatMoney = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  return num.toFixed(2).replace('.', ',');
};

export const ReceiptTemplate = React.forwardRef<HTMLDivElement, ReceiptTemplateProps>(({ data }, ref) => {
  const dataHeader = typeof data.date === 'string' ? new Date(data.date) : (data.date || new Date());
  
  return (
    <div ref={ref} className="receipt-container print-only font-mono text-black bg-white" style={{ width: '80mm', maxWidth: '300px', margin: '0 auto', fontSize: '12px', lineHeight: '1.2' }}>
      
      {/* HEADER DA EMPRESA */}
      <div className="text-center mb-4 border-b border-black pb-2 border-dashed">
        <h1 className="font-bold text-lg mb-1 uppercase tracking-widest">Empório do Tênis</h1>
        <p className="text-xs">Rua Maracanã, 480 - Manoel Julião</p>
        <p className="text-xs">CEP: 00000-000 - Rio Branco/AC</p>
        <p className="text-xs">CNPJ: 00.000.000/0000-00</p>
        <p className="text-xs">Tel: (00) 0000-0000</p>
      </div>

      <div className="text-center mb-4 text-xs">
        <p className="font-bold">CUPOM NÃO FISCAL</p>
        <p>Venda Nº {data.receipt_number}</p>
        <p>{format(dataHeader, "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}</p>
        {data.customer_name && <p>Cliente: {data.customer_name}</p>}
      </div>

      {/* ITEMS BAR */}
      <div className="w-full border-b border-black mb-2 border-dashed">
        <div className="flex justify-between font-bold text-xs pb-1">
          <span className="w-2/4 text-left">DESCRIÇÃO</span>
          <span className="w-1/4 text-center">QTDxVL</span>
          <span className="w-1/4 text-right">TOTAL</span>
        </div>
      </div>

      {/* ITEMS LIST */}
      <div className="w-full mb-3 text-[11px] flex flex-col gap-1 border-b border-black pb-2 border-dashed">
        {data.items.map((item, index) => (
          <div key={item.id || index} className="flex flex-col">
            <span className="font-semibold uppercase tracking-tight">{item.code} - {item.nome}</span>
            <div className="flex justify-between items-start">
              <span className="w-2/4"></span>
              <span className="w-1/4 text-center">{item.quantidade}x{formatMoney(item.preco)}</span>
              <span className="w-1/4 text-right">{formatMoney(item.quantidade * item.preco)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* TOTAIS */}
      <div className="w-full text-xs font-semibold">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>R$ {formatMoney(data.subtotal)}</span>
        </div>
        {data.desconto > 0 && (
          <div className="flex justify-between">
            <span>Desconto ({data.desconto}%):</span>
            <span>- R$ {formatMoney(data.subtotal - data.total)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-sm mt-1 mb-1">
          <span>TOTAL A PAGAR:</span>
          <span>R$ {formatMoney(data.total)}</span>
        </div>
        
        <div className="w-full border-t border-black mt-2 pt-2 border-dashed">
             <div className="flex justify-between">
              <span>Pagamento ({data.formaPagamento.toUpperCase()}):</span>
              <span>R$ {formatMoney(data.valorRecebido)}</span>
            </div>
            {data.troco > 0 && (
              <div className="flex justify-between font-bold mt-1">
                <span>TROCO:</span>
                <span>R$ {formatMoney(data.troco)}</span>
              </div>
            )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center mt-6 text-xs border-t border-black pt-3 border-dashed">
         <p>Obrigado e volte sempre!</p>
         <p>Sistema SGA by Antigravity</p>
         <div className="h-8"></div> {/* Espaço para corte da guilhotina */}
      </div>

    </div>
  );
});

ReceiptTemplate.displayName = "ReceiptTemplate";
