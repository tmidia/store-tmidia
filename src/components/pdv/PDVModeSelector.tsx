
import ConsultationPanel from './ConsultationPanel';
import ProductSearch from './ProductSearch';
import ProductList from './ProductList';

interface PDVModeSelectorProps {
  modoConsulta: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  setModoConsulta: (value: boolean) => void;
  caixaAberto: boolean;
  produtosFiltrados: any[];
  adicionarAoCarrinho: (produto: any) => void;
}

const PDVModeSelector = ({ 
  modoConsulta, 
  searchTerm, 
  setSearchTerm, 
  setModoConsulta, 
  caixaAberto, 
  produtosFiltrados, 
  adicionarAoCarrinho 
}: PDVModeSelectorProps) => {
  if (modoConsulta) {
    return (
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ProductSearch 
            onSearchChange={setSearchTerm} 
            modoConsulta={true} 
            onModoConsultaChange={setModoConsulta} 
            caixaAberto={caixaAberto} 
          />
          <ProductList 
            produtos={produtosFiltrados}
            onAdicionarAoCarrinho={adicionarAoCarrinho}
            caixaAberto={caixaAberto}
            modoConsulta={modoConsulta}
          />
        </div>
        <div className="space-y-6">
          <ConsultationPanel />
        </div>
      </div>
    );
  }

  return null;
};

export default PDVModeSelector;
