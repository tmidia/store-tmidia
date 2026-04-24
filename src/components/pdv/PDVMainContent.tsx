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
  searchInputRef: React.RefObject<HTMLInputElement>;
  onCancelSale: () => void;
  onToggleFullscreen: () => void;
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
  setIsPaymentModalOpen,
  searchInputRef,
  onCancelSale,
  onToggleFullscreen
}: PDVMainContentProps) => {

  return (
    <div className="mt-4 grid grid-cols-1 xl:grid-cols-12 gap-6 h-[calc(100vh-110px)] relative">
      
      {/* COLUNA ESQUERDA: Catálogo e Busca (66%) */}
      <div className="xl:col-span-8 flex flex-col h-full gap-4 min-h-0">
        {/* Área superior: busca + lista (scroll interno) */}
        <div className="flex-1 min-h-0 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
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
        </div>

        {/* Rodapé fixo: atalhos sempre visíveis */}
        <div className="shrink-0">
          <ShortcutPanel
            onFinalizeSale={() => setIsPaymentModalOpen(true)}
            onCancelSale={onCancelSale}
            onSearchProduct={() => searchInputRef.current?.focus()}
            onToggleFullscreen={onToggleFullscreen}
            caixaAberto={caixaAberto}
          />
        </div>
      </div>

      {/* COLUNA DIREITA: Recibo / Carrinho (33%) - altura fixa, scroll interno */}
      <div className="xl:col-span-4 h-full min-h-0 hidden xl:block">
        <CartTable
          carrinho={carrinho}
          onRemoverDoCarrinho={removerDoCarrinho}
          onAlterarQuantidade={alterarQuantidade}
          caixaAberto={caixaAberto}
          desconto={desconto}
          onPagamento={() => setIsPaymentModalOpen(true)}
        />
      </div>
    </div>
  );
};

export default PDVMainContent;
