
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useUserManagement } from '@/hooks/useUserManagement';
import { UserFormDialog } from '@/components/UserFormDialog';
import { UserTable } from '@/components/UserTable';
import type { UserWithPermissions } from '@/types/user';

const UserManagement = () => {
  const [editingUser, setEditingUser] = useState<UserWithPermissions | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    users,
    remainingTime,
    isWithinRateLimit,
    handleSubmit,
    toggleUserStatus
  } = useUserManagement();

  const handleFormSubmit = async (editingUser: UserWithPermissions | null, formData: any) => {
    setIsSubmitting(true);
    try {
      await handleSubmit(editingUser, formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user: UserWithPermissions) => {
    setEditingUser(user);
  };

  const canCreateUser = isWithinRateLimit();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-primary" />
            <CardTitle>Gestão de Usuários</CardTitle>
          </div>
          <UserFormDialog
            editingUser={editingUser}
            isSubmitting={isSubmitting}
            canCreateUser={canCreateUser}
            remainingTime={remainingTime}
            onSubmit={handleFormSubmit}
            onEditingUserChange={setEditingUser}
          />
        </div>
        <CardDescription>
          Gerencie usuários do sistema (acesso restrito ao Superadmin)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UserTable
          users={users}
          onEdit={handleEdit}
          onToggleStatus={toggleUserStatus}
        />
      </CardContent>
    </Card>
  );
};

export default UserManagement;
