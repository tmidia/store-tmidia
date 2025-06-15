
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProductBasicInfoProps {
  name: string;
  code: string;
  handleInputChange: (field: string, value: string) => void;
  setFormData: (updater: (prev: any) => any) => void;
}

const ProductBasicInfo = ({ name, code, handleInputChange, setFormData }: ProductBasicInfoProps) => (
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
      <Input
        id="code"
        value={code}
        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
        required
      />
    </div>
  </div>
);

export default ProductBasicInfo;
