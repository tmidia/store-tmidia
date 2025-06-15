
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  code: string;
  description?: string;
  sale_price: number;
  stock_quantity: number;
  minimum_stock: number;
  cost_price: number;
}

interface ProductListProps {
  produtos: Product[];
  modoConsulta: boolean;
  caixaAberto: boolean;
  onAdicionarAoCarrinho: (produto: Product) => void;
}

const ProductList = ({ produtos, modoConsulta, caixaAberto, onAdicionarAoCarrinho }: ProductListProps) => {
  const classicCard = "group-[.pdv-classic]:bg-slate-300 group-[.pdv-classic]:border-2 group-[.pdv-classic]:border-t-slate-200 group-[.pdv-classic]:border-l-slate-200 group-[.pdv-classic]:border-b-slate-500 group-[.pdv-classic]:border-r-slate-500 group-[.pdv-classic]:shadow-none group-[.pdv-classic]:rounded-none";
  
  return (
    <Card className={`border-0 shadow-md bg-white ${classicCard}`}>
      <CardHeader className="group-[.pdv-classic]:pb-2">
        <CardTitle className="text-lg font-semibold group-[.pdv-classic]:text-black">
          {modoConsulta ? `Consulta de Produtos (${produtos.length})` : `Produtos Disponíveis (${produtos.length})`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {produtos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum produto encontrado
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto group-[.pdv-classic]:max-h-[30rem]">
            {produtos.map(produto => (
              <div 
                key={produto.id}
                className={`p-4 border border-gray-200 rounded-lg transition-colors group-[.pdv-classic]:border-slate-400 group-[.pdv-classic]:bg-slate-200 group-[.pdv-classic]:shadow-md ${
                  !modoConsulta && caixaAberto 
                    ? 'hover:border-primary cursor-pointer group-[.pdv-classic]:hover:bg-blue-200' 
                    : modoConsulta 
                      ? 'hover:border-blue-300 cursor-default group-[.pdv-classic]:hover:bg-slate-300'
                      : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={() => !modoConsulta && caixaAberto && onAdicionarAoCarrinho(produto)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900 group-[.pdv-classic]:text-black">{produto.name}</h4>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="text-xs group-[.pdv-classic]:bg-white group-[.pdv-classic]:text-black">
                      {produto.code}
                    </Badge>
                    {modoConsulta && (
                      <Badge variant="secondary" className="text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        Consulta
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-primary group-[.pdv-classic]:text-blue-800">
                    R$ {produto.sale_price.toFixed(2)}
                  </span>
                  <span className={`text-sm ${produto.stock_quantity <= produto.minimum_stock ? 'text-red-600' : 'text-gray-600'} group-[.pdv-classic]:text-black`}>
                    Estoque: {produto.stock_quantity}
                  </span>
                </div>
                {modoConsulta && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Preço de Custo: R$ {produto.cost_price.toFixed(2)}</div>
                      <div>Estoque Mínimo: {produto.minimum_stock}</div>
                      {produto.description && (
                        <div className="text-gray-600">Descrição: {produto.description}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductList;
