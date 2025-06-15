
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Expense, ExpenseWithSupplier } from '@/hooks/useExpenses';
import { formatDate, formatCurrency } from "@/utils/formatters";

interface ExpensesTableProps {
    expenses: ExpenseWithSupplier[];
}

const getStatusVariant = (status: Expense['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
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

export function ExpensesTable({ expenses }: ExpensesTableProps) {
    return (
        <div className="border rounded-lg bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Fornecedor</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[50px]">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {expenses.map((expense) => (
                        <TableRow key={expense.id}>
                            <TableCell className="font-medium">{expense.description || '-'}</TableCell>
                            <TableCell>{expense.suppliers?.name || expense.supplier_name}</TableCell>
                            <TableCell>{expense.category || '-'}</TableCell>
                            <TableCell>{formatDate(expense.due_date)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                            <TableCell>
                                {expense.status && <Badge variant={getStatusVariant(expense.status)} className="capitalize">{expense.status}</Badge>}
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Abrir menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Editar</DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600">Excluir</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
