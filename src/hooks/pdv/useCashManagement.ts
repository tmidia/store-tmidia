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

  const abrirCaixa = async (valorInicialInput: string = "0") => {
    const valorInicial = valorInicialInput.replace(',', '.');
    if (valorInicial && !isNaN(parseFloat(valorInicial))) {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        // Salvar sessão de caixa no banco de dados
        const { data, error } = await supabase
          .from('cash_sessions')
          .insert({
            opening_amount: parseFloat(valorInicial),
            status: 'aberta',
            user_id: user?.id
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

  const fecharCaixa = async (valorFinalInput: string = "0") => {
    if (valorFinalInput === null) {
      console.log('Fechamento de caixa cancelado pelo usuário.');
      return; 
    }

    const valorFinal = parseFloat(valorFinalInput.replace(',', '.'));
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
      const valorInicial = valorInicialStr ? parseFloat(valorInicialStr) : 0;
      
      const { data: transacoes, error: transacoesError } = await supabase
        .from('financial_transactions')
        .select('type, amount')
        .eq('reference_id', sessionId);

      if (transacoesError) {
        console.error('Erro ao buscar transações da sessão:', transacoesError);
        toast({
          title: "Erro ao buscar dados",
          description: "Não foi possível carregar as transações da sessão para o fechamento.",
          variant: "destructive",
        });
        return;
      }

      const totalVendas = transacoes
        ?.filter(t => t.type === 'venda')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0;

      const totalSangrias = transacoes
        ?.filter(t => t.type === 'sangria')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0;

      const valorEsperado = valorInicial + totalVendas - totalSangrias;
      const diferenca = valorFinal - valorEsperado;

      console.log('💰 Fechando caixa:', {
        valorInicial,
        valorFinal,
        totalVendas,
        totalSangrias,
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
          status: 'fechada'
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

  const realizarSangria = async (amount: number, reason: string) => {
    if (!caixaAberto || !sessionId) {
      toast({
        title: 'Caixa Fechado',
        description: 'É necessário abrir o caixa para realizar uma sangria.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('financial_transactions')
        .insert({
          type: 'sangria',
          amount: amount,
          description: reason,
          reference_id: sessionId,
          transaction_date: new Date().toISOString().split('T')[0],
          notes: `Sangria do caixa (Sessão: ${sessionId})`
        });

      if (error) {
        console.error('Erro ao realizar sangria:', error);
        toast({
          title: 'Erro ao realizar sangria',
          description: 'Não foi possível registrar a sangria no banco de dados.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Sangria realizada com sucesso!',
        description: `Valor: R$ ${amount.toFixed(2)}`,
      });
    } catch (error) {
      console.error('Erro inesperado ao realizar sangria:', error);
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro ao tentar registrar a sangria.',
        variant: 'destructive',
      });
    }
  };

  return {
    caixaAberto,
    sessionId,
    abrirCaixa,
    fecharCaixa,
    realizarSangria,
  };
};
