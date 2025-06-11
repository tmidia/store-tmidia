
import { supabase } from '@/integrations/supabase/client';
import type { UserWithPermissions, UserFormData } from '@/types/user';
import { capitalizeWords } from '@/utils/userUtils';

export const fetchUsers = async (): Promise<UserWithPermissions[]> => {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (profiles) {
    const usersWithPermissions = await Promise.all(
      profiles.map(async (profile) => {
        const { data: permissions } = await supabase
          .from('user_permissions')
          .select('module')
          .eq('user_id', profile.id);

        return {
          ...profile,
          permissions: permissions?.map(p => p.module) || []
        };
      })
    );
    return usersWithPermissions;
  }

  return [];
};

export const createUser = async (formData: UserFormData): Promise<void> => {
  const capitalizedName = capitalizeWords(formData.full_name);

  console.log('Tentando criar usuário:', { email: formData.email, username: formData.username });

  // Primeiro, criar o usuário no Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        username: formData.username,
        full_name: capitalizedName,
        user_type: formData.user_type
      }
    }
  });

  if (authError) {
    console.error('Erro de autenticação:', authError);
    throw authError;
  }

  if (!authData.user) {
    throw new Error('Falha ao criar usuário');
  }

  console.log('Usuário criado no Auth:', authData.user.id);

  try {
    // Aguardar um pouco para garantir que o usuário foi criado no Auth
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Criar o perfil na tabela profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username: formData.username,
        full_name: capitalizedName,
        user_type: formData.user_type,
        is_active: true
      });

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError);
      // Se falhar ao criar o perfil, tentar deletar o usuário do Auth
      try {
        await supabase.auth.admin.deleteUser(authData.user.id);
      } catch (cleanupError) {
        console.error('Erro ao limpar usuário do Auth:', cleanupError);
      }
      throw profileError;
    }

    console.log('Perfil criado com sucesso');

    // Criar permissões se especificadas
    if (formData.permissions.length > 0) {
      const permissions = formData.permissions.map(module => ({
        user_id: authData.user.id,
        module: module as any
      }));

      const { error: permissionsError } = await supabase
        .from('user_permissions')
        .insert(permissions);

      if (permissionsError) {
        console.error('Erro ao criar permissões:', permissionsError);
        // Não fazer rollback completo por conta das permissões, apenas logar o erro
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
  const capitalizedName = capitalizeWords(formData.full_name);
  
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      username: formData.username,
      full_name: capitalizedName,
      user_type: formData.user_type
    })
    .eq('id', user.id);

  if (updateError) throw updateError;

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
