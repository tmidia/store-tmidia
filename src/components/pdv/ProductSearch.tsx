import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Search, Eye, Barcode } from 'lucide-react';

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

  const classicButton = "group-[.pdv-classic]:bg-slate-300 group-[.pdv-classic]:border-2 group-[.pdv-classic]:border-t-slate-200 group-[.pdv-classic]:border-l-slate-200 group-[.pdv-classic]:border-b-slate-500 group-[.pdv-classic]:border-r-slate-500 group-[.pdv-classic]:text-black group-[.pdv-classic]:shadow-none group-[.pdv-classic]:rounded-none group-[.pdv-classic]:hover:bg-slate-400 group-[.pdv-classic]:active:border-t-slate-500 group-[.pdv-classic]:active:border-l-slate-500 group-[.pdv-classic]:active:border-b-slate-200 group-[.pdv-classic]:active:border-r-slate-200";
  const classicInput = "group-[.pdv-classic]:bg-white group-[.pdv-classic]:border-2 group-[.pdv-classic]:border-t-slate-600 group-[.pdv-classic]:border-l-slate-600 group-[.pdv-classic]:border-b-slate-200 group-[.pdv-classic]:border-r-slate-200 group-[.pdv-classic]:shadow-inner group-[.pdv-classic]:rounded-none group-[.pdv-classic]:text-black";

  // Atualiza a busca em tempo real enquanto o usuário digita
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
       onSearchChange(internalSearchTerm);
    }, 150);
    return () => clearTimeout(delayDebounceFn);
  }, [internalSearchTerm, onSearchChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
      (e.target as HTMLInputElement).focus();
    }
  };
  
  return (
    <div className="w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-2 pl-6 pr-4 flex flex-col md:flex-row items-center gap-4 group-[.pdv-classic]:bg-slate-300 group-[.pdv-classic]:border-2 group-[.pdv-classic]:border-t-slate-200 group-[.pdv-classic]:border-l-slate-200 group-[.pdv-classic]:border-b-slate-500 group-[.pdv-classic]:border-r-slate-500 group-[.pdv-classic]:shadow-none group-[.pdv-classic]:rounded-none group-[.pdv-classic]:p-4">
      
      {/* Search Input Area */}
      <div className="flex-1 w-full relative flex items-center">
        <div className="absolute left-0 p-2 bg-slate-100 rounded-xl group-[.pdv-classic]:hidden">
           <Barcode className="w-6 h-6 text-blue-600" />
        </div>
        <Search className="hidden group-[.pdv-classic]:block absolute left-3 text-gray-400 w-5 h-5" />
        <Input
          id="product-search"
          ref={ref}
          placeholder={modoConsulta ? "Bipar ou buscar na tabela..." : "Bipe o CÓDIGO DE BARRAS ou digite o nome do produto [F5]"}
          value={internalSearchTerm}
          onChange={(e) => setInternalSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          className={`pl-16 group-[.pdv-classic]:pl-10 h-16 text-lg sm:text-xl font-medium border-0 shadow-none focus-visible:ring-0 placeholder:text-slate-400 bg-transparent ${classicInput}`}
          disabled={!caixaAberto && !modoConsulta}
        />
      </div>

      {/* Mode Switches */}
      <div className="flex items-center gap-2 shrink-0 border-l pl-4 border-slate-100 group-[.pdv-classic]:border-none group-[.pdv-classic]:pl-0">
        <Button
          variant={!modoConsulta ? "default" : "secondary"}
          onClick={() => onModoConsultaChange(false)}
          size="lg"
          className={`font-semibold tracking-wide rounded-xl h-12 px-6 transition-all ${
            !modoConsulta ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'
          } ${classicButton} group-[.pdv-classic]:data-[state=on]:bg-blue-500 group-[.pdv-classic]:data-[state=on]:text-white`}
          disabled={!caixaAberto && !modoConsulta}
          data-state={!modoConsulta ? 'on' : 'off'}
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          Caixa
        </Button>
        
        <Button
          variant={modoConsulta ? "default" : "secondary"}
          onClick={() => onModoConsultaChange(true)}
          size="lg"
          className={`font-semibold tracking-wide rounded-xl h-12 px-6 transition-all ${
            modoConsulta ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'
          } ${classicButton} group-[.pdv-classic]:data-[state=on]:bg-blue-500 group-[.pdv-classic]:data-[state=on]:text-white`}
          data-state={modoConsulta ? 'on' : 'off'}
        >
          <Eye className="w-5 h-5 mr-2" />
          Consulta
        </Button>
      </div>

    </div>
  );
});

ProductSearch.displayName = "ProductSearch";

export default ProductSearch;
