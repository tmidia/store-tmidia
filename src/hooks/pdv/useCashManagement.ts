
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
    
    console.log('🔍 Verificando status do caixa:', { caixaStatus, sessionIdLocal });
    
    setCaixaAberto(caixaStatus === 'true');
    if (sessionIdLocal) {
      setSessionId(sessionIdLocal);
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
    const valorFinal = prompt("Digite o valor final do caixa:");
    if (valorFinal && !isNaN(parseFloat(valorFinal)) && sessionId) {
      try {
        const valorInicialStr = localStorage.getItem('valorInicialCaixa');
        const valorInicial = valorInicialStr ? parseFloat(valorInicialStr) : 0;
        const valorFinalNum = parseFloat(valorFinal);
        
        // Calcular vendas do dia para o valor esperado
        const { data: vendas } = await supabase
          .from('financial_transactions')
          .select('amount')
          .eq('type', 'venda')
          .gte('created_at', new Date().toISOString().split('T')[0]);

        const totalVendas = vendas?.reduce((sum, venda) => sum + Number(venda.amount), 0) || 0;
        const valorEsperado = valorInicial + totalVendas;
        const diferenca = valorFinalNum - valorEsperado;

        console.log('💰 Fechando caixa:', {
          valorInicial,
          valorFinal: valorFinalNum,
          totalVendas,
          valorEsperado,
          diferenca,
          sessionId
        });

        // Atualizar sessão de caixa
        const { error } = await supabase
          .from('cash_sessions')
          .update({
            closing_amount: valorFinalNum,
            expected_amount: valorEsperado,
            difference: diferenca,
            closed_at: new Date().toISOString(),
            status: 'closed'
          })
          .eq('id', sessionId);

        if (error) {
          console.error('Erro ao fechar caixa:', error);
          toast({
            title: "Erro ao fechar caixa",
            description: "Não foi possível registrar o fechamento do caixa.",
            variant: "destructive",
          });
          return;
        }

        console.log('✅ Caixa fechado no banco de dados com sucesso');

        // Primeiro, atualizar os estados
        setCaixaAberto(false);
        setSessionId(null);

        // Depois, limpar o localStorage
        localStorage.removeItem('caixaAberto');
        localStorage.removeItem('valorInicialCaixa');
        localStorage.removeItem('valorFinalCaixa');
        localStorage.removeItem('dataAberturaCaixa');
        localStorage.removeItem('dataFechamentoCaixa');
        localStorage.removeItem('sessionId');
        
        console.log('🧹 localStorage limpo e estados atualizados');
        
        const mensagem = diferenca === 0 
          ? `Caixa fechado! Valor final: R$ ${valorFinalNum.toFixed(2)} (Conferido)`
          : `Caixa fechado! Valor final: R$ ${valorFinalNum.toFixed(2)} (Diferença: R$ ${diferenca.toFixed(2)})`;
        
        toast({
          title: "Caixa fechado!",
          description: mensagem,
          variant: diferenca === 0 ? "default" : "destructive",
        });
      } catch (error) {
        console.error('Erro ao fechar caixa:', error);
        toast({
          title: "Erro ao fechar caixa",
          description: "Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  return {
    caixaAberto,
    sessionId,
    abrirCaixa,
    fecharCaixa
  };
};
