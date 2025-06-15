
import { useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateExpense, useUpdateExpense, type ExpenseWithSupplier } from '@/hooks/useExpenses';
import { useFornecedores } from '@/hooks/useFornecedores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { CategoryCombobox } from './CategoryCombobox';

const expenseSchema = z.object({
  description: z.string().min(3, { message: 'A descrição deve ter pelo menos 3 caracteres.' }),
  amount: z.coerce.number().positive({ message: 'O valor deve ser um número positivo.' }),
  due_date: z.date({ required_error: 'A data de vencimento é obrigatória.' }),
  status: z.enum(['pendente', 'pago', 'vencido', 'cancelado']),
  category: z.string().optional(),
  supplier_id: z.string().uuid().optional().nullable(),
  notes: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  expense?: ExpenseWithSupplier;
  onSuccess: () => void;
}

export function ExpenseForm({ expense, onSuccess }: ExpenseFormProps) {
  const isEditing = !!expense;
  const { fornecedores: suppliers, loading: isLoadingSuppliers } = useFornecedores();
  const createExpenseMutation = useCreateExpense();
  const updateExpenseMutation = useUpdateExpense();

  const defaultValues = {
    description: '',
    amount: 0,
    due_date: new Date(),
    status: 'pendente' as const,
    category: '',
    supplier_id: null,
    notes: '',
  };

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense ? {
        description: expense.description || '',
        amount: expense.amount || 0,
        due_date: expense.due_date ? new Date(expense.due_date) : new Date(),
        status: expense.status || 'pendente',
        category: expense.category || '',
        supplier_id: expense.supplier_id || null,
        notes: expense.notes || '',
    } : defaultValues,
  });
  
  useEffect(() => {
    if (expense) {
      form.reset({
        description: expense.description || '',
        amount: expense.amount || 0,
        due_date: expense.due_date ? new Date(expense.due_date) : new Date(),
        status: expense.status || 'pendente',
        category: expense.category || '',
        supplier_id: expense.supplier_id || null,
        notes: expense.notes || '',
      });
    } else {
      form.reset(defaultValues);
    }
  }, [expense, form]);


  const onSubmit = (data: ExpenseFormValues) => {
    const submissionData = {
      ...data,
      due_date: data.due_date.toISOString(),
      supplier_id: data.supplier_id || null,
    };

    if (isEditing && expense) {
        updateExpenseMutation.mutate({ id: expense.id, ...submissionData }, {
            onSuccess: () => {
                toast.success(`Despesa atualizada com sucesso!`);
                onSuccess();
            },
            onError: (error: any) => {
                toast.error(`Erro ao atualizar despesa: ${error.message}`);
            }
        });
    } else {
        createExpenseMutation.mutate(submissionData, {
            onSuccess: () => {
                toast.success(`Despesa criada com sucesso!`);
                onSuccess();
            },
            onError: (error: any) => {
                toast.error(`Erro ao criar despesa: ${error.message}`);
            }
        });
    }
  };
  
  const isLoading = createExpenseMutation.isPending || updateExpenseMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Conta de luz" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0,00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Vencimento</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                    )}
                                >
                                    {field.value ? (
                                        format(field.value, "dd/MM/yyyy", { locale: ptBR })
                                    ) : (
                                        <span>Escolha uma data</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="vencido">Vencido</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <FormControl>
                    <CategoryCombobox
                        value={field.value}
                        onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        
        <FormField
          control={form.control}
          name="supplier_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fornecedor (Opcional)</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                value={field.value ?? 'none'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingSuppliers ? "Carregando..." : "Selecione um fornecedor"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {!isLoadingSuppliers && suppliers?.map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                        </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas (Opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Adicione observações sobre a despesa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (isEditing ? 'Salvando...' : 'Criando...') : (isEditing ? 'Salvar Alterações' : 'Criar Despesa')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
