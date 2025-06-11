
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';

interface SupplierFiltersProps {
  searchTerm: string;
  selectedSupplierType: string;
  onSearchChange: (value: string) => void;
  onSupplierTypeChange: (value: string) => void;
}

const SupplierFilters = ({ 
  searchTerm, 
  selectedSupplierType, 
  onSearchChange, 
  onSupplierTypeChange 
}: SupplierFiltersProps) => {
  return (
    <Card className="border-0 shadow-md bg-white">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nome, empresa, CNPJ ou CPF..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full lg:w-48">
            <Select value={selectedSupplierType} onValueChange={onSupplierTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="fornecedor">Fornecedor</SelectItem>
                <SelectItem value="prestador">Prestador</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupplierFilters;
