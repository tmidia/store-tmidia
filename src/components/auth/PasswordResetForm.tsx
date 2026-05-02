import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, Send } from 'lucide-react';

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
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="reset-email" className="text-[13px] font-medium text-foreground/70 tracking-wide uppercase">
          E-mail
        </Label>
        <div className="relative group">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground/40 group-focus-within:text-[hsl(var(--primary))] transition-colors duration-200 pointer-events-none" />
          <Input
            id="reset-email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="h-12 pl-11 bg-[hsl(var(--muted)/0.4)] border-[hsl(var(--border)/0.6)] rounded-xl text-sm placeholder:text-muted-foreground/40 focus:bg-background focus:border-[hsl(var(--primary)/0.5)] focus:ring-[3px] focus:ring-[hsl(var(--primary)/0.1)] transition-all duration-200"
            required
          />
        </div>
      </div>

      <div className="pt-2 space-y-3">
        <Button
          type="submit"
          className="w-full h-12 bg-[hsl(var(--primary))] hover:bg-[hsl(210,100%,50%)] active:bg-[hsl(210,100%,44%)] text-[hsl(var(--primary-foreground))] font-semibold rounded-xl transition-all duration-200 shadow-[0_4px_14px_-2px_hsl(var(--primary)/0.4)] hover:shadow-[0_6px_20px_-2px_hsl(var(--primary)/0.5)] active:shadow-[0_2px_8px_-2px_hsl(var(--primary)/0.3)] active:scale-[0.98] text-[15px] tracking-wide"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 border-2 border-[hsl(var(--primary-foreground)/0.3)] border-t-[hsl(var(--primary-foreground))] rounded-full animate-spin" />
              <span>Enviando...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              <span>Enviar Link de Recuperação</span>
            </div>
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full h-12 rounded-xl text-[14px] text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--muted)/0.5)] transition-all duration-200"
          onClick={onBackToLogin}
        >
          <div className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para o Login</span>
          </div>
        </Button>
      </div>
    </form>
  );
};

export default PasswordResetForm;
