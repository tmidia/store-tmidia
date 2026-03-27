
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const usePasswordReset = () => {
  const [isNewPasswordMode, setIsNewPasswordMode] = useState(false);

  useEffect(() => {
    // Verificar se há tokens de recuperação na URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const type = hashParams.get('type');

    if (accessToken && refreshToken && type === 'recovery') {
      // Configurar a sessão com os tokens de recuperação
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      }).then(({ error }) => {
        if (error) {
          console.error('Erro ao definir sessão:', error);
          toast({
            title: "Erro na recuperação",
            description: "Link de recuperação inválido ou expirado.",
            variant: "destructive",
          });
        } else {
          setIsNewPasswordMode(true);
          // Limpar a URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      });
    }
  }, []);

  const handlePasswordReset = async (email: string) => {
    if (!email) {
      toast({
        title: "Email necessário",
        description: "Digite seu email para recuperar a senha.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const redirectUrl = window.location.hostname === 'localhost' 
        ? `${window.location.origin}/login`
        : 'https://loja.tmidia.com.br/login';
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        toast({
          title: "Erro ao enviar email",
          description: error.message,
          variant: "destructive",
        });
        return false;
      } else {
        toast({
          title: "Email enviado!",
          description: "Verifique sua caixa de entrada para redefinir sua senha.",
        });
        return true;
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleNewPasswordSubmit = async (newPassword: string, confirmPassword: string) => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "As senhas digitadas não são iguais.",
        variant: "destructive",
      });
      return false;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast({
          title: "Erro ao atualizar senha",
          description: error.message,
          variant: "destructive",
        });
        return false;
      } else {
        toast({
          title: "Senha atualizada!",
          description: "Sua senha foi alterada com sucesso.",
        });
        setIsNewPasswordMode(false);
        return true;
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    isNewPasswordMode,
    setIsNewPasswordMode,
    handlePasswordReset,
    handleNewPasswordSubmit
  };
};
