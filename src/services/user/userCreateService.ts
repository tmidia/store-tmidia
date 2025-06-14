
import { supabase } from '@/integrations/supabase/client';
import type { UserFormData } from '@/types/user';
import { capitalizeWords } from '@/utils/userUtils';
import { validateEmail, validatePassword, validateUsername, validateName, sanitizeInput } from '@/utils/inputValidation';

export const createUser = async (formData: UserFormData): Promise<void> => {
  // Validate and sanitize inputs
  const sanitizedEmail = sanitizeInput(formData.email);
  const sanitizedUsername = sanitizeInput(formData.username);
  const sanitizedFullName = sanitizeInput(formData.full_name);
  const sanitizedPassword = sanitizeInput(formData.password);
  
  // Validate inputs
  if (!validateEmail(sanitizedEmail)) {
    throw new Error('Email inválido');
  }
  
  const usernameValidation = validateUsername(sanitizedUsername);
  if (!usernameValidation.isValid) {
    throw new Error(usernameValidation.message);
  }
  
  const nameValidation = validateName(sanitizedFullName);
  if (!nameValidation.isValid) {
    throw new Error(nameValidation.message);
  }
  
  const passwordValidation = validatePassword(sanitizedPassword);
  if (!passwordValidation.isValid) {
    throw new Error(passwordValidation.message);
  }

  const capitalizedName = capitalizeWords(sanitizedFullName);

  console.log('Iniciando criação de usuário:', { email: sanitizedEmail, username: sanitizedUsername });

  // Usar signup normal do Supabase
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: sanitizedEmail,
    password: sanitizedPassword,
    options: {
      data: {
        username: sanitizedUsername,
        full_name: capitalizedName,
        user_type: formData.user_type
      }
    }
  });

  if (signUpError) {
    console.error('Erro ao criar usuário:', signUpError);
    throw new Error(signUpError.message);
  }

  if (!signUpData.user) {
    throw new Error('Falha ao criar usuário');
  }

  console.log('Usuário criado:', signUpData.user.id);

  try {
    // Aguardar um pouco para o trigger criar o perfil automaticamente
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verificar se o perfil foi criado automaticamente, se não, criar manualmente
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', signUpData.user.id)
      .single();

    if (!existingProfile) {
      // Criar o perfil manualmente se não foi criado automaticamente
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: signUpData.user.id,
          username: sanitizedUsername,
          full_name: capitalizedName,
          user_type: formData.user_type,
          is_active: true
        });

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        throw new Error('Erro ao criar perfil do usuário');
      }
    } else {
      // Atualizar o perfil existente com os dados corretos
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: sanitizedUsername,
          full_name: capitalizedName,
          user_type: formData.user_type,
          is_active: true
        })
        .eq('id', signUpData.user.id);

      if (updateError) {
        console.error('Erro ao atualizar perfil:', updateError);
        throw new Error('Erro ao atualizar perfil do usuário');
      }
    }

    console.log('Perfil criado/atualizado com sucesso');

    // Criar permissões se especificadas
    if (formData.permissions && formData.permissions.length > 0) {
      const permissions = formData.permissions.map(module => ({
        user_id: signUpData.user.id,
        module: module as any
      }));

      const { error: permissionsError } = await supabase
        .from('user_permissions')
        .insert(permissions);

      if (permissionsError) {
        console.error('Erro ao criar permissões:', permissionsError);
        // Não fazer rollback completo por conta das permissões
      } else {
        console.log('Permissões criadas com sucesso');
      }
    }
  } catch (error) {
    console.error('Erro no processo de criação:', error);
    throw error;
  }
};
