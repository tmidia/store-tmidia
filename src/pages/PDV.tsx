
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, MinusCircle } from 'lucide-react';
import { useSystemParameters } from '@/hooks/useSystemParameters';
import { usePDVLogic } from '@/hooks/usePDVLogic';
import { usePdvTheme } from '@/hooks/usePdvTheme';
import PDVHeader from '@/components/pdv/PDVHeader';
import ProductSearch from '@/components/pdv/ProductSearch';
import ProductList from '@/components/pdv/ProductList';
import ShoppingCart from '@/components/pdv/ShoppingCart';
import PaymentPanel from '@/components/pdv/PaymentPanel';
import ConsultationPanel from '@/components/pdv/ConsultationPanel';
import { SangriaDialog } from '@/components/pdv/SangriaDialog';
import { Button } from '@/components/ui/button';

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
    produtosFiltrados,
    loading,
    adicionarAoCarrinho,
    removerDoCarrinho,
    alterarQuantidade,
    abrirCaixa,
    fecharCaixa,
    realizarSangria,
    finalizarVenda
  } = usePDVLogic();
  const { theme, toggleTheme } = usePdvTheme();
  const [isSangriaDialogOpen, setIsSangriaDialogOpen] = useState(false);

  // Verificar se o PDV está habilitado
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
    <div className={`p-6 min-h-screen group ${theme} group-[.pdv-classic]:bg-slate-400 group-[.pdv-classic]:font-sans`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Produtos */}
        <div className="lg:col-span-2 space-y-6">
          <PDVHeader 
            caixaAberto={caixaAberto}
            onAbrirCaixa={abrirCaixa}
            onFecharCaixa={fecharCaixa}
            onToggleTheme={toggleTheme}
          />

          {!caixaAberto && (
            <Card className="border-red-200 bg-red-50 group-[.pdv-classic]:bg-red-200 group-[.pdv-classic]:border-2 group-[.pdv-classic]:border-red-400 group-[.pdv-classic]:shadow-none">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-700 group-[.pdv-classic]:text-red-900">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Caixa fechado - Vendas bloqueadas (Consulta de produtos permitida)</span>
                </div>
              </CardContent>
            </Card>
          )}

          {caixaAberto && (
            <Card className="group-[.pdv-classic]:bg-transparent group-[.pdv-classic]:border-none group-[.pdv-classic]:shadow-none">
              <CardContent className="p-4 flex items-center justify-end group-[.pdv-classic]:p-0">
                  <Button 
                    variant="secondary" 
                    onClick={() => setIsSangriaDialogOpen(true)}
                    className="group-[.pdv-classic]:bg-slate-300 group-[.pdv-classic]:border-2 group-[.pdv-classic]:border-t-slate-200 group-[.pdv-classic]:border-l-slate-200 group-[.pdv-classic]:border-b-slate-500 group-[.pdv-classic]:border-r-slate-500 group-[.pdv-classic]:text-black group-[.pdv-classic]:shadow-none group-[.pdv-classic]:rounded-none group-[.pdv-classic]:hover:bg-slate-400 group-[.pdv-classic]:active:border-t-slate-500 group-[.pdv-classic]:active:border-l-slate-500 group-[.pdv-classic]:active:border-b-slate-200 group-[.pdv-classic]:active:border-r-slate-200"
                  >
                    <MinusCircle className="mr-2" />
                    Realizar Sangria
                  </Button>
              </CardContent>
            </Card>
          )}

          <ProductSearch 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            modoConsulta={modoConsulta}
            onModoConsultaChange={setModoConsulta}
            caixaAberto={caixaAberto}
          />

          <ProductList 
            produtos={produtosFiltrados}
            modoConsulta={modoConsulta}
            caixaAberto={caixaAberto}
            onAdicionarAoCarrinho={adicionarAoCarrinho}
          />
        </div>

        {/* Carrinho e Pagamento - Só exibir se não estiver em modo consulta */}
        {!modoConsulta && (
          <div className="space-y-6">
            <ShoppingCart 
              carrinho={carrinho}
              clienteNome={clienteNome}
              onClienteNomeChange={setClienteNome}
              onRemoverDoCarrinho={removerDoCarrinho}
              onAlterarQuantidade={alterarQuantidade}
              caixaAberto={caixaAberto}
            />

            <PaymentPanel 
              carrinho={carrinho}
              desconto={desconto}
              onDescontoChange={setDesconto}
              formaPagamento={formaPagamento}
              onFormaPagamentoChange={setFormaPagamento}
              valorRecebido={valorRecebido}
              onValorRecebidoChange={setValorRecebido}
              onFinalizarVenda={finalizarVenda}
              caixaAberto={caixaAberto}
            />
          </div>
        )}

        {/* Painel de Consulta - Só exibir se estiver em modo consulta */}
        {modoConsulta && (
          <div className="space-y-6">
            <ConsultationPanel />
          </div>
        )}
      </div>
      <SangriaDialog
        isOpen={isSangriaDialogOpen}
        onOpenChange={setIsSangriaDialogOpen}
        onSubmit={realizarSangria}
      />
    </div>
  );
};

export default PDV;
