import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingDown, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

export const AccountsPayable = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [formData, setFormData] = useState({
    supplier_id: '',
    supplier_name: '',
    amount: '',
    due_date: '',
    description: '',
    category_id: ''
  });
  const [paymentAmount, setPaymentAmount] = useState('');

  const queryClient = useQueryClient();

  // Buscar fornecedores
  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name')
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  // Buscar categorias financeiras de despesa
  const { data: categories } = useQuery({
    queryKey: ['financial-categories', 'despesa'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_categories')
        .select('id, name')
        .eq('type', 'despesa')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  // Buscar contas a pagar
  const { data: accounts, isLoading } = useQuery({
    queryKey: ['accounts-payable'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts_payable')
        .select(`
          *,
          suppliers(name),
          financial_categories(name)
        `)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  // Criar nova conta a pagar
  const createAccount = useMutation({
    mutationFn: async (data: any) => {
      const amount = parseFloat(data.amount);
      const selectedSupplier = suppliers?.find(s => s.id === data.supplier_id);
      
      const { error } = await supabase
        .from('accounts_payable')
        .insert([{
          supplier_id: data.supplier_id || null,
          supplier_name: selectedSupplier?.name || data.supplier_name,
          amount: amount,
          due_date: data.due_date,
          description: data.description || null,
          category_id: data.category_id || null
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
      queryClient.invalidateQueries({ queryKey: ['financial-overview'] });
      setIsDialogOpen(false);
      setFormData({
        supplier_id: '',
        supplier_name: '',
        amount: '',
        due_date: '',
        description: '',
        category_id: ''
      });
      toast.success('Conta a pagar criada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar conta a pagar');
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
        .from('accounts_payable')
        .update({
          paid_amount: newPaidAmount,
          remaining_amount: newRemainingAmount,
          status: newStatus
        })
        .eq('id', accountId);

      if (error) throw error;

      // Registrar transação financeira
      await supabase
        .from('financial_transactions')
        .insert([{
          type: 'despesa',
          amount: amount,
          description: `Pagamento para ${account.supplier_name}`,
          reference_id: accountId,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
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
    if ((!formData.supplier_id && !formData.supplier_name) || !formData.amount || !formData.due_date) {
      toast.error('Preencha os campos obrigatórios');
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
          <TrendingDown className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Contas a Pagar</h3>
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
              <DialogTitle>Nova Conta a Pagar</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Fornecedor *</Label>
                <Select value={formData.supplier_id} onValueChange={(value) => setFormData({...formData, supplier_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers?.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!formData.supplier_id && (
                  <Input
                    placeholder="Ou digite o nome do fornecedor"
                    value={formData.supplier_name}
                    onChange={(e) => setFormData({...formData, supplier_name: e.target.value})}
                  />
                )}
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
                <Label htmlFor="category">Categoria</Label>
                <Select value={formData.category_id} onValueChange={(value) => setFormData({...formData, category_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
          <CardTitle>Lista de Contas a Pagar</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Carregando contas...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead>Restante</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts?.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.supplier_name}</TableCell>
                    <TableCell>
                      {format(new Date(account.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>{formatCurrency(account.amount)}</TableCell>
                    <TableCell>{formatCurrency(account.paid_amount || 0)}</TableCell>
                    <TableCell>{formatCurrency(account.remaining_amount)}</TableCell>
                    <TableCell>{account.financial_categories?.name || '-'}</TableCell>
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
                    <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                      Nenhuma conta a pagar encontrada
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
                <Label>Fornecedor</Label>
                <div className="text-sm font-medium">{selectedAccount.supplier_name}</div>
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
