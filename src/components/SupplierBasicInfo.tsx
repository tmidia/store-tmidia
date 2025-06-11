
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SupplierBasicInfoProps {
  formData: {
    name: string;
    company_name: string;
    cpf: string;
    cnpj: string;
    supplier_type: string;
  };
  onInputChange: (field: string, value: string) => void;
  onSupplierTypeChange: (value: string) => void;
}

const SupplierBasicInfo = ({ formData, onInputChange, onSupplierTypeChange }: SupplierBasicInfoProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="company_name">Razão Social</Label>
          <Input
            id="company_name"
            value={formData.company_name}
            onChange={(e) => onInputChange('company_name', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            value={formData.cpf}
            onChange={(e) => onInputChange('cpf', e.target.value)}
            placeholder="000.000.000-00"
            maxLength={14}
          />
        </div>
        <div>
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input
            id="cnpj"
            value={formData.cnpj}
            onChange={(e) => onInputChange('cnpj', e.target.value)}
            placeholder="00.000.000/0000-00"
            maxLength={18}
          />
        </div>
        <div>
          <Label htmlFor="supplier_type">Tipo</Label>
          <Select value={formData.supplier_type} onValueChange={onSupplierTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fornecedor">Fornecedor</SelectItem>
              <SelectItem value="prestador">Prestador de Serviço</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};

export default SupplierBasicInfo;
