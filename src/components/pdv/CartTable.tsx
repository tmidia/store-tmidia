
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
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
}

const CartTable = ({ carrinho, onRemoverDoCarrinho, onAlterarQuantidade, caixaAberto, desconto }: CartTableProps) => {
  const classicCard = "group-[.pdv-classic]:bg-slate-300 group-[.pdv-classic]:border-2 group-[.pdv-classic]:border-t-slate-200 group-[.pdv-classic]:border-l-slate-200 group-[.pdv-classic]:border-b-slate-500 group-[.pdv-classic]:border-r-slate-500 group-[.pdv-classic]:shadow-none group-[.pdv-classic]:rounded-none group-[.pdv-classic]:text-black";
  const classicButton = "group-[.pdv-classic]:bg-slate-300 group-[.pdv-classic]:border-2 group-[.pdv-classic]:border-t-slate-200 group-[.pdv-classic]:border-l-slate-200 group-[.pdv-classic]:border-b-slate-500 group-[.pdv-classic]:border-r-slate-500 group-[.pdv-classic]:text-black group-[.pdv-classic]:shadow-none group-[.pdv-classic]:rounded-none group-[.pdv-classic]:hover:bg-slate-400 group-[.pdv-classic]:active:border-t-slate-500 group-[.pdv-classic]:active:border-l-slate-500 group-[.pdv-classic]:active:border-b-slate-200 group-[.pdv-classic]:active:border-r-slate-200";

  const subtotal = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  const valorDesconto = (subtotal * desconto) / 100;
  const total = subtotal - valorDesconto;

  return (
    <Card className={`border-0 shadow-md bg-white h-full flex flex-col ${classicCard}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center">
          <ShoppingCart className="w-5 h-5 mr-2" />
          Lista de Produtos ({carrinho.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto">
          {carrinho.length === 0 ? (
            <p className="text-gray-500 text-center py-10">Carrinho vazio</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 group-[.pdv-classic]:bg-slate-400">
                <tr>
                  <th className="p-3 text-left font-semibold">DESCRIÇÃO</th>
                  <th className="p-3 text-center font-semibold">QTD</th>
                  <th className="p-3 text-right font-semibold">VL. UNIT.</th>
                  <th className="p-3 text-right font-semibold">VL. TOTAL</th>
                  <th className="p-3 text-center font-semibold">AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {carrinho.map(item => (
                  <tr key={item.id} className="border-b group-[.pdv-classic]:border-slate-400">
                    <td className="p-3 font-medium">{item.nome}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => onAlterarQuantidade(item.id, item.quantidade - 1)} className={`h-6 w-6 p-0 ${classicButton}`} disabled={!caixaAberto}><Minus className="w-3 h-3" /></Button>
                        <span>{item.quantidade}</span>
                        <Button size="sm" variant="ghost" onClick={() => onAlterarQuantidade(item.id, item.quantidade + 1)} className={`h-6 w-6 p-0 ${classicButton}`} disabled={!caixaAberto}><Plus className="w-3 h-3" /></Button>
                      </div>
                    </td>
                    <td className="p-3 text-right">R$ {item.preco.toFixed(2)}</td>
                    <td className="p-3 text-right font-semibold">R$ {(item.preco * item.quantidade).toFixed(2)}</td>
                    <td className="p-3 text-center">
                      <Button size="sm" variant="ghost" onClick={() => onRemoverDoCarrinho(item.id)} className={`h-8 w-8 p-0 text-red-500 hover:text-red-600 ${classicButton} group-[.pdv-classic]:!text-red-600`} disabled={!caixaAberto}><Trash2 className="w-4 h-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="p-4 border-t group-[.pdv-classic]:border-slate-500 bg-gray-50 group-[.pdv-classic]:bg-slate-400">
            <div className="space-y-2 text-lg">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              {desconto > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Desconto ({desconto}%):</span>
                  <span>- R$ {valorDesconto.toFixed(2)}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between text-2xl font-bold text-primary group-[.pdv-classic]:text-blue-800">
                <span>Total:</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CartTable;
