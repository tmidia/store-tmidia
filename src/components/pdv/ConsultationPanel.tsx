
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, AlertTriangle } from 'lucide-react';

const ConsultationPanel = () => {
  return (
    <Card className="border-0 shadow-md bg-white w-full max-w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg font-semibold flex items-center">
          <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
          <span className="truncate">Modo Consulta</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-xs sm:text-sm text-gray-600">
          <p>• Consulte produtos por nome ou código</p>
          <p>• Visualize preços e estoque em tempo real</p>
          <p>• Informações detalhadas disponíveis</p>
          <p>• Funciona mesmo com caixa fechado</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2 text-blue-700">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="text-xs sm:text-sm font-medium leading-tight">
              Modo somente leitura - Vendas desabilitadas
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsultationPanel;
