
import { Card, CardContent } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

const EmptySupplierState = () => {
  return (
    <Card className="border-0 shadow-md bg-white col-span-full">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Building2 className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum fornecedor encontrado
        </h3>
        <p className="text-gray-600 text-center max-w-md">
          Não há fornecedores cadastrados que correspondam aos filtros aplicados. 
          Tente ajustar os filtros ou cadastrar um novo fornecedor.
        </p>
      </CardContent>
    </Card>
  );
};

export default EmptySupplierState;
