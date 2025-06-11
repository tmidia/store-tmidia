
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

  console.log('Usuário criado no Auth:', authData.user?.id);

  if (authData.user) {
    // Aguardar um pouco para garantir que o usuário foi criado no Auth
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username: formData.username,
        full_name: capitalizedName,
        user_type: formData.user_type
      });

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError);
      throw profileError;
    }

    console.log('Perfil criado com sucesso');

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
      } else {
        console.log('Permissões criadas com sucesso');
      }
    }
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

  await supabase
    .from('user_permissions')
    .delete()
    .eq('user_id', user.id);

  if (formData.permissions.length > 0) {
    const permissions = formData.permissions.map(module => ({
      user_id: user.id,
      module: module as any
    }));

    await supabase
      .from('user_permissions')
      .insert(permissions);
  }
};

export const toggleUserStatus = async (user: UserWithPermissions): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: !user.is_active })
    .eq('id', user.id);

  if (error) throw error;
};
