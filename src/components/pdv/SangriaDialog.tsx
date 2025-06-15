
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface SangriaDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (amount: number, reason: string) => Promise<void>;
}

export const SangriaDialog = ({ isOpen, onOpenChange, onSubmit }: SangriaDialogProps) => {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = async () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({ title: 'Valor inválido', description: 'Por favor, insira um valor positivo.', variant: 'destructive' });
      return;
    }
    if (!reason.trim()) {
      toast({ title: 'Motivo obrigatório', description: 'Por favor, insira o motivo da sangria.', variant: 'destructive' });
      return;
    }

    await onSubmit(numericAmount, reason);
    setAmount('');
    setReason('');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setAmount('');
    setReason('');
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Realizar Sangria</DialogTitle>
          <DialogDescription>
            Insira o valor a ser retirado do caixa e o motivo. Esta ação será registrada.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="sangria-amount">Valor da Sangria (R$)</Label>
            <Input
              id="sangria-amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sangria-reason">Motivo</Label>
            <Textarea
              id="sangria-reason"
              placeholder="Ex: Pagamento de fornecedor, adiantamento"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
          <Button onClick={handleSubmit}>Confirmar Sangria</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
