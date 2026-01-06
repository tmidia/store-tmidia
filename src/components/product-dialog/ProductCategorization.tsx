import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useCategories, type Category } from '@/hooks/useCategories';
import type { Database } from '@/integrations/supabase/types';

type Supplier = Database['public']['Tables']['suppliers']['Row'];

interface ProductCategorizationProps {
  categoryId: string;
  subcategoryId: string;
  supplierId: string;
  suppliers: Supplier[];
  setFormData: (updater: (prev: any) => any) => void;
}

const ProductCategorization = ({ 
  categoryId, 
  subcategoryId,
  supplierId, 
  suppliers, 
  setFormData 
}: ProductCategorizationProps) => {
  const { mainCategories, getSubcategories, loading } = useCategories();
  const [subcategories, setSubcategories] = useState<Category[]>([]);

  useEffect(() => {
    if (categoryId) {
      const subs = getSubcategories(categoryId);
      setSubcategories(subs);
      
      // Se a subcategoria atual não pertence à categoria selecionada, limpar
      if (subcategoryId && !subs.find(s => s.id === subcategoryId)) {
        setFormData(prev => ({ ...prev, subcategory_id: '' }));
      }
    } else {
      setSubcategories([]);
      setFormData(prev => ({ ...prev, subcategory_id: '' }));
    }
  }, [categoryId, getSubcategories, subcategoryId, setFormData]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="category_id">Categoria</Label>
        <Select 
          value={categoryId} 
          onValueChange={(value) => setFormData(prev => ({ 
            ...prev, 
            category_id: value === 'none' ? '' : value,
            subcategory_id: '' // Limpar subcategoria ao mudar categoria
          }))}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhuma</SelectItem>
            {mainCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="subcategory_id">Subcategoria</Label>
        <Select 
          value={subcategoryId} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, subcategory_id: value === 'none' ? '' : value }))}
          disabled={!categoryId || subcategories.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder={!categoryId ? "Selecione categoria primeiro" : subcategories.length === 0 ? "Nenhuma subcategoria" : "Selecione"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhuma</SelectItem>
            {subcategories.map((subcategory) => (
              <SelectItem key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="supplier_id">Fornecedor</Label>
        <Select 
          value={supplierId} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, supplier_id: value === 'none' ? '' : value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um fornecedor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhum</SelectItem>
            {suppliers.map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.id}>
                {supplier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ProductCategorization;
