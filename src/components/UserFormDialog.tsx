
import React, { useState } from 'react';
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
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    full_name: '',
    email: '',
    password: '',
    cpf: '',
    user_type: 'vendedor' as Database['public']['Enums']['user_type'],
    permissions: []
  });

  const resetForm = () => {
    console.log('Resetando formulário...');
    setFormData({
      username: '',
      full_name: '',
      email: '',
      password: '',
      cpf: '',
      user_type: 'vendedor',
      permissions: []
    });
    onEditingUserChange(null);
    setIsLocalSubmitting(false);
  };

  const handleDialogOpenChange = (open: boolean) => {
    console.log('Dialog mudou para:', open);
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  // Atualizar os dados do formulário quando editingUser mudar
  React.useEffect(() => {
    if (editingUser) {
      console.log('Carregando dados do usuário para edição:', editingUser);
      console.log('Permissões do usuário recebidas:', editingUser.permissions);
      
      // Garantir que as permissões sejam sempre um array válido
      const userPermissions = Array.isArray(editingUser.permissions) ? editingUser.permissions : [];
      console.log('Permissões processadas para o formulário:', userPermissions);
      
      const newFormData = {
        username: editingUser.username || '',
        full_name: editingUser.full_name || '',
        email: editingUser.email || '',
        password: '',
        cpf: editingUser.cpf || '',
        user_type: editingUser.user_type || 'vendedor',
        permissions: userPermissions
      };
      
      console.log('Dados completos sendo carregados no formulário:', newFormData);
      setFormData(newFormData);
      setIsDialogOpen(true);
    }
  }, [editingUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocalSubmitting || isSubmitting) {
      console.log('Submissão já em progresso, ignorando...');
      return;
    }

    try {
      setIsLocalSubmitting(true);
      console.log('Submetendo formulário com dados:', formData);
      
      await onSubmit(editingUser, formData);
      
      // Fechar dialog e resetar apenas após sucesso
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Erro no formulário:', error);
      const { toast } = await import('sonner');
      toast.error(error?.message || 'Erro ao salvar usuário. Tente novamente.');
      // Em caso de erro, manter o dialog aberto mas permitir nova tentativa
      setIsLocalSubmitting(false);
    }
  };

  const isCurrentlySubmitting = isSubmitting || isLocalSubmitting;

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
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
          isSubmitting={isCurrentlySubmitting}
          canCreateUser={canCreateUser}
        />

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setIsDialogOpen(false)} 
            className="w-full sm:w-auto"
            disabled={isCurrentlySubmitting}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isCurrentlySubmitting || (!editingUser && !canCreateUser)}
            className="w-full sm:w-auto"
            onClick={handleSubmit}
          >
            {isCurrentlySubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processando...</span>
              </div>
            ) : (
              editingUser ? 'Atualizar' : 'Criar'
            )} Usuário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
