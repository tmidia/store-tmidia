
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SupplierContactInfoProps {
  formData: {
    email: string;
    phone: string;
    contact_person: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const SupplierContactInfo = ({ formData, onInputChange }: SupplierContactInfoProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onInputChange('email', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => onInputChange('phone', e.target.value)}
            placeholder="(00) 00000-0000"
            maxLength={15}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="contact_person">Pessoa de Contato</Label>
        <Input
          id="contact_person"
          value={formData.contact_person}
          onChange={(e) => onInputChange('contact_person', e.target.value)}
        />
      </div>
    </>
  );
};

export default SupplierContactInfo;
