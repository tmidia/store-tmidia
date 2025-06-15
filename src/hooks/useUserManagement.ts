
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { UserWithPermissions, UserFormData } from '@/types/user';
import { fetchUsers, createUser, updateUser, toggleUserStatus as toggleUserStatusService } from '@/services/userService';
import { getUserErrorMessage } from '@/utils/userErrorMessages';

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserWithPermissions[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (editingUser: UserWithPermissions | null, formData: UserFormData) => {
    try {
      console.log('useUserManagement: Iniciando handleSubmit...');
      
      if (editingUser) {
        console.log('useUserManagement: Atualizando usuário existente...');
        await updateUser(editingUser, formData);
        toast({
          title: "Usuário atualizado",
          description: "As informações do usuário foram atualizadas com sucesso.",
        });
      } else {
        console.log('useUserManagement: Criando novo usuário...');
        await createUser(formData);
        toast({
          title: "Usuário criado",
          description: "O novo usuário foi criado com sucesso.",
        });
      }

      console.log('useUserManagement: Recarregando lista de usuários...');
      await loadUsers();
      console.log('useUserManagement: handleSubmit concluído com sucesso');
    } catch (error: any) {
      console.error('useUserManagement: Erro ao salvar usuário:', error);
      
      const errorMessage = getUserErrorMessage(error);

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error; // Re-throw para que o componente possa lidar com o erro
    }
  };

  const toggleUserStatus = async (user: UserWithPermissions) => {
    try {
      await toggleUserStatusService(user);

      toast({
        title: user.is_active ? "Usuário desativado" : "Usuário ativado",
        description: `O usuário foi ${user.is_active ? 'desativado' : 'ativado'} com sucesso.`,
      });

      await loadUsers();
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar status do usuário.",
        variant: "destructive",
      });
    }
  };

  return {
    users,
    isLoading,
    handleSubmit,
    toggleUserStatus,
    fetchUsers: loadUsers
  };
};
