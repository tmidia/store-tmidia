import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ProductVariation {
  id: string;
  product_id: string;
  sku: string;
  variation_name: string;
  attributes?: any;
  cost_price: number;
  sale_price: number;
  stock_quantity: number;
  minimum_stock: number;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export const useProductVariations = (productId?: string) => {
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchVariations = useCallback(async (prodId?: string) => {
    const id = prodId || productId;
    if (!id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_variations')
        .select('*')
        .eq('product_id', id)
        .order('variation_name');

      if (error) throw error;
      setVariations((data || []) as ProductVariation[]);
    } catch (error) {
      console.error('Erro ao buscar variações:', error);
      toast({
        title: "Erro ao carregar variações",
        description: "Não foi possível carregar as variações do produto.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const saveVariation = async (variationData: { 
    product_id: string; 
    sku: string; 
    variation_name: string;
    cost_price?: number;
    sale_price?: number;
    stock_quantity?: number;
    minimum_stock?: number;
    attributes?: any;
    is_active?: boolean;
  }, editingVariation?: ProductVariation | null) => {
    try {
      if (editingVariation) {
        const { error } = await supabase
          .from('product_variations')
          .update({
            sku: variationData.sku,
            variation_name: variationData.variation_name,
            cost_price: variationData.cost_price,
            sale_price: variationData.sale_price,
            stock_quantity: variationData.stock_quantity,
            minimum_stock: variationData.minimum_stock,
            attributes: variationData.attributes,
            is_active: variationData.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingVariation.id);

        if (error) throw error;
        
        toast({
          title: "Variação atualizada!",
          description: "As alterações foram salvas com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from('product_variations')
          .insert([variationData]);

        if (error) throw error;

        toast({
          title: "Variação cadastrada!",
          description: "Nova variação adicionada ao produto.",
        });
      }
      
      if (variationData.product_id) {
        await fetchVariations(variationData.product_id);
      }
      return true;
    } catch (error: any) {
      console.error('Erro ao salvar variação:', error);
      toast({
        title: "Erro ao salvar variação",
        description: error.message?.includes('unique') 
          ? "Já existe uma variação com este SKU."
          : "Não foi possível salvar a variação. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteVariation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('product_variations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Variação removida!",
        description: "A variação foi excluída do produto.",
      });
      
      setVariations(prev => prev.filter(v => v.id !== id));
      return true;
    } catch (error) {
      console.error('Erro ao excluir variação:', error);
      toast({
        title: "Erro ao excluir variação",
        description: "Não foi possível excluir a variação. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateStock = async (variationId: string, quantity: number, operation: 'add' | 'subtract' = 'subtract') => {
    try {
      const variation = variations.find(v => v.id === variationId);
      if (!variation) throw new Error('Variação não encontrada');

      const newQuantity = operation === 'add' 
        ? variation.stock_quantity + quantity 
        : variation.stock_quantity - quantity;

      if (newQuantity < 0) {
        toast({
          title: "Estoque insuficiente",
          description: "Não há estoque suficiente para esta operação.",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('product_variations')
        .update({ 
          stock_quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', variationId);

      if (error) throw error;

      setVariations(prev => prev.map(v => 
        v.id === variationId ? { ...v, stock_quantity: newQuantity } : v
      ));
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      toast({
        title: "Erro ao atualizar estoque",
        description: "Não foi possível atualizar o estoque. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    variations,
    loading,
    fetchVariations,
    saveVariation,
    deleteVariation,
    updateStock,
    setVariations
  };
};
