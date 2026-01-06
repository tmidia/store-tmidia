import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { capitalizeWords } from '@/utils/textUtils';
import type { Database } from '@/integrations/supabase/types';
import ProductBasicInfo from './product-dialog/ProductBasicInfo';
import ProductDescription from './product-dialog/ProductDescription';
import ProductCategorization from './product-dialog/ProductCategorization';
import ProductPricing from './product-dialog/ProductPricing';
import ProductStockInfo from './product-dialog/ProductStockInfo';

type Product = Database['public']['Tables']['products']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Supplier = Database['public']['Tables']['suppliers']['Row'];

interface ProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (productData: any) => Promise<void>;
}

const ProductDialog = ({ isOpen, onClose, product, onSave }: ProductDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    category_id: '',
    supplier_id: '',
    cost_price: '',
    sale_price: '',
    profit_margin: '',
    stock_quantity: '',
    minimum_stock: ''
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [useMargin, setUseMargin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        code: product.code || '',
        description: product.description || '',
        category_id: product.category_id || '',
        supplier_id: product.supplier_id || '',
        cost_price: product.cost_price?.toString() || '',
        sale_price: product.sale_price?.toString() || '',
        profit_margin: '',
        stock_quantity: product.stock_quantity?.toString() || '',
        minimum_stock: product.minimum_stock?.toString() || ''
      });
      setUseMargin(false);
    } else {
      resetForm();
    }
  }, [product]);

  // Calcular preço de venda automaticamente quando margem ou preço de custo mudam
  useEffect(() => {
    if (useMargin && formData.cost_price && formData.profit_margin) {
      const costPrice = parseFloat(formData.cost_price);
      const margin = parseFloat(formData.profit_margin);
      
      if (!isNaN(costPrice) && !isNaN(margin) && costPrice > 0) {
        const salePrice = costPrice * (1 + margin / 100);
        setFormData(prev => ({ 
          ...prev, 
          sale_price: salePrice.toFixed(2) 
        }));
      }
    }
  }, [formData.cost_price, formData.profit_margin, useMargin]);

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (data) setCategories(data);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');
      
      if (data) setSuppliers(data);
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      category_id: '',
      subcategory_id: '',
      supplier_id: '',
      cost_price: '',
      sale_price: '',
      profit_margin: '',
      stock_quantity: '',
      minimum_stock: ''
    });
    setUseMargin(false);
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'name' || field === 'description') {
      formattedValue = capitalizeWords(value);
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const calculateMarginFromPrices = () => {
    if (formData.cost_price && formData.sale_price) {
      const costPrice = parseFloat(formData.cost_price);
      const salePrice = parseFloat(formData.sale_price);
      
      if (!isNaN(costPrice) && !isNaN(salePrice) && costPrice > 0) {
        const margin = ((salePrice - costPrice) / costPrice) * 100;
        setFormData(prev => ({ 
          ...prev, 
          profit_margin: margin.toFixed(2) 
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const productData = {
        name: formData.name,
        code: formData.code,
        description: formData.description || null,
        category_id: formData.category_id || null,
        subcategory_id: formData.subcategory_id || null,
        supplier_id: formData.supplier_id || null,
        cost_price: parseFloat(formData.cost_price) || 0,
        sale_price: parseFloat(formData.sale_price) || 0,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        minimum_stock: parseInt(formData.minimum_stock) || 0
      };

      await onSave(productData);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar produto.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
          <DialogDescription>
            {product ? 'Atualize as informações do produto.' : 'Preencha os dados para criar um novo produto.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ProductBasicInfo
            name={formData.name}
            code={formData.code}
            handleInputChange={handleInputChange}
            setFormData={setFormData}
          />

          <ProductDescription
            description={formData.description}
            handleInputChange={handleInputChange}
          />

          <ProductCategorization
            categoryId={formData.category_id}
            subcategoryId={formData.subcategory_id}
            supplierId={formData.supplier_id}
            suppliers={suppliers}
            setFormData={setFormData}
          />

          <ProductPricing
            formData={formData}
            useMargin={useMargin}
            setUseMargin={setUseMargin}
            setFormData={setFormData}
            calculateMarginFromPrices={calculateMarginFromPrices}
          />

          <ProductStockInfo
            stock_quantity={formData.stock_quantity}
            minimum_stock={formData.minimum_stock}
            setFormData={setFormData}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : (product ? 'Atualizar' : 'Criar')} Produto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;
