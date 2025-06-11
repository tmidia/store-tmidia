
import { Card, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';

const EmptyProductState = () => {
  return (
    <Card className="border-0 shadow-md bg-white">
      <CardContent className="p-12 text-center">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum produto encontrado</h3>
        <p className="text-gray-600">Tente ajustar os filtros ou cadastre um novo produto.</p>
      </CardContent>
    </Card>
  );
};

export default EmptyProductState;
