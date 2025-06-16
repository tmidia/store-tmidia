
import { useState, useMemo } from 'react';
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

  // Usar useMemo para otimizar a filtragem e adicionar logs para debug
  const produtosFiltrados = useMemo(() => {
    console.log('🔍 Filtrando produtos:', { 
      searchTerm, 
      totalProdutos: produtos.length,
      produtos: produtos.slice(0, 3) // Mostra apenas os 3 primeiros para debug
    });
    
    if (!searchTerm || searchTerm.trim() === '') {
      console.log('🔍 Termo de busca vazio, retornando array vazio');
      return [];
    }
    
    const termoBusca = searchTerm.toLowerCase().trim();
    const filtered = produtos.filter(produto => {
      const nomeMatch = produto.name?.toLowerCase().includes(termoBusca);
      const codigoMatch = produto.code?.toLowerCase().includes(termoBusca);
      return nomeMatch || codigoMatch;
    });
    
    console.log('🔍 Produtos filtrados:', { 
      termoBusca, 
      encontrados: filtered.length,
      produtos: filtered.slice(0, 3) // Mostra apenas os 3 primeiros para debug
    });
    
    return filtered;
  }, [produtos, searchTerm]);

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
