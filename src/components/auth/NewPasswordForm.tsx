
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

interface NewPasswordFormProps {
  newPassword: string;
  confirmPassword: string;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  isLoading: boolean;
  onNewPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (password: string) => void;
  onToggleNewPassword: () => void;
  onToggleConfirmPassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const NewPasswordForm = ({
  newPassword,
  confirmPassword,
  showNewPassword,
  showConfirmPassword,
  isLoading,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onToggleNewPassword,
  onToggleConfirmPassword,
  onSubmit
}: NewPasswordFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="new-password" className="text-sm font-medium text-gray-700">
          Nova Senha
        </Label>
        <div className="relative">
          <Input
            id="new-password"
            type={showNewPassword ? "text" : "password"}
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => onNewPasswordChange(e.target.value)}
            className="h-12 border-gray-200 focus:border-primary focus:ring-primary pr-12"
            required
          />
          <button
            type="button"
            onClick={onToggleNewPassword}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
          >
            {showNewPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
          Confirmar Nova Senha
        </Label>
        <div className="relative">
          <Input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            className="h-12 border-gray-200 focus:border-primary focus:ring-primary pr-12"
            required
          />
          <button
            type="button"
            onClick={onToggleConfirmPassword}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-12 bg-primary hover:bg-blue-dark text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Atualizando...</span>
          </div>
        ) : (
          "Atualizar Senha"
        )}
      </Button>
    </form>
  );
};

export default NewPasswordForm;
