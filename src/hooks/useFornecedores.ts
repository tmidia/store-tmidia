
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  cnpj?: string;
  cpf?: string;
  contact_person?: string;
  supplier_type?: string;
  company_name?: string;
  created_at?: string;
  updated_at?: string;
}

export const useFornecedores = () => {
  const [fornecedores, setFornecedores] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFornecedores = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');

      if (error) throw error;
      setFornecedores(data || []);
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
      toast({
        title: "Erro ao carregar fornecedores",
        description: "Não foi possível carregar a lista de fornecedores.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveFornecedor = async (supplierData: any, editingSupplier: Supplier | null) => {
    try {
      if (editingSupplier) {
        const { error } = await supabase
          .from('suppliers')
          .update(supplierData)
          .eq('id', editingSupplier.id);

        if (error) throw error;
        
        toast({
          title: "Fornecedor atualizado!",
          description: "As alterações foram salvas com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from('suppliers')
          .insert([supplierData]);

        if (error) throw error;

        toast({
          title: "Fornecedor cadastrado!",
          description: "Novo fornecedor adicionado ao sistema.",
        });
      }
      
      fetchFornecedores();
      return true;
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
      toast({
        title: "Erro ao salvar fornecedor",
        description: "Não foi possível salvar o fornecedor. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteFornecedor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Fornecedor removido!",
        description: "O fornecedor foi excluído do sistema.",
        variant: "destructive",
      });
      
      fetchFornecedores();
    } catch (error) {
      console.error('Erro ao excluir fornecedor:', error);
      toast({
        title: "Erro ao excluir fornecedor",
        description: "Não foi possível excluir o fornecedor. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchFornecedores();
  }, []);

  return {
    fornecedores,
    loading,
    saveFornecedor,
    deleteFornecedor,
    fetchFornecedores
  };
};
