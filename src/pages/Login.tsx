import { useState } from 'react';
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
import { useEffect } from 'react';

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
    <div className="min-h-screen bg-gradient-to-br from-accent via-background to-accent/50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/[0.08] rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-accent/30 rounded-full blur-2xl" />
      </div>

      <div className="w-full max-w-[460px] space-y-6 relative z-10 px-0 sm:px-0">
        {/* Logo e Título */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25 rotate-3 hover:rotate-0 transition-transform duration-300">
            <Package className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">SGA</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sistema de Gestão para Loja de Calçados e Acessórios
            </p>
          </div>
        </div>

        {/* Card de Login */}
        <Card className="shadow-xl shadow-black/5 border border-border/40 bg-card/70 backdrop-blur-xl rounded-2xl">
          <CardHeader className="text-center pb-2 pt-7 px-6 sm:px-8">
            <CardTitle className="text-xl font-semibold text-foreground">
              {getCardTitle()}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              {getCardDescription()}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 sm:px-8 pb-7 pt-4">
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
        <div className="text-center space-y-0.5 pb-4">
          <p className="text-xs text-muted-foreground/60">
            © 2025 Sistema de Gestão para Lojas.
          </p>
          <p className="text-xs text-muted-foreground/50">
            Desenvolvido por TMIDIA para facilitar sua gestão diária.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
