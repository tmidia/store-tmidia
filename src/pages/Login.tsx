
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
      console.log('🔐 Tentativa de login para:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        console.error('❌ Erro no login:', error);
        
        let errorMessage = "Erro no login";
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = "Email ou senha incorretos. Verifique suas credenciais.";
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = "Email não confirmado. Verifique sua caixa de entrada.";
        } else if (error.message.includes('Too many requests')) {
          errorMessage = "Muitas tentativas. Tente novamente em alguns minutos.";
        } else if (error.message.includes('Database error')) {
          errorMessage = "Erro temporário do sistema. Tente novamente em alguns instantes.";
        }
        
        toast({
          title: "Erro no login",
          description: errorMessage,
          variant: "destructive",
        });
      } else if (data.user && data.session) {
        console.log('✅ Login realizado com sucesso:', data.user.email);
        
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao Sistema de Gestão.",
        });
        
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('💥 Erro inesperado no login:', error);
      toast({
        title: "Erro no login",
        description: "Erro inesperado. Tente novamente.",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo e Título */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">SGA</h1>
          <p className="text-gray-600 mt-2">Sistema de Gestão para Loja de Acessórios</p>
        </div>

        {/* Card de Login */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-semibold text-gray-900">
              {getCardTitle()}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {getCardDescription()}
            </CardDescription>
          </CardHeader>

          <CardContent>
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
        <div className="text-center text-sm text-gray-500">
          <p>© 2025 Sistema de Gestão para Lojas.</p>
          <p>Desenvolvido por TMIDIA para facilitar sua gestão diária.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
