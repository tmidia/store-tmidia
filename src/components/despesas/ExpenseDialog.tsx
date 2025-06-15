
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ExpenseForm } from "./ExpenseForm"
import type { ExpenseWithSupplier } from "@/hooks/useExpenses"

interface ExpenseDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  expense?: ExpenseWithSupplier | null
}

export function ExpenseDialog({ isOpen, onOpenChange, expense }: ExpenseDialogProps) {
  const isEditing = !!expense

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Despesa' : 'Adicionar Despesa'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Altere as informações da despesa abaixo.'
              : 'Preencha as informações para adicionar uma nova despesa.'}
          </DialogDescription>
        </DialogHeader>
        <ExpenseForm 
            expense={expense || undefined} 
            onSuccess={() => onOpenChange(false)} 
        />
      </DialogContent>
    </Dialog>
  )
}
