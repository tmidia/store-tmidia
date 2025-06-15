
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, AlertTriangle } from 'lucide-react';

const ConsultationPanel = () => {
  const classicCard = "group-[.pdv-classic]:bg-slate-300 group-[.pdv-classic]:border-2 group-[.pdv-classic]:border-t-slate-200 group-[.pdv-classic]:border-l-slate-200 group-[.pdv-classic]:border-b-slate-500 group-[.pdv-classic]:border-r-slate-500 group-[.pdv-classic]:shadow-none group-[.pdv-classic]:rounded-none group-[.pdv-classic]:text-black";
  
  return (
    <Card className={`border-0 shadow-md bg-white w-full max-w-full ${classicCard}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg font-semibold flex items-center">
          <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
          <span className="truncate">Modo Consulta</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-xs sm:text-sm text-gray-600 group-[.pdv-classic]:text-black">
          <p>• Consulte produtos por nome ou código</p>
          <p>• Visualize preços e estoque em tempo real</p>
          <p>• Informações detalhadas disponíveis</p>
          <p>• Funciona mesmo com caixa fechado</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg group-[.pdv-classic]:bg-blue-200 group-[.pdv-classic]:border group-[.pdv-classic]:border-blue-400">
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
