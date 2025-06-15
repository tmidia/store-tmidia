
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { Database } from '@/integrations/supabase/types';

type Category = Database['public']['Tables']['categories']['Row'];
type Supplier = Database['public']['Tables']['suppliers']['Row'];

interface ProductCategorizationProps {
  categoryId: string;
  supplierId: string;
  categories: Category[];
  suppliers: Supplier[];
  setFormData: (updater: (prev: any) => any) => void;
}

const ProductCategorization = ({ categoryId, supplierId, categories, suppliers, setFormData }: ProductCategorizationProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <Label htmlFor="category_id">Categoria</Label>
      <Select value={categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma categoria" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div>
      <Label htmlFor="supplier_id">Fornecedor</Label>
      <Select value={supplierId} onValueChange={(value) => setFormData(prev => ({ ...prev, supplier_id: value }))}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione um fornecedor" />
        </SelectTrigger>
        <SelectContent>
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

export default ProductCategorization;
