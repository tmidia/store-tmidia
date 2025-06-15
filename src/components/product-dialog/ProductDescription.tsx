
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ProductDescriptionProps {
  description: string;
  handleInputChange: (field: string, value: string) => void;
}

const ProductDescription = ({ description, handleInputChange }: ProductDescriptionProps) => (
  <div>
    <Label htmlFor="description">Descrição</Label>
    <Textarea
      id="description"
      value={description}
      onChange={(e) => handleInputChange('description', e.target.value)}
      rows={3}
    />
  </div>
);

export default ProductDescription;
