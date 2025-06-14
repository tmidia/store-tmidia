
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface UserPasswordChangeProps {
  validationErrors: Record<string, string>;
  newPassword: string;
  confirmPassword: string;
  onNewPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (password: string) => void;
}

export const UserPasswordChange = ({
  validationErrors,
  newPassword,
  confirmPassword,
  onNewPasswordChange,
  onConfirmPasswordChange
}: UserPasswordChangeProps) => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Alterar Senha</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowChangePassword(!showChangePassword)}
        >
          {showChangePassword ? 'Cancelar' : 'Alterar Senha'}
        </Button>
      </div>
      
      {showChangePassword && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm font-medium">Nova Senha</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => onNewPasswordChange(e.target.value)}
                className="w-full pr-10"
                placeholder="Nova senha"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {validationErrors.newPassword && (
              <p className="text-sm text-red-500">{validationErrors.newPassword}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar Nova Senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => onConfirmPasswordChange(e.target.value)}
                className="w-full pr-10"
                placeholder="Confirmar nova senha"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <p className="text-sm text-red-500">{validationErrors.confirmPassword}</p>
            )}
          </div>
          <div className="col-span-full">
            <p className="text-xs text-gray-500">
              Deve conter ao menos 8 caracteres, uma maiúscula, uma minúscula e um número
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
