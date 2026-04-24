
import { TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ExpenseWithSupplier } from '@/hooks/useExpenses';
import { formatDate, formatCurrency } from "@/utils/formatters";
import { ResponsiveTable, ResponsiveTableRow } from "@/components/financeiro/ResponsiveTable";

interface ExpensesTableProps {
    expenses: ExpenseWithSupplier[];
    onEdit: (expense: ExpenseWithSupplier) => void;
    onDelete: (id: string) => void;
}

const getStatusVariant = (status: ExpenseWithSupplier['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
        case 'pago':
            return 'default';
        case 'pendente':
            return 'secondary';
        case 'vencido':
            return 'destructive';
        case 'cancelado':
            return 'outline';
        default:
            return 'secondary';
    }
};

const ActionMenu = ({ expense, onEdit, onDelete }: { expense: ExpenseWithSupplier, onEdit: (expense: ExpenseWithSupplier) => void, onDelete: (id: string) => void }) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 flex-shrink-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEdit(expense)}>Editar</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onSelect={() => onDelete(expense.id)}>Excluir</DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
);


export function ExpensesTable({ expenses, onEdit, onDelete }: ExpensesTableProps) {
    const headers = ["Descrição", "Fornecedor", "Categoria", "Vencimento", "Valor", "Status", ""];

    return (
        <div className="border rounded-lg bg-white overflow-hidden">
            <ResponsiveTable headers={headers}>
                {expenses.map((expense) => (
                    <ResponsiveTableRow
                        key={expense.id}
                        mobileContent={
                            <div className="space-y-3">
                                <div className="flex justify-between items-start gap-2">
                                    <p className="font-medium break-all">{expense.description || '-'}</p>
                                    <ActionMenu expense={expense} onEdit={onEdit} onDelete={onDelete} />
                                </div>

                                <div className="text-sm text-muted-foreground space-y-1">
                                    {(expense.suppliers?.name || expense.supplier_name) && <p><strong>Fornecedor:</strong> {expense.suppliers?.name || expense.supplier_name}</p>}
                                    <p><strong>Categoria:</strong> {expense.financial_categories?.name || '-'}</p>
                                    <p><strong>Vencimento:</strong> {formatDate(expense.due_date)}</p>
                                </div>
                                
                                <div className="flex justify-between items-center pt-2 border-t mt-2">
                                    <span className="font-bold text-lg">{formatCurrency(expense.amount)}</span>
                                    {expense.status && <Badge variant={getStatusVariant(expense.status)} className="capitalize">{expense.status}</Badge>}
                                </div>
                            </div>
                        }
                    >
                        <TableCell className="font-medium">{expense.description || '-'}</TableCell>
                        <TableCell>{expense.suppliers?.name || expense.supplier_name || '-'}</TableCell>
                        <TableCell>{expense.financial_categories?.name || '-'}</TableCell>
                        <TableCell>{formatDate(expense.due_date)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                        <TableCell>
                            {expense.status && <Badge variant={getStatusVariant(expense.status)} className="capitalize">{expense.status}</Badge>}
                        </TableCell>
                        <TableCell>
                            <ActionMenu expense={expense} onEdit={onEdit} onDelete={onDelete} />
                        </TableCell>
                    </ResponsiveTableRow>
                ))}
            </ResponsiveTable>
        </div>
    );
}
