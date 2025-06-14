import { supabase } from '@/integrations/supabase/client';
import type { UserWithPermissions, UserFormData } from '@/types/user';
import { capitalizeWords } from '@/utils/userUtils';
import { validateEmail, validatePassword, validateUsername, validateName, sanitizeInput } from '@/utils/inputValidation';

export const fetchUsers = async (): Promise<UserWithPermissions[]> => {
  // Buscar perfis dos usuários
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (profiles) {
    const usersWithPermissions = await Promise.all(
      profiles.map(async (profile) => {
        // Buscar permissões do usuário
        const { data: permissions } = await supabase
          .from('user_permissions')
          .select('module')
          .eq('user_id', profile.id);

        // Buscar email do usuário na tabela auth.users através da API admin
        let userEmail = '';
        try {
          const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
          userEmail = userData.user?.email || '';
        } catch (error) {
          console.error('Erro ao buscar email do usuário:', error);
          // Se não conseguir buscar via admin, tentar via função
          try {
            const { data: emailData } = await supabase.functions.invoke('get-user-email', {
              body: { user_id: profile.id }
            });
            userEmail = emailData?.email || '';
          } catch (fnError) {
            console.error('Erro ao buscar email via função:', fnError);
          }
        }
        
        return {
          ...profile,
          email: userEmail,
          permissions: permissions?.map(p => p.module) || []
        };
      })
    );
    return usersWithPermissions;
  }

  return [];
};

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

export const toggleUserStatus = async (user: UserWithPermissions): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: !user.is_active })
    .eq('id', user.id);

  if (error) throw error;
};
