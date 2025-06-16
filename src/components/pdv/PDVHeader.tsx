
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Palette } from 'lucide-react';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';

interface PDVHeaderProps {
  caixaAberto: boolean;
  onAbrirCaixa: () => void;
  onFecharCaixa: () => void;
  onToggleTheme: () => void;
}

const PDVHeader = ({ caixaAberto, onAbrirCaixa, onFecharCaixa, onToggleTheme }: PDVHeaderProps) => {
  const { userProfile } = useRoleBasedAccess();
  const isAdmin = userProfile?.user_type === 'superadmin';
  const classicBtnClasses = "group-[.pdv-classic]:bg-slate-300 group-[.pdv-classic]:border-2 group-[.pdv-classic]:border-t-slate-200 group-[.pdv-classic]:border-l-slate-200 group-[.pdv-classic]:border-b-slate-500 group-[.pdv-classic]:border-r-slate-500 group-[.pdv-classic]:text-black group-[.pdv-classic]:shadow-none group-[.pdv-classic]:rounded-none group-[.pdv-classic]:hover:bg-slate-400 group-[.pdv-classic]:active:border-t-slate-500 group-[.pdv-classic]:active:border-l-slate-500 group-[.pdv-classic]:active:border-b-slate-200 group-[.pdv-classic]:active:border-r-slate-200";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full group-[.pdv-classic]:bg-gradient-to-b group-[.pdv-classic]:from-blue-900 group-[.pdv-classic]:to-blue-700 group-[.pdv-classic]:p-2 group-[.pdv-classic]:border-2 group-[.pdv-classic]:border-t-slate-200 group-[.pdv-classic]:border-l-slate-200 group-[.pdv-classic]:border-b-slate-800 group-[.pdv-classic]:border-r-slate-800">
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate group-[.pdv-classic]:text-white">PDV</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base group-[.pdv-classic]:text-slate-300">Ponto de Venda</p>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
        {isAdmin && (
          <Button onClick={onToggleTheme} variant="outline" size="icon" className={`hidden sm:inline-flex ${classicBtnClasses}`} title="Alterar Tema">
            <Palette className="w-5 h-5" />
          </Button>
        )}
        <Badge className={`w-fit ${caixaAberto ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} group-[.pdv-classic]:bg-slate-300 group-[.pdv-classic]:text-black group-[.pdv-classic]:border-none group-[.pdv-classic]:rounded-none`}>
          {caixaAberto ? "Caixa Aberto" : "Caixa Fechado"}
        </Badge>
        {caixaAberto ? (
          <Button 
            variant="outline" 
            onClick={onFecharCaixa} 
            className={`text-red-600 hover:text-red-700 w-full sm:w-auto ${classicBtnClasses}`}
          >
            Fechar Caixa
          </Button>
        ) : (
          <Button 
            onClick={onAbrirCaixa} 
            className={`bg-green-600 hover:bg-green-700 w-full sm:w-auto ${classicBtnClasses} group-[.pdv-classic]:!bg-green-600 group-[.pdv-classic]:!text-white`}
          >
            Abrir Caixa
          </Button>
        )}
      </div>
    </div>
  );
};

export default PDVHeader;
