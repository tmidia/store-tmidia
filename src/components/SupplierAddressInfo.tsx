
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SupplierAddressInfoProps {
  formData: {
    zip_code: string;
    city: string;
    state: string;
    address: string;
  };
  onInputChange: (field: string, value: string) => void;
  onCEPSearch: (cep: string) => void;
  onZipCodeChange: (value: string) => void;
  onStateChange: (value: string) => void;
  cepLoading: boolean;
}

const SupplierAddressInfo = ({ 
  formData, 
  onInputChange, 
  onCEPSearch, 
  onZipCodeChange, 
  onStateChange, 
  cepLoading 
}: SupplierAddressInfoProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Endereço</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="zip_code">CEP</Label>
          <Input
            id="zip_code"
            value={formData.zip_code}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              onZipCodeChange(value);
            }}
            onBlur={(e) => onCEPSearch(e.target.value)}
            placeholder="00000-000"
            maxLength={8}
            disabled={cepLoading}
          />
        </div>
        <div>
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => onInputChange('city', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="state">Estado</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => onStateChange(e.target.value.toUpperCase())}
            maxLength={2}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="address">Endereço</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => onInputChange('address', e.target.value)}
        />
      </div>
    </div>
  );
};

export default SupplierAddressInfo;
