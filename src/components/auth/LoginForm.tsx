
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

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
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-medium text-foreground/80">
          E-mail
        </Label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="h-12 pl-10 bg-background/60 border-border/50 rounded-xl text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary/20 focus:ring-2 transition-all duration-200"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm font-medium text-foreground/80">
          Senha
        </Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="h-12 pl-10 pr-12 bg-background/60 border-border/50 rounded-xl text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary/20 focus:ring-2 transition-all duration-200"
            required
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-muted-foreground/50 hover:text-foreground/70 hover:bg-accent/50 transition-colors duration-150"
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

      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2 cursor-pointer select-none group">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-border/60 text-primary focus:ring-primary/30 focus:ring-2 transition-colors cursor-pointer"
          />
          <span className="text-sm text-muted-foreground group-hover:text-foreground/70 transition-colors">
            Lembrar de mim
          </span>
        </label>
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-primary/80 hover:text-primary font-medium transition-colors duration-150"
        >
          Esqueceu a senha?
        </button>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          className="w-full h-12 bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground font-semibold rounded-xl transition-all duration-200 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:shadow-sm active:scale-[0.99]"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              <span>Entrando...</span>
            </div>
          ) : (
            "Entrar"
          )}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
