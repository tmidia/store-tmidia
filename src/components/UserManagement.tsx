
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

  return (
    <div className="w-full max-w-full overflow-hidden">
      <Card className="w-full">
        <CardHeader className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg sm:text-xl">Gestão de Usuários</CardTitle>
            </div>
            <UserFormDialog
              editingUser={editingUser}
              isSubmitting={isSubmitting}
              canCreateUser={true}
              remainingTime={0}
              onSubmit={handleFormSubmit}
              onEditingUserChange={setEditingUser}
            />
          </div>
          <CardDescription className="text-sm">
            Gerencie usuários do sistema (acesso restrito ao Superadmin)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="w-full overflow-hidden">
            <UserTable
              users={users}
              onEdit={handleEdit}
              onToggleStatus={toggleUserStatus}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
