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
  // Garante que só módulos válidos serão exibidos e manipulados
  const availableModules = Array.isArray(MODULES) ? MODULES : [];

  const handlePermissionChange = (module: string, checked: boolean) => {
    // Não salva permissão inválida jamais
    if (!availableModules.includes(module as any)) return;

    const updatedPermissions = checked 
      ? Array.from(new Set([...formData.permissions, module]))
      : formData.permissions.filter(p => p !== module);

    onFormDataChange({
      ...formData,
      permissions: updatedPermissions
    });
  };

  const isPermissionChecked = (module: string): boolean => {
    const permissions = Array.isArray(formData.permissions) ? formData.permissions : [];
    return permissions.includes(module);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Permissões de Módulos</Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {availableModules.map(module => {
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
      <div className="text-xs text-gray-500 mt-2">
        Permissões selecionadas: {formData.permissions.length}
      </div>
    </div>
  );
};
