
import { useExpenses } from '@/hooks/useExpenses';
import { ExpensesTable } from '@/components/despesas/ExpensesTable';
import { ExpenseDialog } from '@/components/despesas/ExpenseDialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function Despesas() {
    const { data: expenses, isLoading, error } = useExpenses();

    return (
        <div className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Despesas</h1>
                <ExpenseDialog />
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
            {expenses && expenses.length > 0 && <ExpensesTable expenses={expenses} />}
            {expenses && expenses.length === 0 && !isLoading && (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <h2 className="text-xl font-semibold text-gray-700">Nenhuma despesa encontrada</h2>
                <p className="text-gray-500 mt-2">Comece adicionando uma nova despesa.</p>
              </div>
            )}
        </div>
    );
}
