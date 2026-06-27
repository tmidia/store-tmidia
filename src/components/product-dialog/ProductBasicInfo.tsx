
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import { generateInternalCode, generateEAN13 } from '@/utils/productCode';

interface ProductBasicInfoProps {
  name: string;
  code: string;
  barcode: string;
  handleInputChange: (field: string, value: string) => void;
  setFormData: (updater: (prev: any) => any) => void;
}

const ProductBasicInfo = ({ name, code, barcode, handleInputChange, setFormData }: ProductBasicInfoProps) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="name">Nome do Produto</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="code">Código</Label>
        <div className="flex gap-2">
          <Input
            id="code"
            value={code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
            required
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            title="Gerar código automático"
            onClick={() => setFormData(prev => ({ ...prev, code: generateInternalCode() }))}
          >
            <Wand2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>

    <div>
      <Label htmlFor="barcode">Código de Barras (EAN-13)</Label>
      <div className="flex gap-2">
        <Input
          id="barcode"
          value={barcode}
          inputMode="numeric"
          placeholder="Deixe em branco ou gere automaticamente"
          onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value.replace(/\D/g, '').slice(0, 13) }))}
        />
        <Button
          type="button"
          variant="outline"
          title="Gerar código de barras EAN-13"
          onClick={() => setFormData(prev => ({ ...prev, barcode: generateEAN13() }))}
        >
          <Wand2 className="w-4 h-4 mr-1" />
          Gerar
        </Button>
      </div>
    </div>
  </div>
);

export default ProductBasicInfo;
