
import { supabase } from '@/integrations/supabase/client';
import type { UserWithPermissions, UserFormData } from '@/types/user';
import { capitalizeWords } from '@/utils/userUtils';
import { validatePassword, validateUsername, validateName, sanitizeInput } from '@/utils/inputValidation';

export const updateUser = async (user: UserWithPermissions, formData: UserFormData): Promise<void> => {
  // Validate and sanitize inputs
  const sanitizedUsername = sanitizeInput(formData.username);
  const sanitizedFullName = sanitizeInput(formData.full_name);
  
  const usernameValidation = validateUsername(sanitizedUsername);
  if (!usernameValidation.isValid) {
    throw new Error(usernameValidation.message);
  }
  
  const nameValidation = validateName(sanitizedFullName);
  if (!nameValidation.isValid) {
    throw new Error(nameValidation.message);
  }

  const capitalizedName = capitalizeWords(sanitizedFullName);
  
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      username: sanitizedUsername,
      full_name: capitalizedName,
      user_type: formData.user_type
    })
    .eq('id', user.id);

  if (updateError) throw updateError;

  // Se uma nova senha foi fornecida, atualizá-la
  if (formData.password && formData.password.trim()) {
    const sanitizedPassword = sanitizeInput(formData.password);
    
    const passwordValidation = validatePassword(sanitizedPassword);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message);
    }

    console.log('Tentando atualizar senha para usuário:', user.id);

    // Usar a função edge para atualizar a senha
    const { error: passwordError } = await supabase.functions.invoke('update-user-password', {
      body: {
        user_id: user.id,
        new_password: sanitizedPassword
      }
    });

    if (passwordError) {
      console.error('Erro ao atualizar senha:', passwordError);
      throw new Error('Erro ao atualizar senha do usuário: ' + passwordError.message);
    }

    console.log('Senha atualizada com sucesso');
  }

  // Remover permissões existentes
  await supabase
    .from('user_permissions')
    .delete()
    .eq('user_id', user.id);

  // Adicionar novas permissões
  if (formData.permissions.length > 0) {
    const permissions = formData.permissions.map(module => ({
      user_id: user.id,
      module: module as any
    }));

    const { error: permissionsError } = await supabase
      .from('user_permissions')
      .insert(permissions);

    if (permissionsError) {
      console.error('Erro ao atualizar permissões:', permissionsError);
    } else {
      console.log('Permissões atualizadas com sucesso');
    }
  }
};
