
import { useRef } from 'react';
import ProductSearch from './ProductSearch';
import ProductList from './ProductList';
import ShortcutPanel from './ShortcutPanel';
import CartTable from './CartTable';

interface PDVMainContentProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  modoConsulta: boolean;
  setModoConsulta: (value: boolean) => void;
  caixaAberto: boolean;
  produtosFiltrados: any[];
  adicionarAoCarrinho: (produto: any) => void;
  carrinho: any[];
  removerDoCarrinho: (id: string) => void;
  alterarQuantidade: (id: string, quantidade: number) => void;
  limparCarrinho: () => void;
  desconto: number;
  setIsPaymentModalOpen: (value: boolean) => void;
}

const PDVMainContent = ({
  searchTerm,
  setSearchTerm,
  modoConsulta,
  setModoConsulta,
  caixaAberto,
  produtosFiltrados,
  adicionarAoCarrinho,
  carrinho,
  removerDoCarrinho,
  alterarQuantidade,
  limparCarrinho,
  desconto,
  setIsPaymentModalOpen
}: PDVMainContentProps) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)]">
      {/* Coluna Esquerda */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <ProductSearch
          onSearchChange={setSearchTerm}
          modoConsulta={modoConsulta}
          onModoConsultaChange={setModoConsulta}
          caixaAberto={caixaAberto}
          ref={searchInputRef}
        />
        
        {searchTerm && (
          <ProductList 
            produtos={produtosFiltrados}
            onAdicionarAoCarrinho={adicionarAoCarrinho}
            caixaAberto={caixaAberto}
            modoConsulta={modoConsulta}
          />
        )}
        
        <ShortcutPanel 
          onFinalizeSale={() => setIsPaymentModalOpen(true)}
          onCancelSale={limparCarrinho}
          onSearchProduct={() => searchInputRef.current?.focus()}
          caixaAberto={caixaAberto}
        />
      </div>

      {/* Coluna Direita */}
      <div className="lg:col-span-5 flex flex-col gap-6 h-full">
        <CartTable 
          carrinho={carrinho}
          onRemoverDoCarrinho={removerDoCarrinho}
          onAlterarQuantidade={alterarQuantidade}
          caixaAberto={caixaAberto}
          desconto={desconto}
        />
      </div>
    </div>
  );
};

export default PDVMainContent;
