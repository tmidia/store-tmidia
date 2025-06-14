
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

    console.log('🔐 INICIANDO ATUALIZAÇÃO DE SENHA');
    console.log('👤 Usuário:', {
      id: user.id,
      email: user.email,
      username: user.username
    });

    try {
      console.log('📞 Chamando função edge update-user-password...');
      
      const { data: functionResponse, error: functionError } = await supabase.functions.invoke('update-user-password', {
        body: {
          user_id: user.id,
          new_password: sanitizedPassword
        }
      });

      console.log('📨 Resposta da função edge:', functionResponse);

      if (functionError) {
        console.error('❌ Erro da função edge:', functionError);
        throw new Error(`Erro ao atualizar senha: ${functionError.message}`);
      }

      if (functionResponse?.error) {
        console.error('❌ Erro na resposta:', functionResponse.error);
        throw new Error(`Erro ao atualizar senha: ${functionResponse.error}`);
      }

      if (!functionResponse?.success) {
        console.error('❌ Resposta sem sucesso:', functionResponse);
        throw new Error('Falha na atualização da senha - resposta inválida');
      }

      console.log('✅ Senha atualizada com sucesso!');
      console.log('📊 Dados:', functionResponse);
      
    } catch (functionError: any) {
      console.error('💥 ERRO CRÍTICO ao atualizar senha:', functionError);
      console.error('🔍 Tipo:', typeof functionError);
      console.error('📝 Mensagem:', functionError.message);
      console.error('📋 Stack:', functionError.stack);
      
      let errorMessage = 'Falha ao atualizar senha. ';
      
      if (functionError.message?.includes('fetch')) {
        errorMessage += 'Erro de conexão com o servidor.';
      } else if (functionError.message?.includes('Invalid login credentials')) {
        errorMessage += 'Erro interno na atualização. Tente novamente.';
      } else if (functionError.message?.includes('User not found')) {
        errorMessage += 'Usuário não encontrado.';
      } else {
        errorMessage += `Erro: ${functionError.message}`;
      }
      
      throw new Error(errorMessage);
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
