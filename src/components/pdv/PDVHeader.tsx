
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PDVHeaderProps {
  caixaAberto: boolean;
  onAbrirCaixa: () => void;
  onFecharCaixa: () => void;
}

const PDVHeader = ({ caixaAberto, onAbrirCaixa, onFecharCaixa }: PDVHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">PDV</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Ponto de Venda</p>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
        <Badge className={`w-fit ${caixaAberto ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {caixaAberto ? "Caixa Aberto" : "Caixa Fechado"}
        </Badge>
        {caixaAberto ? (
          <Button 
            variant="outline" 
            onClick={onFecharCaixa} 
            className="text-red-600 hover:text-red-700 w-full sm:w-auto"
          >
            Fechar Caixa
          </Button>
        ) : (
          <Button 
            onClick={onAbrirCaixa} 
            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
          >
            Abrir Caixa
          </Button>
        )}
      </div>
    </div>
  );
};

export default PDVHeader;
