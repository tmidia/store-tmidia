
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';

interface LoginFormProps {
  email: string;
  password: string;
  showPassword: boolean;
  isLoading: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
}

const LoginForm = ({
  email,
  password,
  showPassword,
  isLoading,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  onForgotPassword
}: LoginFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-[13px] font-medium text-foreground/70 tracking-wide uppercase">
          E-mail
        </Label>
        <div className="relative group">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground/40 group-focus-within:text-[hsl(var(--primary))] transition-colors duration-200 pointer-events-none" />
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="h-12 pl-11 bg-[hsl(var(--muted)/0.4)] border-[hsl(var(--border)/0.6)] rounded-xl text-sm placeholder:text-muted-foreground/40 focus:bg-background focus:border-[hsl(var(--primary)/0.5)] focus:ring-[3px] focus:ring-[hsl(var(--primary)/0.1)] transition-all duration-200"
            required
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-[13px] font-medium text-foreground/70 tracking-wide uppercase">
          Senha
        </Label>
        <div className="relative group">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground/40 group-focus-within:text-[hsl(var(--primary))] transition-colors duration-200 pointer-events-none" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="h-12 pl-11 pr-12 bg-[hsl(var(--muted)/0.4)] border-[hsl(var(--border)/0.6)] rounded-xl text-sm placeholder:text-muted-foreground/40 focus:bg-background focus:border-[hsl(var(--primary)/0.5)] focus:ring-[3px] focus:ring-[hsl(var(--primary)/0.1)] transition-all duration-200"
            required
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground/40 hover:text-foreground/60 hover:bg-[hsl(var(--muted))] active:scale-95 transition-all duration-150"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Remember me + Forgot password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2.5 cursor-pointer select-none group">
          <input
            type="checkbox"
            className="w-4 h-4 rounded-[5px] border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary)/0.3)] focus:ring-2 focus:ring-offset-0 transition-colors cursor-pointer accent-[hsl(var(--primary))]"
          />
          <span className="text-[13px] text-muted-foreground group-hover:text-foreground/70 transition-colors">
            Lembrar de mim
          </span>
        </label>
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-[13px] text-[hsl(var(--primary)/0.75)] hover:text-[hsl(var(--primary))] font-medium transition-colors duration-150"
        >
          Esqueceu a senha?
        </button>
      </div>

      {/* Submit */}
      <div className="pt-1">
        <Button
          type="submit"
          className="w-full h-12 bg-[hsl(var(--primary))] hover:bg-[hsl(210,100%,50%)] active:bg-[hsl(210,100%,44%)] text-[hsl(var(--primary-foreground))] font-semibold rounded-xl transition-all duration-200 shadow-[0_4px_14px_-2px_hsl(var(--primary)/0.4)] hover:shadow-[0_6px_20px_-2px_hsl(var(--primary)/0.5)] active:shadow-[0_2px_8px_-2px_hsl(var(--primary)/0.3)] active:scale-[0.98] text-[15px] tracking-wide"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 border-2 border-[hsl(var(--primary-foreground)/0.3)] border-t-[hsl(var(--primary-foreground))] rounded-full animate-spin" />
              <span>Entrando...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>Entrar</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
