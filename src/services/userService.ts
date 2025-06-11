
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

  console.log('Iniciando criação de usuário:', { email: formData.email, username: formData.username });

  // Usar admin API para criar o usuário diretamente
  const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
    email: formData.email,
    password: formData.password,
    email_confirm: true,
    user_metadata: {
      username: formData.username,
      full_name: capitalizedName,
      user_type: formData.user_type
    }
  });

  if (adminError) {
    console.error('Erro ao criar usuário via admin:', adminError);
    throw new Error(adminError.message);
  }

  if (!adminUser.user) {
    throw new Error('Falha ao criar usuário');
  }

  console.log('Usuário criado via admin API:', adminUser.user.id);

  try {
    // Criar o perfil diretamente
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: adminUser.user.id,
        username: formData.username,
        full_name: capitalizedName,
        user_type: formData.user_type,
        is_active: true
      });

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError);
      // Se falhar ao criar o perfil, tentar deletar o usuário
      try {
        await supabase.auth.admin.deleteUser(adminUser.user.id);
      } catch (cleanupError) {
        console.error('Erro ao limpar usuário:', cleanupError);
      }
      throw new Error(profileError.message);
    }

    console.log('Perfil criado com sucesso');

    // Criar permissões se especificadas
    if (formData.permissions && formData.permissions.length > 0) {
      const permissions = formData.permissions.map(module => ({
        user_id: adminUser.user.id,
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
