
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { UserWithPermissions, UserFormData } from '@/types/user';
import type { Database } from '@/integrations/supabase/types';
import { MODULES } from '@/constants/modules';
import { validateEmail, validatePassword, validateUsername, validateName, sanitizeHtml } from '@/utils/inputValidation';

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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    const sanitizedValue = sanitizeHtml(value);
    onFormDataChange({ ...formData, [field]: sanitizedValue });
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!editingUser) {
      if (!validateEmail(formData.email)) {
        errors.email = 'Email inválido';
      }
      
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.message;
      }
    }

    const usernameValidation = validateUsername(formData.username);
    if (!usernameValidation.isValid) {
      errors.username = usernameValidation.message;
    }

    const nameValidation = validateName(formData.full_name);
    if (!nameValidation.isValid) {
      errors.full_name = nameValidation.message;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(e);
    }
  };

  const handlePermissionChange = (module: string, checked: boolean) => {
    onFormDataChange({
      ...formData,
      permissions: checked 
        ? [...formData.permissions, module]
        : formData.permissions.filter(p => p !== module)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium">Nome de Usuário</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            required
            className="w-full"
            placeholder="Ex: joao_silva"
          />
          {validationErrors.username && (
            <p className="text-sm text-red-500">{validationErrors.username}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-sm font-medium">Nome Completo</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => handleInputChange('full_name', e.target.value)}
            required
            className="w-full"
            placeholder="Ex: João Silva"
          />
          {validationErrors.full_name && (
            <p className="text-sm text-red-500">{validationErrors.full_name}</p>
          )}
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
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              className="w-full"
              placeholder="Ex: joao@empresa.com"
            />
            {validationErrors.email && (
              <p className="text-sm text-red-500">{validationErrors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              className="w-full"
              placeholder="Mínimo 8 caracteres"
              minLength={8}
            />
            {validationErrors.password && (
              <p className="text-sm text-red-500">{validationErrors.password}</p>
            )}
            <p className="text-xs text-gray-500">
              Deve conter ao menos 8 caracteres, uma maiúscula, uma minúscula e um número
            </p>
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
