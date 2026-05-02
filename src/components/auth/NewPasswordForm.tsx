import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';

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
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="new-password" className="text-[13px] font-medium text-foreground/70 tracking-wide uppercase">
          Nova Senha
        </Label>
        <div className="relative group">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground/40 group-focus-within:text-[hsl(var(--primary))] transition-colors duration-200 pointer-events-none" />
          <Input
            id="new-password"
            type={showNewPassword ? "text" : "password"}
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => onNewPasswordChange(e.target.value)}
            className="h-12 pl-11 pr-12 bg-[hsl(var(--muted)/0.4)] border-[hsl(var(--border)/0.6)] rounded-xl text-sm placeholder:text-muted-foreground/40 focus:bg-background focus:border-[hsl(var(--primary)/0.5)] focus:ring-[3px] focus:ring-[hsl(var(--primary)/0.1)] transition-all duration-200"
            required
          />
          <button
            type="button"
            onClick={onToggleNewPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground/40 hover:text-foreground/60 hover:bg-[hsl(var(--muted))] active:scale-95 transition-all duration-150"
          >
            {showNewPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password" className="text-[13px] font-medium text-foreground/70 tracking-wide uppercase">
          Confirmar Nova Senha
        </Label>
        <div className="relative group">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground/40 group-focus-within:text-[hsl(var(--primary))] transition-colors duration-200 pointer-events-none" />
          <Input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            className="h-12 pl-11 pr-12 bg-[hsl(var(--muted)/0.4)] border-[hsl(var(--border)/0.6)] rounded-xl text-sm placeholder:text-muted-foreground/40 focus:bg-background focus:border-[hsl(var(--primary)/0.5)] focus:ring-[3px] focus:ring-[hsl(var(--primary)/0.1)] transition-all duration-200"
            required
          />
          <button
            type="button"
            onClick={onToggleConfirmPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground/40 hover:text-foreground/60 hover:bg-[hsl(var(--muted))] active:scale-95 transition-all duration-150"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          className="w-full h-12 bg-[hsl(var(--primary))] hover:bg-[hsl(210,100%,50%)] active:bg-[hsl(210,100%,44%)] text-[hsl(var(--primary-foreground))] font-semibold rounded-xl transition-all duration-200 shadow-[0_4px_14px_-2px_hsl(var(--primary)/0.4)] hover:shadow-[0_6px_20px_-2px_hsl(var(--primary)/0.5)] active:shadow-[0_2px_8px_-2px_hsl(var(--primary)/0.3)] active:scale-[0.98] text-[15px] tracking-wide"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 border-2 border-[hsl(var(--primary-foreground)/0.3)] border-t-[hsl(var(--primary-foreground))] rounded-full animate-spin" />
              <span>Atualizando...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Atualizar Senha</span>
            </div>
          )}
        </Button>
      </div>
    </form>
  );
};

export default NewPasswordForm;
