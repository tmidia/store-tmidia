
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UserFormData } from '@/types/user';
import { UserCPFField } from '@/components/UserCPFField';

interface UserBasicInfoProps {
  formData: UserFormData;
  validationErrors: Record<string, string>;
  onInputChange: (field: keyof UserFormData, value: string) => void;
}

export const UserBasicInfo = ({
  formData,
  validationErrors,
  onInputChange
}: UserBasicInfoProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium">Nome de Usuário</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => onInputChange('username', e.target.value)}
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
            onChange={(e) => onInputChange('full_name', e.target.value)}
            required
            className="w-full"
            placeholder="Ex: João Silva"
          />
          {validationErrors.full_name && (
            <p className="text-sm text-red-500">{validationErrors.full_name}</p>
          )}
        </div>
      </div>
      
      <UserCPFField
        formData={formData}
        validationErrors={validationErrors}
        onInputChange={onInputChange}
      />
    </div>
  );
};
