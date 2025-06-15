import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCashManagement } from './pdv/useCashManagement';
import { useCartManagement } from './pdv/useCartManagement';
import { useSalesProcessing } from './pdv/useSalesProcessing';

export const usePDVLogic = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [desconto, setDesconto] = useState(0);
  const [formaPagamento, setFormaPagamento] = useState('');
  const [valorRecebido, setValorRecebido] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [modoConsulta, setModoConsulta] = useState(false);

  const { produtos, loading } = useProducts();
  const { caixaAberto, sessionId, abrirCaixa, fecharCaixa, realizarSangria } = useCashManagement();
  const { carrinho, adicionarAoCarrinho, removerDoCarrinho, alterarQuantidade, limparCarrinho } = useCartManagement(produtos, caixaAberto);
  const { finalizarVenda: processarVenda } = useSalesProcessing();

  const finalizarVenda = async (dadosVenda: any) => {
    await processarVenda(
      dadosVenda,
      carrinho,
      caixaAberto,
      sessionId,
      () => {
        // Limpar dados após venda bem-sucedida
        limparCarrinho();
        setDesconto(0);
        setFormaPagamento('');
        setValorRecebido('');
        setClienteNome('');
      }
    );
  };

  const produtosFiltrados = produtos.filter(produto =>
    produto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
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
    finalizarVenda
  };
};
