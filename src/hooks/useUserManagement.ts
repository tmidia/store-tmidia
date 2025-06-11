
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { UserWithPermissions, UserFormData } from '@/types/user';

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserWithPermissions[]>([]);
  const { toast } = useToast();

  const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
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
        setUsers(usersWithPermissions);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const createUser = async (formData: UserFormData) => {
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

    toast({
      title: "Usuário criado",
      description: "O novo usuário foi criado com sucesso.",
    });
  };

  const updateUser = async (user: UserWithPermissions, formData: UserFormData) => {
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

    toast({
      title: "Usuário atualizado",
      description: "As informações do usuário foram atualizadas com sucesso.",
    });
  };

  const toggleUserStatus = async (user: UserWithPermissions) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !user.is_active })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: user.is_active ? "Usuário desativado" : "Usuário ativado",
        description: `O usuário foi ${user.is_active ? 'desativado' : 'ativado'} com sucesso.`,
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar status do usuário.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (editingUser: UserWithPermissions | null, formData: UserFormData) => {
    try {
      if (editingUser) {
        await updateUser(editingUser, formData);
      } else {
        await createUser(formData);
      }

      fetchUsers();
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      
      let errorMessage = "Erro ao salvar usuário.";
      
      if (error.message.includes('User already registered')) {
        errorMessage = "Este email já está cadastrado no sistema.";
      } else if (error.message.includes('invalid email')) {
        errorMessage = "Por favor, insira um email válido.";
      } else if (error.message.includes('password')) {
        errorMessage = "A senha deve ter pelo menos 6 caracteres.";
      } else if (error.message.includes('Username should be') || error.message.includes('unique')) {
        errorMessage = "Este nome de usuário já existe. Escolha outro.";
      } else if (error.message.includes('duplicate key')) {
        errorMessage = "Este usuário já existe no sistema.";
      }

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return {
    users,
    handleSubmit,
    toggleUserStatus,
    fetchUsers
  };
};
