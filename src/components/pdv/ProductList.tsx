import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Package, Image as ImageIcon } from 'lucide-react';

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
  // O tema clássico usa display contínuo e menos padding
  const classicContainer = "group-[.pdv-classic]:grid-cols-1 group-[.pdv-classic]:gap-2";
  const classicCard = "group-[.pdv-classic]:flex group-[.pdv-classic]:flex-row group-[.pdv-classic]:items-center group-[.pdv-classic]:bg-slate-300 group-[.pdv-classic]:border-2 group-[.pdv-classic]:border-t-slate-200 group-[.pdv-classic]:border-l-slate-200 group-[.pdv-classic]:border-b-slate-500 group-[.pdv-classic]:border-r-slate-500 group-[.pdv-classic]:shadow-none group-[.pdv-classic]:rounded-none group-[.pdv-classic]:p-2 group-[.pdv-classic]:h-auto";
  const classicButton = "group-[.pdv-classic]:bg-slate-300 group-[.pdv-classic]:border-2 group-[.pdv-classic]:border-t-slate-200 group-[.pdv-classic]:border-l-slate-200 group-[.pdv-classic]:border-b-slate-500 group-[.pdv-classic]:border-r-slate-500 group-[.pdv-classic]:text-black group-[.pdv-classic]:shadow-none group-[.pdv-classic]:rounded-none group-[.pdv-classic]:hover:bg-slate-400 group-[.pdv-classic]:w-auto group-[.pdv-classic]:ml-auto";

  return (
    <div className="w-full pb-8">
      <div className="flex items-center gap-2 mb-6">
        <Package className="w-5 h-5 text-slate-500" />
        <h3 className="text-xl font-bold tracking-tight text-slate-800">
          Resultados ({produtos.length})
        </h3>
      </div>

      {produtos.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400 bg-white/50 rounded-3xl border border-slate-200 border-dashed">
          <Package className="w-16 h-16 mb-4 opacity-50" />
          <p className="text-xl font-medium text-slate-500 group-[.pdv-classic]:text-slate-700">
            {caixaAberto || modoConsulta ? 'Nenhum produto encontrado' : 'Digite algo para buscar produtos'}
          </p>
          <p className="text-sm mt-2 opacity-70">Tente buscar por nome, código ou marca</p>
        </div>
      ) : (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 ${classicContainer}`}>
          {produtos.map(produto => (
            <Card 
              key={produto.id} 
              className={`border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white overflow-hidden rounded-2xl flex flex-col group/card ${classicCard}`}
            >
              {/* Card Image Area (Preparado para futuras fotos) */}
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 h-32 flex items-center justify-center relative overflow-hidden group-[.pdv-classic]:hidden">
                 <ImageIcon className="w-10 h-10 text-slate-300 transform group-hover/card:scale-110 transition-transform duration-300" />
                 {/* Tarja de Código */}
                 <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded backdrop-blur-sm">
                   {produto.code}
                 </div>
              </div>

              {/* Card Content Area */}
              <CardContent className="p-4 flex flex-col flex-1 gap-1 group-[.pdv-classic]:p-0 group-[.pdv-classic]:flex-row group-[.pdv-classic]:items-center group-[.pdv-classic]:gap-4 group-[.pdv-classic]:w-full">
                
                {/* Oculta código no clássico porque já tem na row */}
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800 line-clamp-2 leading-tight min-h-[2.5rem] group-[.pdv-classic]:min-h-0">
                    {produto.name}
                  </h4>
                  
                  <div className="mt-3 flex items-end justify-between group-[.pdv-classic]:mt-0 group-[.pdv-classic]:flex-row group-[.pdv-classic]:gap-4 group-[.pdv-classic]:items-center">
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-1">Preço Venda</p>
                      <p className="text-xl font-bold tracking-tight text-blue-600 group-[.pdv-classic]:text-green-800 group-[.pdv-classic]:text-lg">
                        R$ {produto.sale_price?.toFixed(2) || '0.00'}
                      </p>
                    </div>

                    <div className="text-right">
                       <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Estoque</p>
                       <p className={`text-sm font-bold ${produto.stock_quantity > 0 ? 'text-slate-700' : 'text-red-500'}`}>
                         {produto.stock_quantity || 0} un
                       </p>
                    </div>
                  </div>
                </div>

                {!modoConsulta && (
                  <Button
                    onClick={() => onAdicionarAoCarrinho(produto)}
                    disabled={!caixaAberto || (produto.stock_quantity || 0) <= 0}
                    className={`mt-4 w-full h-11 font-semibold rounded-xl bg-slate-900 border-none hover:bg-blue-600 shadow-md ${classicButton}`}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Adicionar
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
