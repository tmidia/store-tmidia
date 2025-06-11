
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import type { UserWithPermissions, UserFormData } from '@/types/user';
import type { Database } from '@/integrations/supabase/types';
import { UserForm } from '@/components/UserForm';
import { UserDialogTrigger } from '@/components/UserDialogTrigger';

interface UserFormDialogProps {
  editingUser: UserWithPermissions | null;
  isSubmitting: boolean;
  canCreateUser: boolean;
  remainingTime: number;
  onSubmit: (editingUser: UserWithPermissions | null, formData: UserFormData) => Promise<void>;
  onEditingUserChange: (user: UserWithPermissions | null) => void;
}

export const UserFormDialog = ({
  editingUser,
  isSubmitting,
  canCreateUser,
  remainingTime,
  onSubmit,
  onEditingUserChange
}: UserFormDialogProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    full_name: '',
    email: '',
    password: '',
    user_type: 'vendedor' as Database['public']['Enums']['user_type'],
    permissions: []
  });

  const resetForm = () => {
    setFormData({
      username: '',
      full_name: '',
      email: '',
      password: '',
      user_type: 'vendedor',
      permissions: []
    });
    onEditingUserChange(null);
  };

  const handleEdit = (user: UserWithPermissions) => {
    onEditingUserChange(user);
    setFormData({
      username: user.username,
      full_name: user.full_name || '',
      email: '',
      password: '',
      user_type: user.user_type || 'vendedor',
      permissions: user.permissions
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(editingUser, formData);
    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <UserDialogTrigger
        canCreateUser={canCreateUser}
        remainingTime={remainingTime}
        onResetForm={resetForm}
      />
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {editingUser ? 'Atualize as informações do usuário.' : 'Preencha os dados para criar um novo usuário.'}
            {!editingUser && !canCreateUser && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm">
                <Clock className="w-4 h-4 inline mr-1" />
                Aguarde {remainingTime} segundos para criar outro usuário
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <UserForm
          editingUser={editingUser}
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          canCreateUser={canCreateUser}
        />

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || (!editingUser && !canCreateUser)}
            className="w-full sm:w-auto"
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              'Processando...'
            ) : (
              editingUser ? 'Atualizar' : 'Criar'
            )} Usuário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
