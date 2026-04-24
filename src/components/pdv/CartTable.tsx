import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface CartItem {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  code: string;
}

interface CartTableProps {
  carrinho: CartItem[];
  onRemoverDoCarrinho: (id: string) => void;
  onAlterarQuantidade: (id: string, quantidade: number) => void;
  caixaAberto: boolean;
  desconto: number;
  onPagamento?: () => void;
}

const CartTable = ({ carrinho, onRemoverDoCarrinho, onAlterarQuantidade, caixaAberto, desconto, onPagamento }: CartTableProps) => {
  // Estilos do layout antigo (mantidos para o tema clássico)
  const classicCard = "group-[.pdv-classic]:bg-slate-300 group-[.pdv-classic]:border-2 group-[.pdv-classic]:border-t-slate-200 group-[.pdv-classic]:border-l-slate-200 group-[.pdv-classic]:border-b-slate-500 group-[.pdv-classic]:border-r-slate-500 group-[.pdv-classic]:shadow-none group-[.pdv-classic]:rounded-none group-[.pdv-classic]:text-black";
  
  const subtotal = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  const valorDesconto = (subtotal * desconto) / 100;
  const total = subtotal - valorDesconto;

  return (
    <Card className={`border border-gray-200 shadow-xl bg-white w-full h-full flex flex-col rounded-2xl overflow-hidden ${classicCard}`}>
      {/* Cabeçalho do Recibo */}
      <div className="bg-slate-900 text-white p-5 flex items-center justify-between shadow-sm group-[.pdv-classic]:bg-slate-400 group-[.pdv-classic]:text-black border-b group-[.pdv-classic]:border-slate-500">
        <div className="flex items-center gap-3">
          <div className="bg-slate-800 p-2 rounded-lg group-[.pdv-classic]:bg-slate-300">
            <ShoppingBag className="w-6 h-6 text-blue-400 group-[.pdv-classic]:text-black" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Cupom Fiscal</h2>
            <p className="text-xs text-slate-400 group-[.pdv-classic]:text-slate-700">
              {carrinho.length} {carrinho.length === 1 ? 'item' : 'itens'} adicionados
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Produtos do Recibo */}
      <CardContent className="flex-1 overflow-y-auto p-0 bg-slate-50 group-[.pdv-classic]:bg-white custom-scrollbar relative">
        {carrinho.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-4 opacity-50 p-6 text-center">
            <ShoppingBag className="w-16 h-16" />
            <p className="text-lg font-medium">O carrinho está vazio</p>
            <p className="text-sm">Bipe ou busque um produto para iniciar a venda.</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {carrinho.map(item => (
              <div key={item.id} className="bg-white border hover:border-blue-200 border-gray-100 p-4 rounded-xl shadow-sm transition-all flex flex-col gap-3 group">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="font-semibold text-slate-800 leading-tight">{item.nome}</h4>
                    <span className="text-xs text-slate-400 font-mono mt-1 block">CÓD: {item.code}</span>
                  </div>
                  <button 
                    onClick={() => onRemoverDoCarrinho(item.id)}
                    disabled={!caixaAberto}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                  <div className="flex items-center gap-3 bg-slate-100 rounded-lg p-1">
                    <button 
                      className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm text-slate-600 hover:text-blue-600 disabled:opacity-50 transition-colors"
                      onClick={() => onAlterarQuantidade(item.id, item.quantidade - 1)}
                      disabled={!caixaAberto}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-semibold text-slate-800 w-4 text-center">{item.quantidade}</span>
                    <button 
                      className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm text-slate-600 hover:text-blue-600 disabled:opacity-50 transition-colors"
                      onClick={() => onAlterarQuantidade(item.id, item.quantidade + 1)}
                      disabled={!caixaAberto}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs text-slate-400 mb-0.5">{item.quantidade}x R$ {item.preco.toFixed(2)}</div>
                    <div className="font-bold text-slate-800">R$ {(item.preco * item.quantidade).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Rodapé / Totais (Fixo embaixo) */}
      <div className="bg-white z-10 border-t border-slate-200 p-5 shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)] group-[.pdv-classic]:bg-slate-300">
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center text-slate-600 font-medium">
            <span>Subtotal</span>
            <span>R$ {subtotal.toFixed(2)}</span>
          </div>
          
          {desconto > 0 && (
            <div className="flex justify-between items-center text-red-500 font-medium bg-red-50 p-2 rounded-lg -mx-2 px-2">
              <span>Desconto ({desconto}%)</span>
              <span>- R$ {valorDesconto.toFixed(2)}</span>
            </div>
          )}
          
          <Separator className="bg-slate-200" />
          
          <div className="flex justify-between items-end">
            <span className="text-slate-500 font-medium uppercase tracking-wider text-sm mb-1">Total a Pagar</span>
            <span className="text-4xl font-black text-slate-900 tracking-tight">R$ {total.toFixed(2)}</span>
          </div>
        </div>

        <Button 
          onClick={onPagamento}
          disabled={!caixaAberto || carrinho.length === 0}
          className="w-full h-16 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 overflow-hidden relative group"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          <span className="relative z-10">PAGAMENTO (F2)</span>
          <ArrowRight className="w-6 h-6 relative z-10" />
        </Button>
      </div>
    </Card>
  );
};

export default CartTable;
