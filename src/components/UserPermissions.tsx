
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { MODULES } from '@/constants/modules';
import type { UserFormData } from '@/types/user';

interface UserPermissionsProps {
  formData: UserFormData;
  onFormDataChange: (formData: UserFormData) => void;
}

export const UserPermissions = ({
  formData,
  onFormDataChange
}: UserPermissionsProps) => {
  const handlePermissionChange = (module: string, checked: boolean) => {
    console.log('Alterando permissão:', module, 'para:', checked);
    console.log('Permissões atuais:', formData.permissions);
    
    const updatedPermissions = checked 
      ? [...formData.permissions, module]
      : formData.permissions.filter(p => p !== module);
    
    console.log('Novas permissões:', updatedPermissions);
    
    onFormDataChange({
      ...formData,
      permissions: updatedPermissions
    });
  };

  const isPermissionChecked = (module: string): boolean => {
    const isChecked = formData.permissions.includes(module);
    console.log(`Verificando permissão ${module}:`, isChecked, 'em:', formData.permissions);
    return isChecked;
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Permissões de Módulos</Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {MODULES.map(module => {
          const checked = isPermissionChecked(module);
          return (
            <div key={module} className="flex items-center space-x-2 p-2 border rounded">
              <Checkbox
                id={module}
                checked={checked}
                onCheckedChange={(checked) => handlePermissionChange(module, checked as boolean)}
              />
              <Label htmlFor={module} className="capitalize text-sm cursor-pointer flex-1">
                {module}
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  );
};
