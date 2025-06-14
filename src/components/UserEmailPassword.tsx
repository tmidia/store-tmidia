
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UserFormData } from '@/types/user';

interface UserEmailPasswordProps {
  formData: UserFormData;
  validationErrors: Record<string, string>;
  onInputChange: (field: keyof UserFormData, value: string) => void;
  isEditMode?: boolean;
}

export const UserEmailPassword = ({
  formData,
  validationErrors,
  onInputChange,
  isEditMode = false
}: UserEmailPasswordProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">E-mail</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onInputChange('email', e.target.value)}
          required={!isEditMode}
          disabled={isEditMode}
          className="w-full"
          placeholder={isEditMode ? formData.email : "Ex: joao@empresa.com"}
        />
        {validationErrors.email && (
          <p className="text-sm text-red-500">{validationErrors.email}</p>
        )}
        {isEditMode && (
          <p className="text-xs text-gray-500">
            O email não pode ser alterado após o cadastro
          </p>
        )}
      </div>
      {!isEditMode && (
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => onInputChange('password', e.target.value)}
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
      )}
    </div>
  );
};
