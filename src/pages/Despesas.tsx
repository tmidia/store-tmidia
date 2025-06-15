
import { useState } from 'react';
import { useExpenses, useDeleteExpense, type ExpenseWithSupplier } from '@/hooks/useExpenses';
import { ExpensesTable } from '@/components/despesas/ExpensesTable';
import { ExpenseDialog } from '@/components/despesas/ExpenseDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Despesas() {
    const { data: expenses, isLoading, error } = useExpenses();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<ExpenseWithSupplier | null>(null);

    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [expenseToDeleteId, setExpenseToDeleteId] = useState<string | null>(null);
    const deleteMutation = useDeleteExpense();

    const handleAddNew = () => {
        setSelectedExpense(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (expense: ExpenseWithSupplier) => {
        setSelectedExpense(expense);
        setIsDialogOpen(true);
    };

    const handleDeleteRequest = (id: string) => {
        setExpenseToDeleteId(id);
        setIsDeleteAlertOpen(true);
    };

    const confirmDelete = () => {
        if (!expenseToDeleteId) return;
        deleteMutation.mutate(expenseToDeleteId, {
            onSuccess: () => {
                toast.success('Despesa excluída com sucesso.');
                setIsDeleteAlertOpen(false);
            },
            onError: (err) => {
                toast.error(`Falha ao excluir despesa: ${err.message}`);
                setIsDeleteAlertOpen(false);
            },
        });
    };

    return (
        <div className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Despesas</h1>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Despesa
                </Button>
            </div>
            {isLoading && (
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            )}
            {error && <p className="text-red-500">Erro ao carregar despesas: {error.message}</p>}
            {expenses && expenses.length > 0 && <ExpensesTable expenses={expenses} onEdit={handleEdit} onDelete={handleDeleteRequest} />}
            {expenses && expenses.length === 0 && !isLoading && (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <h2 className="text-xl font-semibold text-gray-700">Nenhuma despesa encontrada</h2>
                <p className="text-gray-500 mt-2">Comece adicionando uma nova despesa.</p>
              </div>
            )}

            <ExpenseDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                expense={selectedExpense}
            />

            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente a despesa e todos os dados associados a ela.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? 'Excluindo...' : 'Confirmar Exclusão'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
