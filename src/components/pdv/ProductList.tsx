
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Package } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  code: string;
  sale_price: number;
  stock_quantity: number;
}

interface ProductListProps {
  produtos: Product[];
  onAdicionarAoCarrinho: (produto: Product) => void;
  caixaAberto: boolean;
  modoConsulta: boolean;
}

const ProductList = ({ produtos, onAdicionarAoCarrinho, caixaAberto, modoConsulta }: ProductListProps) => {
  const classicCard = "group-[.pdv-classic]:bg-slate-300 group-[.pdv-classic]:border-2 group-[.pdv-classic]:border-t-slate-200 group-[.pdv-classic]:border-l-slate-200 group-[.pdv-classic]:border-b-slate-500 group-[.pdv-classic]:border-r-slate-500 group-[.pdv-classic]:shadow-none group-[.pdv-classic]:rounded-none group-[.pdv-classic]:text-black";
  const classicButton = "group-[.pdv-classic]:bg-slate-300 group-[.pdv-classic]:border-2 group-[.pdv-classic]:border-t-slate-200 group-[.pdv-classic]:border-l-slate-200 group-[.pdv-classic]:border-b-slate-500 group-[.pdv-classic]:border-r-slate-500 group-[.pdv-classic]:text-black group-[.pdv-classic]:shadow-none group-[.pdv-classic]:rounded-none group-[.pdv-classic]:hover:bg-slate-400";

  return (
    <Card className={`border-0 shadow-md bg-white h-full ${classicCard}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Package className="w-5 h-5 mr-2" />
          Produtos Encontrados ({produtos.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {produtos.length === 0 ? (
            <p className="text-gray-500 text-center py-10">Nenhum produto encontrado</p>
          ) : (
            <div className="space-y-2 p-4">
              {produtos.map(produto => (
                <div key={produto.id} className="flex items-center justify-between p-3 border rounded group-[.pdv-classic]:border-slate-400 group-[.pdv-classic]:bg-slate-200">
                  <div className="flex-1">
                    <h4 className="font-medium">{produto.name}</h4>
                    <p className="text-sm text-gray-600 group-[.pdv-classic]:text-slate-700">Código: {produto.code}</p>
                    <p className="text-lg font-bold text-green-600 group-[.pdv-classic]:text-green-800">R$ {produto.sale_price.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 group-[.pdv-classic]:text-slate-600">Estoque: {produto.stock_quantity}</p>
                  </div>
                  {!modoConsulta && (
                    <Button
                      size="sm"
                      onClick={() => onAdicionarAoCarrinho(produto)}
                      disabled={!caixaAberto || produto.stock_quantity <= 0}
                      className={`ml-4 ${classicButton}`}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductList;
