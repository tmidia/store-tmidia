
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useChangePassword = () => {
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      throw new Error('A senha deve ter pelo menos 8 caracteres');
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      throw new Error('A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número');
    }
  };

  const sanitizeInput = (input: string) => {
    return input.trim().replace(/[<>]/g, '');
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    
    try {
      const sanitizedCurrentPassword = sanitizeInput(currentPassword);
      const sanitizedNewPassword = sanitizeInput(newPassword);
      
      validatePassword(sanitizedNewPassword);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        throw new Error('Usuário não encontrado');
      }

      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: sanitizedCurrentPassword,
      });

      if (signInError) {
        throw new Error('Senha atual incorreta');
      }

      // Update to new password using Supabase's secure method
      const { error: updateError } = await supabase.auth.updateUser({
        password: sanitizedNewPassword
      });

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Senha alterada com sucesso!",
        description: "Sua senha foi atualizada com segurança.",
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: "Erro ao alterar senha",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    changePassword,
    isLoading
  };
};
