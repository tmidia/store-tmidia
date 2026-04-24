
import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { useSystemParameters } from '@/hooks/useSystemParameters';
import { usePDVLogic } from '@/hooks/usePDVLogic';
import { usePdvTheme } from '@/hooks/usePdvTheme';
import PDVHeader from '@/components/pdv/PDVHeader';
import PDVModeSelector from '@/components/pdv/PDVModeSelector';
import PDVMainContent from '@/components/pdv/PDVMainContent';
import PDVKeyboardHandler from '@/components/pdv/PDVKeyboardHandler';
import PDVFullscreenManager from '@/components/pdv/PDVFullscreenManager';
import { SangriaDialog } from '@/components/pdv/SangriaDialog';
import PaymentPanel from '@/components/pdv/PaymentPanel';
import ReceiptModal from '@/components/pdv/ReceiptModal';

const PDV = () => {
  const { isPDVEnabled } = useSystemParameters();
  const {
    searchTerm,
    setSearchTerm,
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
    produtosFiltrados,
    loading,
    adicionarAoCarrinho,
    removerDoCarrinho,
    alterarQuantidade,
    limparCarrinho,
    abrirCaixa,
    fecharCaixa,
    realizarSangria,
    finalizarVenda,
    receiptData,
    clearAndNextCustomer
  } = usePDVLogic();
  
  const { theme, toggleTheme } = usePdvTheme();
  const [isSangriaDialogOpen, setIsSangriaDialogOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleFinalizarVenda = (dadosVenda: any) => {
    finalizarVenda(dadosVenda);
    setIsPaymentModalOpen(false);
  };

  const handleCancelSale = () => {
    if (carrinho.length === 0) return;
    if (window.confirm('Deseja realmente cancelar a venda e limpar o carrinho?')) {
      limparCarrinho();
    }
  };

  const handleToggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
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

  return (
    <div className={`p-4 min-h-screen group ${theme} group-[.pdv-classic]:bg-slate-400 group-[.pdv-classic]:font-sans`}>
      {/* Manager Components */}
      <PDVFullscreenManager caixaAberto={caixaAberto} />
      <PDVKeyboardHandler
        caixaAberto={caixaAberto}
        onCancelSale={handleCancelSale}
        setIsPaymentModalOpen={setIsPaymentModalOpen}
        isPaymentModalOpen={isPaymentModalOpen}
        searchInputRef={searchInputRef}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* Header */}
      <PDVHeader 
        caixaAberto={caixaAberto}
        onAbrirCaixa={abrirCaixa}
        onFecharCaixa={fecharCaixa}
        onToggleTheme={toggleTheme}
      />

      {/* Content */}
      <PDVModeSelector 
        modoConsulta={modoConsulta}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setModoConsulta={setModoConsulta}
        caixaAberto={caixaAberto}
        produtosFiltrados={produtosFiltrados}
        adicionarAoCarrinho={adicionarAoCarrinho}
      />

      {!modoConsulta && (
        <PDVMainContent
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          modoConsulta={modoConsulta}
          setModoConsulta={setModoConsulta}
          caixaAberto={caixaAberto}
          produtosFiltrados={produtosFiltrados}
          adicionarAoCarrinho={adicionarAoCarrinho}
          carrinho={carrinho}
          removerDoCarrinho={removerDoCarrinho}
          alterarQuantidade={alterarQuantidade}
          limparCarrinho={limparCarrinho}
          desconto={desconto}
          setIsPaymentModalOpen={setIsPaymentModalOpen}
          searchInputRef={searchInputRef}
          onCancelSale={handleCancelSale}
          onToggleFullscreen={handleToggleFullscreen}
        />
      )}

      {/* Modals */}
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
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
        />
      )}

      <SangriaDialog
        isOpen={isSangriaDialogOpen}
        onOpenChange={setIsSangriaDialogOpen}
        onSubmit={realizarSangria}
      />

      {receiptData && (
        <ReceiptModal
          isOpen={!!receiptData}
          onClose={clearAndNextCustomer}
          receiptData={receiptData}
          autoPrint={true}
        />
      )}
    </div>
  );
};

export default PDV;
