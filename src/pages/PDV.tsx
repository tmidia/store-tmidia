
import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, MinusCircle } from 'lucide-react';
import { useSystemParameters } from '@/hooks/useSystemParameters';
import { usePDVLogic } from '@/hooks/usePDVLogic';
import { usePdvTheme } from '@/hooks/usePdvTheme';
import PDVHeader from '@/components/pdv/PDVHeader';
import ProductSearch from '@/components/pdv/ProductSearch';
import ConsultationPanel from '@/components/pdv/ConsultationPanel';
import { SangriaDialog } from '@/components/pdv/SangriaDialog';
import { Button } from '@/components/ui/button';
import ShortcutPanel from '@/components/pdv/ShortcutPanel';
import CartTable from '@/components/pdv/CartTable';
import PaymentPanel from '@/components/pdv/PaymentPanel'; // Manter para o modal

const PDV = () => {
  const { isPDVEnabled } = useSystemParameters();
  const {
    carrinho,
    desconto,
    setDesconto,
    formaPagamento,
    setFormaPagamento,
    valorRecebido,
    setValorRecebido,
    clienteNome,
    setClienteNome,
    caixaAberto,
    modoConsulta,
    setModoConsulta,
    produtos,
    loading,
    adicionarAoCarrinho,
    removerDoCarrinho,
    alterarQuantidade,
    limparCarrinho,
    abrirCaixa,
    fecharCaixa,
    realizarSangria,
    finalizarVenda,
  } = usePDVLogic();
  
  const { theme, toggleTheme } = usePdvTheme();
  const [isSangriaDialogOpen, setIsSangriaDialogOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Lógica de Tela Cheia
  useEffect(() => {
    const enterFullscreen = () => {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    };
    const exitFullscreen = () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };

    if (caixaAberto) enterFullscreen();
    else exitFullscreen();

    return () => exitFullscreen(); // Sair da tela cheia ao desmontar o componente
  }, [caixaAberto]);

  // Lógica de Atalhos do Teclado
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!caixaAberto) return;
    switch (event.key) {
      case 'F2':
        event.preventDefault();
        setIsPaymentModalOpen(true);
        break;
      case 'F5':
        event.preventDefault();
        searchInputRef.current?.focus();
        break;
      case 'F9':
        event.preventDefault();
        limparCarrinho();
        break;
    }
  }, [caixaAberto, limparCarrinho]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleFinalizarVenda = (dadosVenda: any) => {
    finalizarVenda(dadosVenda);
    setIsPaymentModalOpen(false);
  };

  if (!isPDVEnabled()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 text-center">
          <CardContent>
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">PDV Desabilitado</h2>
            <p className="text-gray-600">O módulo PDV está desabilitado nas configurações do sistema.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleSearchAndAddToCart = (searchTerm: string) => {
    if(!caixaAberto || !searchTerm) return;
    const foundProduct = produtos.find(p => p.code.toLowerCase() === searchTerm.toLowerCase() || p.name.toLowerCase() === searchTerm.toLowerCase());
    if (foundProduct) {
      adicionarAoCarrinho(foundProduct);
    } else {
      // toast de produto não encontrado
    }
  };


  return (
    <div className={`p-4 min-h-screen group ${theme} group-[.pdv-classic]:bg-slate-400 group-[.pdv-classic]:font-sans`}>
      <PDVHeader 
        caixaAberto={caixaAberto}
        onAbrirCaixa={abrirCaixa}
        onFecharCaixa={fecharCaixa}
        onToggleTheme={toggleTheme}
      />

      {modoConsulta ? (
         <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <ProductSearch searchTerm="" onSearchChange={() => {}} modoConsulta={true} onModoConsultaChange={setModoConsulta} caixaAberto={caixaAberto} />
            </div>
            <div className="space-y-6"><ConsultationPanel /></div>
         </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)]">
          {/* Coluna Esquerda */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <ProductSearch
              searchTerm=""
              onSearchChange={handleSearchAndAddToCart} // Lógica de busca e adição
              modoConsulta={modoConsulta}
              onModoConsultaChange={setModoConsulta}
              caixaAberto={caixaAberto}
              ref={searchInputRef}
            />
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
      )}

      {isPaymentModalOpen && (
        <PaymentPanel 
          carrinho={carrinho}
          desconto={desconto}
          onDescontoChange={setDesconto}
          formaPagamento={formaPagamento}
          onFormaPagamentoChange={setFormaPagamento}
          valorRecebido={valorRecebido}
          onValorRecebidoChange={setValorRecebido}
          onFinalizarVenda={handleFinalizarVenda}
          caixaAberto={caixaAberto}
          // Para fechar o modal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
        />
      )}

      <SangriaDialog
        isOpen={isSangriaDialogOpen}
        onOpenChange={setIsSangriaDialogOpen}
        onSubmit={realizarSangria}
      />
    </div>
  );
};

export default PDV;
