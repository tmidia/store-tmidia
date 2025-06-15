
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Percent } from 'lucide-react';

interface ProductPricingProps {
  formData: {
    cost_price: string;
    sale_price: string;
    profit_margin: string;
  };
  useMargin: boolean;
  setUseMargin: (value: boolean) => void;
  setFormData: (updater: (prev: any) => any) => void;
  calculateMarginFromPrices: () => void;
}

const ProductPricing = ({ formData, useMargin, setUseMargin, setFormData, calculateMarginFromPrices }: ProductPricingProps) => (
  <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id="use-margin"
        checked={useMargin}
        onChange={(e) => setUseMargin(e.target.checked)}
        className="rounded border-gray-300"
      />
      <Label htmlFor="use-margin" className="text-sm font-medium">
        Calcular preço de venda por margem
      </Label>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="cost_price">Preço de Custo</Label>
        <Input
          id="cost_price"
          type="number"
          step="0.01"
          value={formData.cost_price}
          onChange={(e) => setFormData(prev => ({ ...prev, cost_price: e.target.value }))}
          required
        />
      </div>
      {useMargin && (
        <div>
          <Label htmlFor="profit_margin">Margem de Lucro (%)</Label>
          <div className="relative">
            <Input
              id="profit_margin"
              type="number"
              step="0.01"
              value={formData.profit_margin}
              onChange={(e) => setFormData(prev => ({ ...prev, profit_margin: e.target.value }))}
              placeholder="Ex: 50 para 50%"
            />
            <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
      )}
    </div>

    <div>
      <Label htmlFor="sale_price">Preço de Venda</Label>
      <Input
        id="sale_price"
        type="number"
        step="0.01"
        value={formData.sale_price}
        onChange={(e) => setFormData(prev => ({ ...prev, sale_price: e.target.value }))}
        onBlur={calculateMarginFromPrices}
        readOnly={useMargin}
        className={useMargin ? 'bg-gray-100' : ''}
        required
      />
      {useMargin && (
        <p className="text-xs text-gray-600 mt-1">
          Calculado automaticamente baseado na margem
        </p>
      )}
    </div>
  </div>
);

export default ProductPricing;
