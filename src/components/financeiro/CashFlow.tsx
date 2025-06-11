
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

export const CashFlow = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    description: '',
    notes: ''
  });

  const queryClient = useQueryClient();

  // Buscar transações financeiras
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['financial-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select(`
          *,
          profiles(full_name, username)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    }
  });

  // Criar nova transação
  const createTransaction = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('financial_transactions')
        .insert([{
          type: data.type,
          amount: parseFloat(data.amount),
          description: data.description,
          notes: data.notes || null,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-overview'] });
      setIsDialogOpen(false);
      setFormData({ type: '', amount: '', description: '', notes: '' });
      toast.success('Transação registrada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao registrar transação');
      console.error('Erro:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type || !formData.amount || !formData.description) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    createTransaction.mutate(formData);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTypeIcon = (type: string) => {
    if (['entrada', 'venda', 'recebimento'].includes(type)) {
      return <ArrowUpCircle className="w-4 h-4 text-green-600" />;
    }
    return <ArrowDownCircle className="w-4 h-4 text-red-600" />;
  };

  const getTypeColor = (type: string) => {
    if (['entrada', 'venda', 'recebimento'].includes(type)) {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-red-100 text-red-800';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'entrada': 'Entrada',
      'saida': 'Saída',
      'abertura_caixa': 'Abertura Caixa',
      'fechamento_caixa': 'Fechamento Caixa',
      'sangria': 'Sangria',
      'suprimento': 'Suprimento',
      'venda': 'Venda',
      'recebimento': 'Recebimento',
      'pagamento': 'Pagamento'
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Fluxo de Caixa</h3>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nova Transação Financeira</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                    <SelectItem value="suprimento">Suprimento</SelectItem>
                    <SelectItem value="sangria">Sangria</SelectItem>
                    <SelectItem value="recebimento">Recebimento</SelectItem>
                    <SelectItem value="pagamento">Pagamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Valor *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Input
                  id="description"
                  placeholder="Descrição da transação"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Observações adicionais (opcional)"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createTransaction.isPending}>
                  {createTransaction.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimas Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Carregando transações...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions?.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(transaction.type)}>
                        <div className="flex items-center gap-1">
                          {getTypeIcon(transaction.type)}
                          {getTypeLabel(transaction.type)}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      {transaction.profiles?.full_name || transaction.profiles?.username || 'Sistema'}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-medium ${
                        ['entrada', 'venda', 'recebimento'].includes(transaction.type) 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {['entrada', 'venda', 'recebimento'].includes(transaction.type) ? '+' : '-'}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {!transactions?.length && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      Nenhuma transação encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
