
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AdminPasswordUpdate = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateInput = (email: string, password: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Email inválido');
    }
    if (password.length < 8) {
      throw new Error('A senha deve ter pelo menos 8 caracteres');
    }
  };

  const sanitizeInput = (input: string) => {
    return input.trim().replace(/[<>]/g, '');
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const sanitizedEmail = sanitizeInput(email);
      const sanitizedPassword = sanitizeInput(newPassword);
      
      validateInput(sanitizedEmail, sanitizedPassword);

      // Use Supabase edge function for secure password updates
      const { data, error } = await supabase.functions.invoke('update-user-password', {
        body: { email: sanitizedEmail, newPassword: sanitizedPassword }
      });

      if (error) throw error;

      toast({
        title: "Senha atualizada com sucesso!",
        description: `A senha do usuário ${sanitizedEmail} foi alterada.`,
      });
      
      setEmail('');
      setNewPassword('');
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar senha",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-primary" />
          <CardTitle>Atualização Administrativa</CardTitle>
        </div>
        <CardDescription>
          <div className="flex items-center space-x-2 text-amber-600">
            <AlertTriangle className="w-4 h-4" />
            <span>Alteração de senha para usuário específico</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email do Usuário</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="usuario@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova Senha</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
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
      </CardContent>
    </Card>
  );
};

export default AdminPasswordUpdate;
