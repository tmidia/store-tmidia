
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PasswordResetFormProps {
  email: string;
  isLoading: boolean;
  onEmailChange: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBackToLogin: () => void;
}

const PasswordResetForm = ({
  email,
  isLoading,
  onEmailChange,
  onSubmit,
  onBackToLogin
}: PasswordResetFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="reset-email" className="text-sm font-medium text-gray-700">
          E-mail
        </Label>
        <Input
          id="reset-email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className="h-12 border-gray-200 focus:border-primary focus:ring-primary"
          required
        />
      </div>

      <div className="space-y-4">
        <Button
          type="submit"
          className="w-full h-12 bg-primary hover:bg-blue-dark text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Enviando...</span>
            </div>
          ) : (
            "Enviar Email de Recuperação"
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={onBackToLogin}
        >
          Voltar para o Login
        </Button>
      </div>
    </form>
  );
};

export default PasswordResetForm;
