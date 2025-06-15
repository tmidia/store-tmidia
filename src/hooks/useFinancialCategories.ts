
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export type FinancialCategory = Tables<'financial_categories'>;
export type FinancialCategoryInsert = TablesInsert<'financial_categories'>;

// Fetch categories
const fetchFinancialCategories = async (type?: 'receita' | 'despesa') => {
    let query = supabase.from('financial_categories').select('*');

    if (type) {
        query = query.eq('type', type);
    }

    const { data, error } = await query.order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return data as FinancialCategory[];
};

export const useFinancialCategories = (type?: 'receita' | 'despesa') => {
    return useQuery({
        queryKey: ['financial-categories', type],
        queryFn: () => fetchFinancialCategories(type),
    });
};

// Create category
const createFinancialCategory = async (category: FinancialCategoryInsert) => {
    const { data, error } = await supabase.from('financial_categories').insert(category).select().single();
    if (error) throw new Error(error.message);
    return data;
};

export const useCreateFinancialCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createFinancialCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['financial-categories'] });
        },
    });
};
