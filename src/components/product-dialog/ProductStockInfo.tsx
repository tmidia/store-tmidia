
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProductStockInfoProps {
  stock_quantity: string;
  minimum_stock: string;
  setFormData: (updater: (prev: any) => any) => void;
}

const ProductStockInfo = ({ stock_quantity, minimum_stock, setFormData }: ProductStockInfoProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <Label htmlFor="stock_quantity">Quantidade em Estoque</Label>
      <Input
        id="stock_quantity"
        type="number"
        value={stock_quantity}
        onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: e.target.value }))}
      />
    </div>
    <div>
      <Label htmlFor="minimum_stock">Estoque Mínimo</Label>
      <Input
        id="minimum_stock"
        type="number"
        value={minimum_stock}
        onChange={(e) => setFormData(prev => ({ ...prev, minimum_stock: e.target.value }))}
      />
    </div>
  </div>
);

export default ProductStockInfo;
