
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AdminPasswordUpdate = () => {
  const [email, setEmail] = useState('tmidia@sga.com');
  const [newPassword, setNewPassword] = useState('Tmidia_202S');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/update-user-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, newPassword }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Senha atualizada com sucesso!",
          description: `A senha do usuário ${email} foi alterada.`,
        });
        setEmail('');
        setNewPassword('');
      } else {
        toast({
          title: "Erro ao atualizar senha",
          description: result.error || "Erro desconhecido",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Executar automaticamente quando o componente carrega
  useState(() => {
    handleUpdatePassword(new Event('submit') as any);
  });

  return (
    <Card className="max-w-md">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-primary" />
          <CardTitle>Atualização Administrativa</CardTitle>
        </div>
        <CardDescription>
          Alteração de senha para usuário específico
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
              readOnly
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
              readOnly
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
