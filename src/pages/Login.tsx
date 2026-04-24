import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
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

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const {
    isNewPasswordMode,
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
          title: "Acesso Negado",
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
          title: "Bem-vindo de volta!",
          description: profile?.full_name ? `Olá, ${profile.full_name}. Login realizado com sucesso.` : 'Login realizado com sucesso.',
        });
        
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Ops!",
        description: `Ocorreu um erro inesperado: ${error.message}`,
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
    if (isNewPasswordMode) return "Criar nova senha";
    if (isResetMode) return "Esqueci minha senha";
    return "Acessar Sistema";
  };

  const getCardDescription = () => {
    if (isNewPasswordMode) return "Digite e confirme a sua nova senha de acesso.";
    if (isResetMode) return "Enviaremos um link seguro para o seu e-mail.";
    return "Gerencie suas vendas, estoque e equipe.";
  };

  return (
    <div className="min-h-screen flex font-inter bg-slate-50 dark:bg-slate-950">
      {/* Lado Esquerdo - Banner com Imagem */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        {/* Imagem de Fundo Premium - Unsplash Fashion/Shoes */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop)' }}
        />
        
        {/* Overlay Gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 h-full text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight shadow-sm">SGA Calçados</span>
          </div>

          <div className="space-y-6 max-w-lg mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="text-5xl font-bold tracking-tight leading-tight drop-shadow-md">
              Gestão inteligente para sua loja.
            </h1>
            <p className="text-lg text-slate-300 font-light leading-relaxed drop-shadow">
              O Ponto de Venda projetado para otimizar suas vendas, controlar seu estoque em tempo real e entregar a melhor experiência ao seu caixa.
            </p>
            
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-200" />
                <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-400" />
                <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-600" />
                <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-white flex items-center justify-center text-xs font-bold text-slate-900">
                  +2k
                </div>
              </div>
              <p className="text-sm font-medium text-slate-300">Usuários aprovam</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lado Direito - Painel de Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Orbs de fundo (apenas visíveis em telas menores ou modo dark) */}
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-[420px] space-y-8 relative z-10 animate-in fade-in slide-in-from-right-8 duration-700 delay-100">
          
          <div className="lg:hidden flex flex-col items-center mb-8 space-y-3">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-sky-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">SGA Calçados</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Sistema de Gestão Avançado</p>
            </div>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {getCardTitle()}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {getCardDescription()}
            </p>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none p-6 sm:p-8 transition-all hover:shadow-2xl">
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
          </div>

          <p className="text-center text-xs text-slate-500 dark:text-slate-500 mt-8">
            © {new Date().getFullYear()} TMIDIA. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
