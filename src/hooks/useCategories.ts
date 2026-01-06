import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  parent_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CategoryWithSubcategories extends Category {
  subcategories: Category[];
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      
      const allCategories = data || [];
      setCategories(allCategories);
      
      // Filtrar categorias principais (sem parent_id)
      const main = allCategories.filter(cat => !cat.parent_id);
      setMainCategories(main);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      toast({
        title: "Erro ao carregar categorias",
        description: "Não foi possível carregar a lista de categorias.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const getSubcategories = useCallback((parentId: string): Category[] => {
    return categories.filter(cat => cat.parent_id === parentId);
  }, [categories]);

  const getCategoriesWithSubcategories = useCallback((): CategoryWithSubcategories[] => {
    return mainCategories.map(main => ({
      ...main,
      subcategories: getSubcategories(main.id)
    }));
  }, [mainCategories, getSubcategories]);

  const saveCategory = async (categoryData: { name: string; description?: string | null; parent_id?: string | null }, editingCategory?: Category | null) => {
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id);

        if (error) throw error;
        
        toast({
          title: "Categoria atualizada!",
          description: "As alterações foram salvas com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([categoryData]);

        if (error) throw error;

        toast({
          title: "Categoria cadastrada!",
          description: categoryData.parent_id 
            ? "Nova subcategoria adicionada ao sistema."
            : "Nova categoria adicionada ao sistema.",
        });
      }
      
      await fetchCategories();
      return true;
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast({
        title: "Erro ao salvar categoria",
        description: "Não foi possível salvar a categoria. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      // Verificar se tem subcategorias
      const subcats = getSubcategories(id);
      if (subcats.length > 0) {
        toast({
          title: "Não é possível excluir",
          description: "Esta categoria possui subcategorias. Remova-as primeiro.",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Categoria removida!",
        description: "A categoria foi excluída do sistema.",
      });
      
      await fetchCategories();
      return true;
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast({
        title: "Erro ao excluir categoria",
        description: "Não foi possível excluir a categoria. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    mainCategories,
    loading,
    fetchCategories,
    getSubcategories,
    getCategoriesWithSubcategories,
    saveCategory,
    deleteCategory
  };
};
