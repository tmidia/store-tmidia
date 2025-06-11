
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Phone, Mail, Edit, Trash2 } from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  cnpj?: string | null;
  cpf?: string | null;
  contact_person?: string | null;
  supplier_type?: string | null;
  company_name?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface SupplierCardProps {
  supplier: Supplier;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
}

const SupplierCard = ({ supplier, onEdit, onDelete }: SupplierCardProps) => {
  return (
    <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {supplier.name}
            </CardTitle>
            {supplier.company_name && (
              <p className="text-sm text-gray-600 mt-1">{supplier.company_name}</p>
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            {supplier.supplier_type === 'prestador' ? 'Prestador' : 'Fornecedor'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {supplier.email && (
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">{supplier.email}</span>
            </div>
          )}
          {supplier.phone && (
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">{supplier.phone}</span>
            </div>
          )}
          {(supplier.city || supplier.state) && (
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-600">
                {supplier.city}{supplier.city && supplier.state && ', '}{supplier.state}
              </span>
            </div>
          )}
        </div>

        <div className="pt-2">
          <div className="text-xs text-gray-500">
            {supplier.cnpj && <span>CNPJ: {supplier.cnpj}</span>}
            {supplier.cpf && <span>CPF: {supplier.cpf}</span>}
          </div>
        </div>

        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onEdit(supplier)}
          >
            <Edit className="w-4 h-4 mr-1" />
            Editar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(supplier.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupplierCard;
