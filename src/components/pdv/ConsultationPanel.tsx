
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, AlertTriangle } from 'lucide-react';

const ConsultationPanel = () => {
  return (
    <Card className="border-0 shadow-md bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Eye className="w-5 h-5 mr-2" />
          Modo Consulta
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm text-gray-600">
          <p>• Consulte produtos por nome ou código</p>
          <p>• Visualize preços e estoque em tempo real</p>
          <p>• Informações detalhadas disponíveis</p>
          <p>• Funciona mesmo com caixa fechado</p>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 text-blue-700">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">
              Modo somente leitura - Vendas desabilitadas
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsultationPanel;
