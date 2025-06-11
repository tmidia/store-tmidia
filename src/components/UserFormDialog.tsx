
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { UserPlus, Clock } from 'lucide-react';
import type { UserWithPermissions, UserFormData } from '@/types/user';
import type { Database } from '@/integrations/supabase/types';
import { MODULES } from '@/constants/modules';

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

  const handlePermissionChange = (module: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, module]
        : prev.permissions.filter(p => p !== module)
    }));
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          onClick={resetForm}
          disabled={!canCreateUser}
          className="relative w-full sm:w-auto"
        >
          {!canCreateUser ? (
            <>
              <Clock className="w-4 h-4 mr-2" />
              Aguarde {remainingTime}s
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Novo Usuário
            </>
          )}
        </Button>
      </DialogTrigger>
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">Nome de Usuário</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-sm font-medium">Nome Completo</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                required
                className="w-full"
              />
            </div>
          </div>

          {!editingUser && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  className="w-full"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="user_type" className="text-sm font-medium">Tipo de Usuário</Label>
            <Select value={formData.user_type} onValueChange={(value: Database['public']['Enums']['user_type']) => setFormData(prev => ({ ...prev, user_type: value }))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="superadmin">Superadmin</SelectItem>
                <SelectItem value="gerente">Gerente</SelectItem>
                <SelectItem value="vendedor">Vendedor</SelectItem>
                <SelectItem value="estoquista">Estoquista</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Permissões de Módulos</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {MODULES.map(module => (
                <div key={module} className="flex items-center space-x-2 p-2 border rounded">
                  <Checkbox
                    id={module}
                    checked={formData.permissions.includes(module)}
                    onCheckedChange={(checked) => handlePermissionChange(module, checked as boolean)}
                  />
                  <Label htmlFor={module} className="capitalize text-sm cursor-pointer flex-1">
                    {module}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || (!editingUser && !canCreateUser)}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                'Processando...'
              ) : (
                editingUser ? 'Atualizar' : 'Criar'
              )} Usuário
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
