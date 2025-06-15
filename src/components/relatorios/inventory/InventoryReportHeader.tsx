
import { Button } from '@/components/ui/button';
import { Download, Search } from 'lucide-react';

interface InventoryReportHeaderProps {
  onRefresh: () => void;
  onExport: () => void;
  isDataAvailable: boolean;
}

export const InventoryReportHeader = ({ onRefresh, onExport, isDataAvailable }: InventoryReportHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold">Relatório de Estoque</h2>
        <p className="text-sm text-muted-foreground">Análise completa do inventário</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button onClick={onRefresh} variant="outline" className="flex items-center justify-center gap-2">
          <Search className="w-4 h-4" />
          Atualizar Dados
        </Button>
        <Button
          onClick={onExport}
          variant="outline"
          className="flex items-center justify-center gap-2"
          disabled={!isDataAvailable}
        >
          <Download className="w-4 h-4" />
          Exportar PDF
        </Button>
      </div>
    </div>
  );
};
