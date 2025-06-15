
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  stock_quantity: number;
}

interface StockMovementDialogProps {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (movementType: 'entrada' | 'saida', quantity: string, reason: string) => void;
}

export const StockMovementDialog = ({ product, isOpen, onOpenChange, onConfirm }: StockMovementDialogProps) => {
  const [movementType, setMovementType] = useState<'entrada' | 'saida'>('entrada');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setMovementType('entrada');
      setQuantity('');
      setReason('');
    }
  }, [isOpen]);

  if (!product) return null;

  const handleConfirm = () => {
    onConfirm(movementType, quantity, reason);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Movimentação de Estoque</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="font-semibold">{product.name}</p>
            <p className="text-sm text-gray-600">Estoque atual: {product.stock_quantity} unidades</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={movementType === 'entrada' ? 'default' : 'outline'}
              onClick={() => setMovementType('entrada')}
              className="w-full"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Entrada
            </Button>
            <Button
              variant={movementType === 'saida' ? 'default' : 'outline'}
              onClick={() => setMovementType('saida')}
              className="w-full"
            >
              <TrendingDown className="mr-2 h-4 w-4" />
              Saída
            </Button>
          </div>
          
          <div>
            <Label htmlFor="quantity-dialog">Quantidade</Label>
            <Input
              id="quantity-dialog"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Digite a quantidade"
              min="1"
            />
          </div>
          
          <div>
            <Label htmlFor="reason-dialog">Motivo</Label>
            <Input
              id="reason-dialog"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Venda, Compra, Ajuste, etc."
            />
          </div>
          
          <div className="flex space-x-2">
            <Button onClick={handleConfirm} className="flex-1">
              Confirmar Movimentação
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
