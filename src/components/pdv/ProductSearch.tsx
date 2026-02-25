
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Search, Eye, CornerDownLeft } from 'lucide-react';

interface ProductSearchProps {
  onSearchChange: (value: string) => void;
  modoConsulta: boolean;
  onModoConsultaChange: (value: boolean) => void;
  caixaAberto: boolean;
}

const ProductSearch = React.forwardRef<HTMLInputElement, ProductSearchProps>(({ 
  onSearchChange, 
  modoConsulta, 
  onModoConsultaChange, 
  caixaAberto 
}, ref) => {
  const [internalSearchTerm, setInternalSearchTerm] = useState('');

  const classicCard = "group-[.pdv-classic]:bg-slate-300 group-[.pdv-classic]:border-2 group-[.pdv-classic]:border-t-slate-200 group-[.pdv-classic]:border-l-slate-200 group-[.pdv-classic]:border-b-slate-500 group-[.pdv-classic]:border-r-slate-500 group-[.pdv-classic]:shadow-none group-[.pdv-classic]:rounded-none";
  const classicButton = "group-[.pdv-classic]:bg-slate-300 group-[.pdv-classic]:border-2 group-[.pdv-classic]:border-t-slate-200 group-[.pdv-classic]:border-l-slate-200 group-[.pdv-classic]:border-b-slate-500 group-[.pdv-classic]:border-r-slate-500 group-[.pdv-classic]:text-black group-[.pdv-classic]:shadow-none group-[.pdv-classic]:rounded-none group-[.pdv-classic]:hover:bg-slate-400 group-[.pdv-classic]:active:border-t-slate-500 group-[.pdv-classic]:active:border-l-slate-500 group-[.pdv-classic]:active:border-b-slate-200 group-[.pdv-classic]:active:border-r-slate-200";
  const classicInput = "group-[.pdv-classic]:bg-white group-[.pdv-classic]:border-2 group-[.pdv-classic]:border-t-slate-600 group-[.pdv-classic]:border-l-slate-600 group-[.pdv-classic]:border-b-slate-200 group-[.pdv-classic]:border-r-slate-200 group-[.pdv-classic]:shadow-inner group-[.pdv-classic]:rounded-none group-[.pdv-classic]:text-black";

  // Atualiza a busca em tempo real enquanto o usuário digita
  useEffect(() => {
    onSearchChange(internalSearchTerm);
  }, [internalSearchTerm, onSearchChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // O filtro já está sendo aplicado em tempo real, então apenas mantemos o foco
      (e.target as HTMLInputElement).blur();
      (e.target as HTMLInputElement).focus();
    }
  };
  
  return (
    <Card className={`border-0 shadow-md bg-white ${classicCard}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant={!modoConsulta ? "default" : "outline"}
            onClick={() => onModoConsultaChange(false)}
            className={`flex items-center gap-2 ${classicButton} group-[.pdv-classic]:data-[state=on]:bg-blue-500 group-[.pdv-classic]:data-[state=on]:text-white`}
            disabled={!caixaAberto && !modoConsulta}
            data-state={!modoConsulta ? 'on' : 'off'}
          >
            <ShoppingCart className="w-4 h-4" />
            Modo Venda
          </Button>
          <Button
            variant={modoConsulta ? "default" : "outline"}
            onClick={() => onModoConsultaChange(true)}
            className={`flex items-center gap-2 ${classicButton} group-[.pdv-classic]:data-[state=on]:bg-blue-500 group-[.pdv-classic]:data-[state=on]:text-white`}
            data-state={modoConsulta ? 'on' : 'off'}
          >
            <Eye className="w-4 h-4" />
            Consultar Produtos
          </Button>
        </div>
        
        <div className="relative">
          <label htmlFor="product-search" className="text-sm font-medium text-gray-700 group-[.pdv-classic]:text-black">
            Localizar Produto (F5)
          </label>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 mt-3" />
          <Input
            id="product-search"
            ref={ref}
            placeholder={modoConsulta ? "Consultar por nome ou código..." : "Digite o código ou nome do produto..."}
            value={internalSearchTerm}
            onChange={(e) => setInternalSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`pl-10 h-12 text-lg mt-1 ${classicInput}`}
            disabled={!caixaAberto && !modoConsulta}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 text-xs text-gray-500 mt-3">
            <span>Buscar</span>
            <CornerDownLeft className="w-3 h-3"/>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ProductSearch.displayName = "ProductSearch";

export default ProductSearch;
