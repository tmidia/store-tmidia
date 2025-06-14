
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UserFormData } from '@/types/user';
import type { Database } from '@/integrations/supabase/types';

interface UserTypeSelectProps {
  formData: UserFormData;
  onFormDataChange: (formData: UserFormData) => void;
}

export const UserTypeSelect = ({
  formData,
  onFormDataChange
}: UserTypeSelectProps) => {
  return (
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
  );
};
