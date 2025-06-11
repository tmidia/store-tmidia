
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PDVHeaderProps {
  caixaAberto: boolean;
  onAbrirCaixa: () => void;
  onFecharCaixa: () => void;
}

const PDVHeader = ({ caixaAberto, onAbrirCaixa, onFecharCaixa }: PDVHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">PDV</h1>
        <p className="text-gray-600 mt-1">Ponto de Venda</p>
      </div>
      <div className="flex items-center gap-4">
        <Badge className={caixaAberto ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
          {caixaAberto ? "Caixa Aberto" : "Caixa Fechado"}
        </Badge>
        {caixaAberto ? (
          <Button variant="outline" onClick={onFecharCaixa} className="text-red-600 hover:text-red-700">
            Fechar Caixa
          </Button>
        ) : (
          <Button onClick={onAbrirCaixa} className="bg-green-600 hover:bg-green-700">
            Abrir Caixa
          </Button>
        )}
      </div>
    </div>
  );
};

export default PDVHeader;
