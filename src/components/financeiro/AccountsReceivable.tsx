
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, Eye, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { formatCpfCnpj, formatPhone } from '@/utils/textUtils';

export const AccountsReceivable = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_document: '',
    customer_phone: '',
    amount: '',
    due_date: '',
    description: ''
  });
  const [paymentAmount, setPaymentAmount] = useState('');

  const queryClient = useQueryClient();

  // Buscar contas a receber
  const { data: accounts, isLoading } = useQuery({
    queryKey: ['accounts-receivable'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts_receivable')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  // Criar nova conta a receber
  const createAccount = useMutation({
    mutationFn: async (data: any) => {
      const amount = parseFloat(data.amount);
      const { error } = await supabase
        .from('accounts_receivable')
        .insert([{
          customer_name: data.customer_name,
          customer_document: data.customer_document || null,
          customer_phone: data.customer_phone || null,
          amount: amount,
          due_date: data.due_date,
          description: data.description || null
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-receivable'] });
      queryClient.invalidateQueries({ queryKey: ['financial-overview'] });
      setIsDialogOpen(false);
      setFormData({
        customer_name: '',
        customer_document: '',
        customer_phone: '',
        amount: '',
        due_date: '',
        description: ''
      });
      toast.success('Conta a receber criada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar conta a receber');
      console.error('Erro:', error);
    }
  });

  // Registrar pagamento
  const registerPayment = useMutation({
    mutationFn: async ({ accountId, amount }: { accountId: string, amount: number }) => {
      const account = accounts?.find(a => a.id === accountId);
      if (!account) throw new Error('Conta não encontrada');

      const newPaidAmount = (account.paid_amount || 0) + amount;
      const newRemainingAmount = account.amount - newPaidAmount;
      const newStatus = newRemainingAmount <= 0 ? 'pago' : 'pendente';

      const { error } = await supabase
        .from('accounts_receivable')
        .update({
          paid_amount: newPaidAmount,
          status: newStatus
        })
        .eq('id', accountId);

      if (error) throw error;

      // Registrar transação financeira
      await supabase
        .from('financial_transactions')
        .insert([{
          type: 'receita_avulsa',
          amount: amount,
          description: `Recebimento de ${account.customer_name}`,
          reference_id: accountId,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-receivable'] });
      queryClient.invalidateQueries({ queryKey: ['financial-overview'] });
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      setIsPaymentDialogOpen(false);
      setPaymentAmount('');
      setSelectedAccount(null);
      toast.success('Pagamento registrado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao registrar pagamento');
      console.error('Erro:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.amount || !formData.due_date) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    createAccount.mutate(formData);
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentAmount || !selectedAccount) return;

    const amount = parseFloat(paymentAmount);
    if (amount <= 0 || amount > selectedAccount.remaining_amount) {
      toast.error('Valor inválido');
      return;
    }

    registerPayment.mutate({ accountId: selectedAccount.id, amount });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-100 text-green-800';
      case 'vencido': return 'bg-red-100 text-red-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pendente': 'Pendente',
      'pago': 'Pago',
      'vencido': 'Vencido',
      'cancelado': 'Cancelado'
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Contas a Receber</h3>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nova Conta a Receber</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer_name">Nome do Cliente *</Label>
                <Input
                  id="customer_name"
                  placeholder="Nome do cliente"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_document">CPF/CNPJ</Label>
                <Input
                  id="customer_document"
                  placeholder="000.000.000-00"
                  value={formData.customer_document}
                  onChange={(e) => setFormData({...formData, customer_document: formatCpfCnpj(e.target.value)})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_phone">Telefone</Label>
                <Input
                  id="customer_phone"
                  placeholder="(00) 00000-0000"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({...formData, customer_phone: formatPhone(e.target.value)})}
                />
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
                <Label htmlFor="due_date">Data de Vencimento *</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  placeholder="Descrição da conta"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createAccount.isPending}>
                  {createAccount.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Contas a Receber</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Carregando contas...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead>Restante</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts?.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{account.customer_name}</div>
                        {account.customer_document && (
                          <div className="text-sm text-muted-foreground">{account.customer_document}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(account.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>{formatCurrency(account.amount)}</TableCell>
                    <TableCell>{formatCurrency(account.paid_amount || 0)}</TableCell>
                    <TableCell>{formatCurrency(account.remaining_amount)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(account.status)}>
                        {getStatusLabel(account.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        {account.status === 'pendente' && account.remaining_amount > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAccount(account);
                              setPaymentAmount(account.remaining_amount.toString());
                              setIsPaymentDialogOpen(true);
                            }}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!accounts?.length && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      Nenhuma conta a receber encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Pagamento */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
          </DialogHeader>
          {selectedAccount && (
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <div className="text-sm font-medium">{selectedAccount.customer_name}</div>
              </div>

              <div className="space-y-2">
                <Label>Valor Total</Label>
                <div className="text-sm">{formatCurrency(selectedAccount.amount)}</div>
              </div>

              <div className="space-y-2">
                <Label>Valor Restante</Label>
                <div className="text-sm">{formatCurrency(selectedAccount.remaining_amount)}</div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_amount">Valor do Pagamento *</Label>
                <Input
                  id="payment_amount"
                  type="number"
                  step="0.01"
                  max={selectedAccount.remaining_amount}
                  placeholder="0,00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsPaymentDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={registerPayment.isPending}>
                  {registerPayment.isPending ? 'Processando...' : 'Registrar Pagamento'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
