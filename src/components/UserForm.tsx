
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { UserWithPermissions, UserFormData } from '@/types/user';
import type { Database } from '@/integrations/supabase/types';
import { MODULES } from '@/constants/modules';

interface UserFormProps {
  editingUser: UserWithPermissions | null;
  formData: UserFormData;
  onFormDataChange: (formData: UserFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  canCreateUser: boolean;
}

export const UserForm = ({
  editingUser,
  formData,
  onFormDataChange,
  onSubmit,
  isSubmitting,
  canCreateUser
}: UserFormProps) => {
  const handlePermissionChange = (module: string, checked: boolean) => {
    onFormDataChange({
      ...formData,
      permissions: checked 
        ? [...formData.permissions, module]
        : formData.permissions.filter(p => p !== module)
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium">Nome de Usuário</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => onFormDataChange({ ...formData, username: e.target.value })}
            required
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-sm font-medium">Nome Completo</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => onFormDataChange({ ...formData, full_name: e.target.value })}
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
              onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
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
              onChange={(e) => onFormDataChange({ ...formData, password: e.target.value })}
              required
              className="w-full"
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="user_type" className="text-sm font-medium">Tipo de Usuário</Label>
        <Select 
          value={formData.user_type} 
          onValueChange={(value: Database['public']['Enums']['user_type']) => 
            onFormDataChange({ ...formData, user_type: value })
          }
        >
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
    </form>
  );
};
