import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UserFormData } from '@/types/user';
import { formatCPF } from '@/utils/inputValidation';

interface UserCPFFieldProps {
  formData: UserFormData;
  validationErrors: Record<string, string>;
  onInputChange: (field: keyof UserFormData, value: string) => void;
}

export const UserCPFField = ({
  formData,
  validationErrors,
  onInputChange
}: UserCPFFieldProps) => {
  const handleCPFChange = (value: string) => {
    // Remove formatting and keep only numbers
    const cleanValue = value.replace(/[^\d]/g, '');
    // Limit to 11 digits
    const limitedValue = cleanValue.slice(0, 11);
    onInputChange('cpf', limitedValue);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="cpf" className="text-sm font-medium">CPF</Label>
      <Input
        id="cpf"
        value={formatCPF(formData.cpf)}
        onChange={(e) => handleCPFChange(e.target.value)}
        className="w-full"
        placeholder="000.000.000-00"
        maxLength={14}
      />
      {validationErrors.cpf && (
        <p className="text-sm text-red-500">{validationErrors.cpf}</p>
      )}
    </div>
  );
};
