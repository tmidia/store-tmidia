
import { supabase } from '@/integrations/supabase/client';
import type { UserWithPermissions, UserFormData } from '@/types/user';
import { capitalizeWords } from '@/utils/userUtils';
import { validatePassword, validateUsername, validateName, validateCPF, sanitizeInput } from '@/utils/inputValidation';

export const updateUser = async (user: UserWithPermissions, formData: UserFormData): Promise<void> => {
  // Validate and sanitize inputs
  const sanitizedUsername = sanitizeInput(formData.username);
  const sanitizedFullName = sanitizeInput(formData.full_name);
  const sanitizedCPF = sanitizeInput(formData.cpf);
  
  const usernameValidation = validateUsername(sanitizedUsername);
  if (!usernameValidation.isValid) {
    throw new Error(usernameValidation.message);
  }
  
  const nameValidation = validateName(sanitizedFullName);
  if (!nameValidation.isValid) {
    throw new Error(nameValidation.message);
  }

  // Verificar se username já existe APENAS se foi alterado
  if (sanitizedUsername !== user.username) {
    const { data: existingUser, error: usernameCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', sanitizedUsername)
      .neq('id', user.id)
      .maybeSingle();

    if (usernameCheckError) {
      console.error('Erro ao verificar username:', usernameCheckError);
    }

    if (existingUser) {
      throw new Error('Este nome de usuário já existe. Escolha outro.');
    }
  }

  // Validar CPF se fornecido
  if (sanitizedCPF) {
    const cpfValidation = validateCPF(sanitizedCPF);
    if (!cpfValidation.isValid) {
      throw new Error(cpfValidation.message);
    }

    // Verificar se CPF já existe APENAS se foi alterado ou se não existia antes
    if (sanitizedCPF !== user.cpf) {
      const { data: existingCPF, error: cpfCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('cpf', sanitizedCPF)
        .neq('id', user.id)
        .maybeSingle();

      if (cpfCheckError) {
        console.error('Erro ao verificar CPF:', cpfCheckError);
      }

      if (existingCPF) {
        throw new Error('CPF já cadastrado para outro usuário');
      }
    }
  }

  const capitalizedName = capitalizeWords(sanitizedFullName);
  
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      username: sanitizedUsername,
      full_name: capitalizedName,
      cpf: sanitizedCPF,
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
    console.log('Email do usuário:', user.email);

    try {
      // Usar a função edge para atualizar a senha
      const { data, error: passwordError } = await supabase.functions.invoke('update-user-password', {
        body: {
          user_id: user.id,
          new_password: sanitizedPassword
        }
      });

      if (passwordError) {
        console.error('Erro ao atualizar senha:', passwordError);
        throw new Error('Erro ao atualizar senha do usuário: ' + passwordError.message);
      }

      console.log('Resposta da função edge:', data);
      console.log('Senha atualizada com sucesso para usuário:', user.id);
      
    } catch (functionError) {
      console.error('Erro ao chamar função de atualização de senha:', functionError);
      throw new Error('Falha ao atualizar senha. Tente novamente.');
    }
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
