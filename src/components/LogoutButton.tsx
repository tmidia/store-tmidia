
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const LogoutButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut();

      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });

      navigate('/login');
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao fazer logout.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Logout</DialogTitle>
          <DialogDescription>
            Deseja realmente sair do sistema? Você precisará fazer login novamente para acessar.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleLogout} disabled={isLoading}>
            {isLoading ? 'Saindo...' : 'Confirmar Saída'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutButton;
