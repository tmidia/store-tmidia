
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event, {
          userId: session?.user?.id,
          email: session?.user?.email,
          hasSession: !!session
        });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('✅ Usuário autenticado:', session?.user?.email);
          
          // Verificar se o perfil existe
          if (session?.user) {
            try {
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              console.log('👤 Perfil carregado:', { profile, error });
            } catch (profileError) {
              console.error('❌ Erro ao carregar perfil:', profileError);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 Usuário desconectado');
        }
        
        setIsLoading(false);
      }
    );

    // Verificar sessão existente
    const checkSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Erro ao verificar sessão:', error);
        } else {
          console.log('🔍 Sessão existente verificada:', {
            userId: currentSession?.user?.id,
            email: currentSession?.user?.email,
            hasSession: !!currentSession
          });
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
        }
      } catch (error) {
        console.error('💥 Erro inesperado ao verificar sessão:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('🚪 Iniciando logout...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Erro ao fazer logout:', error);
        throw error;
      }
      
      setUser(null);
      setSession(null);
      
      // Limpar storage local
      localStorage.removeItem('isAuthenticated');
      
      console.log('✅ Logout realizado com sucesso');
    } catch (error) {
      console.error('💥 Erro no logout:', error);
      throw error;
    }
  };

  return {
    user,
    session,
    isLoading,
    signOut,
    isAuthenticated: !!user
  };
};
