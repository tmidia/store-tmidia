import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Expense = Tables<'accounts_payable'> & { notes?: string | null };
export type ExpenseInsert = TablesInsert<'accounts_payable'>;
export type ExpenseUpdate = TablesUpdate<'accounts_payable'>;

export type ExpenseWithSupplier = Expense & {
    suppliers: { name: string } | null;
};

// Fetch expenses
const fetchExpenses = async (): Promise<ExpenseWithSupplier[]> => {
    const { data, error } = await supabase
        .from('accounts_payable')
        .select(`
            *,
            suppliers ( name )
        `)
        .order('due_date', { ascending: true });

    if (error) throw new Error(error.message);
    
    return data as ExpenseWithSupplier[];
};

export const useExpenses = () => {
    return useQuery({
        queryKey: ['expenses'],
        queryFn: fetchExpenses,
    });
};

// Create expense
const createExpense = async (expense: ExpenseInsert) => {
    const { data, error } = await supabase.from('accounts_payable').insert(expense).select().single();
    if (error) throw new Error(error.message);
    return data;
};

export const useCreateExpense = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createExpense,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
        },
    });
};

// Update expense
const updateExpense = async ({ id, ...updates }: ExpenseUpdate & { id: string }) => {
    const { data, error } = await supabase.from('accounts_payable').update(updates).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
};

export const useUpdateExpense = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateExpense,
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['expense', variables.id] });
        },
    });
};

// Delete expense
const deleteExpense = async (id: string) => {
    const { error } = await supabase.from('accounts_payable').delete().eq('id', id);
    if (error) throw new Error(error.message);
};

export const useDeleteExpense = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteExpense,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
        },
    });
};
