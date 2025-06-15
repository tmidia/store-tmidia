
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return '-';
    try {
        return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
        console.error("Invalid date for formatting:", date);
        return 'Data inválida';
    }
};

export const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(amount);
};
