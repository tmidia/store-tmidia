import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useCashManagement = () => {
  const [caixaAberto, setCaixaAberto] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Verificar se o caixa está aberto ao carregar a página
  useEffect(() => {
    const caixaStatus = localStorage.getItem('caixaAberto');
    const sessionIdLocal = localStorage.getItem('sessionId');
    
    console.log('🔍 Verificando status do caixa ao carregar:', { caixaStatus, sessionIdLocal });

    if (caixaStatus === 'true' && sessionIdLocal) {
      console.log('✅ Estado do caixa consistente. Definindo como aberto.');
      setCaixaAberto(true);
      setSessionId(sessionIdLocal);
    } else if (caixaStatus === 'true' && !sessionIdLocal) {
      console.warn('⚠️ Inconsistência detectada: Caixa "aberto" mas sem ID de sessão. Forçando o estado para "fechado".');
      setCaixaAberto(false);
      setSessionId(null);
      localStorage.removeItem('caixaAberto');
      localStorage.removeItem('valorInicialCaixa');
      localStorage.removeItem('dataAberturaCaixa');
      localStorage.removeItem('sessionId');
    } else {
      console.log('ℹ️ Caixa está corretamente fechado.');
      setCaixaAberto(false);
      setSessionId(null);
    }
  }, []);

  const abrirCaixa = async () => {
    const valorInicial = prompt("Digite o valor inicial do caixa:");
    if (valorInicial && !isNaN(parseFloat(valorInicial))) {
      try {
        // Salvar sessão de caixa no banco de dados
        const { data, error } = await supabase
          .from('cash_sessions')
          .insert({
            opening_amount: parseFloat(valorInicial),
            status: 'open'
          })
          .select()
          .single();

        if (error) {
          console.error('Erro ao abrir caixa:', error);
          toast({
            title: "Erro ao abrir caixa",
            description: "Não foi possível registrar a abertura do caixa.",
            variant: "destructive",
          });
          return;
        }

        localStorage.setItem('caixaAberto', 'true');
        localStorage.setItem('valorInicialCaixa', valorInicial);
        localStorage.setItem('dataAberturaCaixa', new Date().toISOString());
        localStorage.setItem('sessionId', data.id);
        
        console.log('✅ Caixa aberto com sucesso:', { sessionId: data.id, valorInicial });
        
        setSessionId(data.id);
        setCaixaAberto(true);
        
        toast({
          title: "Caixa aberto!",
          description: `Valor inicial: R$ ${parseFloat(valorInicial).toFixed(2)}`,
        });
      } catch (error) {
        console.error('Erro ao abrir caixa:', error);
        toast({
          title: "Erro ao abrir caixa",
          description: "Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  const fecharCaixa = async () => {
    const valorFinalPrompt = prompt("Digite o valor final do caixa:");
    if (valorFinalPrompt === null) {
      console.log('Fechamento de caixa cancelado pelo usuário.');
      return; // User cancelled
    }

    const valorFinal = parseFloat(valorFinalPrompt);
    if (isNaN(valorFinal)) {
      toast({
        title: "Valor inválido",
        description: "O valor final deve ser um número.",
        variant: "destructive",
      });
      return;
    }
    
    if (!sessionId) {
      console.error('❌ Erro Crítico: Tentativa de fechar caixa sem um ID de sessão. Corrigindo estado local.');
      toast({
        title: "Erro de Sessão",
        description: "A sessão do caixa não foi encontrada. O caixa será forçado a fechar localmente. Por favor, verifique os relatórios.",
        variant: "destructive",
      });
      setCaixaAberto(false);
      setSessionId(null);
      localStorage.removeItem('caixaAberto');
      localStorage.removeItem('valorInicialCaixa');
      localStorage.removeItem('dataAberturaCaixa');
      localStorage.removeItem('sessionId');
      return;
    }

    try {
      const valorInicialStr = localStorage.getItem('valorInicialCaixa');
      const dataAbertura = localStorage.getItem('dataAberturaCaixa');
      const valorInicial = valorInicialStr ? parseFloat(valorInicialStr) : 0;

      if (!dataAbertura) {
        toast({ title: "Erro de Dados", description: "Não foi possível encontrar a data de abertura do caixa. O cálculo pode estar incorreto.", variant: "destructive" });
      }
      
      const { data: vendas } = await supabase
        .from('financial_transactions')
        .select('amount')
        .eq('type', 'venda')
        .gte('created_at', dataAbertura || new Date(0).toISOString()); // Fallback to epoch if no date found

      const totalVendas = vendas?.reduce((sum, venda) => sum + Number(venda.amount), 0) || 0;
      const valorEsperado = valorInicial + totalVendas;
      const diferenca = valorFinal - valorEsperado;

      console.log('💰 Fechando caixa:', {
        valorInicial,
        valorFinal,
        totalVendas,
        valorEsperado,
        diferenca,
        sessionId
      });

      // Atualizar sessão de caixa
      const { error } = await supabase
        .from('cash_sessions')
        .update({
          closing_amount: valorFinal,
          expected_amount: valorEsperado,
          difference: diferenca,
          closed_at: new Date().toISOString(),
          status: 'closed'
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Erro ao fechar caixa no DB:', error);
        toast({
          title: "Erro ao fechar caixa",
          description: "Não foi possível registrar o fechamento no banco de dados.",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Caixa fechado no banco de dados com sucesso');

      // Limpar estados e localStorage
      setCaixaAberto(false);
      setSessionId(null);
      localStorage.removeItem('caixaAberto');
      localStorage.removeItem('valorInicialCaixa');
      localStorage.removeItem('dataAberturaCaixa');
      localStorage.removeItem('sessionId');
      
      console.log('🧹 localStorage limpo e estados atualizados');
      
      const mensagem = diferenca === 0 
        ? `Caixa fechado! Valor final: R$ ${valorFinal.toFixed(2)} (Conferido)`
        : `Caixa fechado! Valor final: R$ ${valorFinal.toFixed(2)} (Diferença: R$ ${diferenca.toFixed(2)})`;
      
      toast({
        title: "Caixa fechado!",
        description: mensagem,
        variant: diferenca === 0 ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Erro inesperado ao fechar caixa:', error);
      toast({
        title: "Erro ao fechar caixa",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return {
    caixaAberto,
    sessionId,
    abrirCaixa,
    fecharCaixa
  };
};
