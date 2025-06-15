
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
  // Só módulos válidos
  const availableModules = Array.isArray(MODULES) ? MODULES : [];

  // Debug: mostrar quando componente renderiza
  console.log('[UserPermissions] Render', { permissions: formData.permissions, availableModules });

  const handlePermissionChange = (module: string, checked: boolean) => {
    // Debug: entrada na função
    console.log('[UserPermissions] Antes do change', { module, checked, currentPermissions: formData.permissions });
    if (!availableModules.includes(module as any)) return;

    const updatedPermissions = checked
      ? Array.from(new Set([...formData.permissions, module]))
      : formData.permissions.filter(p => p !== module);

    // Debug: saída da função
    console.log('[UserPermissions] Depois do change', { updatedPermissions });

    onFormDataChange({
      ...formData,
      permissions: updatedPermissions
    });
  };

  const isPermissionChecked = (module: string): boolean => {
    const permissions = Array.isArray(formData.permissions) ? formData.permissions : [];
    const isChecked = permissions.includes(module);
    // Debug: checagem
    console.log(`[UserPermissions] isPermissionChecked(${module}): ${isChecked}`, permissions);
    return isChecked;
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
      {/* Debug das permissões marcadas */}
      <div className="text-xs text-blue-400 mt-2 break-all">
        <strong>Debug atual:</strong> {JSON.stringify(formData.permissions)}
      </div>
    </div>
  );
};
