
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const usePasswordReset = () => {
  const [isNewPasswordMode, setIsNewPasswordMode] = useState(false);

  useEffect(() => {
    // Escutar eventos de auth para identificar recuperação de senha (Supabase v2)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsNewPasswordMode(true);
      }
    });

    // Fallback: Verificar se há tokens de recuperação na URL ou query params
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const searchParams = new URLSearchParams(window.location.search);
    const type = hashParams.get('type') || searchParams.get('type');

    if (type === 'recovery') {
      setIsNewPasswordMode(true);
    }

    return () => {
      subscription.unsubscribe();
    };
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
