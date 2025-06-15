
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { useSystemParameters } from '@/hooks/useSystemParameters';
import { usePDVLogic } from '@/hooks/usePDVLogic';
import PDVHeader from '@/components/pdv/PDVHeader';
import ProductSearch from '@/components/pdv/ProductSearch';
import ProductList from '@/components/pdv/ProductList';
import ShoppingCart from '@/components/pdv/ShoppingCart';
import PaymentPanel from '@/components/pdv/PaymentPanel';
import ConsultationPanel from '@/components/pdv/ConsultationPanel';

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
    finalizarVenda
  } = usePDVLogic();

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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Produtos */}
        <div className="lg:col-span-2 space-y-6">
          <PDVHeader 
            caixaAberto={caixaAberto}
            onAbrirCaixa={abrirCaixa}
            onFecharCaixa={fecharCaixa}
          />

          {!caixaAberto && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Caixa fechado - Vendas bloqueadas (Consulta de produtos permitida)</span>
                </div>
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
    </div>
  );
};

export default PDV;
