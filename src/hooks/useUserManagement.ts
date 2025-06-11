
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { UserWithPermissions, UserFormData } from '@/types/user';
import { fetchUsers, createUser, updateUser, toggleUserStatus as toggleUserStatusService } from '@/services/userService';
import { getUserErrorMessage } from '@/utils/userErrorMessages';

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserWithPermissions[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const handleSubmit = async (editingUser: UserWithPermissions | null, formData: UserFormData) => {
    try {
      if (editingUser) {
        await updateUser(editingUser, formData);
        toast({
          title: "Usuário atualizado",
          description: "As informações do usuário foram atualizadas com sucesso.",
        });
      } else {
        await createUser(formData);
        toast({
          title: "Usuário criado",
          description: "O novo usuário foi criado com sucesso.",
        });
      }

      loadUsers();
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      
      const errorMessage = getUserErrorMessage(error);

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const toggleUserStatus = async (user: UserWithPermissions) => {
    try {
      await toggleUserStatusService(user);

      toast({
        title: user.is_active ? "Usuário desativado" : "Usuário ativado",
        description: `O usuário foi ${user.is_active ? 'desativado' : 'ativado'} com sucesso.`,
      });

      loadUsers();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar status do usuário.",
        variant: "destructive",
      });
    }
  };

  return {
    users,
    handleSubmit,
    toggleUserStatus,
    fetchUsers: loadUsers
  };
};
