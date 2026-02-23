import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import LoginForm from '@/components/auth/LoginForm';
import PasswordResetForm from '@/components/auth/PasswordResetForm';
import NewPasswordForm from '@/components/auth/NewPasswordForm';
import { usePasswordReset } from '@/hooks/usePasswordReset';
import { useAuth } from '@/hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const navigate = useNavigate();
  
  const { user } = useAuth();

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const {
    isNewPasswordMode,
    setIsNewPasswordMode,
    handlePasswordReset,
    handleNewPasswordSubmit
  } = usePasswordReset();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        let errorMessage = "Erro no login";
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = "Email ou senha incorretos. Verifique suas credenciais.";
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = "Email não confirmado. Verifique sua caixa de entrada.";
        } else if (error.message.includes('Too many requests')) {
          errorMessage = "Muitas tentativas. Tente novamente em alguns minutos.";
        } else {
          errorMessage = error.message;
        }
        
        toast({
          title: "Erro no login",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }
      
      if (data.user && data.session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', data.user.id)
          .single();
        
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${profile?.full_name || data.user.email}!`,
        });
        
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: `Erro inesperado: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetLoading(true);

    const success = await handlePasswordReset(email);
    if (success) {
      setIsResetMode(false);
    }

    setIsResetLoading(false);
  };

  const handleNewPasswordFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await handleNewPasswordSubmit(newPassword, confirmPassword);
    if (success) {
      setNewPassword('');
      setConfirmPassword('');
    }

    setIsLoading(false);
  };

  const getCardTitle = () => {
    if (isNewPasswordMode) return "Nova Senha";
    if (isResetMode) return "Recuperar Senha";
    return "Entrar no Sistema";
  };

  const getCardDescription = () => {
    if (isNewPasswordMode) return "Digite sua nova senha";
    if (isResetMode) return "Digite seu email para receber as instruções de recuperação";
    return "Digite suas credenciais para acessar o painel";
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-[hsl(210,60%,97%)] via-background to-[hsl(210,40%,94%)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-[hsl(var(--primary)/0.06)] rounded-full blur-[80px]" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-[hsl(var(--primary)/0.04)] rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[hsl(210,60%,95%/0.5)] rounded-full blur-[120px]" />
        {/* Subtle grid texture */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      </div>

      <div className="w-full max-w-[440px] space-y-8 relative z-10 px-1 sm:px-0">
        {/* Logo & Branding */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(210,100%,42%)] rounded-2xl flex items-center justify-center shadow-[0_8px_30px_-4px_hsl(var(--primary)/0.35)] transform hover:scale-105 transition-all duration-300 ease-out">
            <Package className="w-8 h-8 text-[hsl(var(--primary-foreground))]" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              SGA
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
              Sistema de Gestão para Loja de Calçados e Acessórios
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-[0_4px_40px_-8px_hsl(var(--foreground)/0.08)] border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card)/0.85)] backdrop-blur-2xl rounded-2xl overflow-hidden">
          <CardHeader className="text-center pb-1 pt-8 px-6 sm:px-8">
            <CardTitle className="text-xl font-semibold text-foreground tracking-tight">
              {getCardTitle()}
            </CardTitle>
            <CardDescription className="text-[13px] text-muted-foreground mt-1.5">
              {getCardDescription()}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 sm:px-8 pb-8 pt-5">
            {isNewPasswordMode ? (
              <NewPasswordForm
                newPassword={newPassword}
                confirmPassword={confirmPassword}
                showNewPassword={showNewPassword}
                showConfirmPassword={showConfirmPassword}
                isLoading={isLoading}
                onNewPasswordChange={setNewPassword}
                onConfirmPasswordChange={setConfirmPassword}
                onToggleNewPassword={() => setShowNewPassword(!showNewPassword)}
                onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
                onSubmit={handleNewPasswordFormSubmit}
              />
            ) : isResetMode ? (
              <PasswordResetForm
                email={email}
                isLoading={isResetLoading}
                onEmailChange={setEmail}
                onSubmit={handlePasswordResetSubmit}
                onBackToLogin={() => setIsResetMode(false)}
              />
            ) : (
              <LoginForm
                email={email}
                password={password}
                showPassword={showPassword}
                isLoading={isLoading}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                onSubmit={handleSubmit}
                onForgotPassword={() => setIsResetMode(true)}
              />
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-1 pb-4">
          <p className="text-[11px] text-muted-foreground/50">
            © 2025 Sistema de Gestão para Lojas.
          </p>
          <p className="text-[11px] text-muted-foreground/40">
            Desenvolvido por TMIDIA para facilitar sua gestão diária.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
