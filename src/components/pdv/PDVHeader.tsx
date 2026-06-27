import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Palette, ArrowLeft } from 'lucide-react';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { useNavigate } from 'react-router-dom';
import { isElectron } from '@/lib/platform';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface PDVHeaderProps {
  caixaAberto: boolean;
  onAbrirCaixa: (valor: string) => void;
  onFecharCaixa: (valor: string) => void;
  onToggleTheme: () => void;
}

const PDVHeader = ({ caixaAberto, onAbrirCaixa, onFecharCaixa, onToggleTheme }: PDVHeaderProps) => {
  const { userProfile } = useRoleBasedAccess();
  const navigate = useNavigate();
  const isAdmin = userProfile?.user_type === 'superadmin';
  const classicBtnClasses = "group-[.pdv-classic]:bg-slate-300 group-[.pdv-classic]:border-2 group-[.pdv-classic]:border-t-slate-200 group-[.pdv-classic]:border-l-slate-200 group-[.pdv-classic]:border-b-slate-500 group-[.pdv-classic]:border-r-slate-500 group-[.pdv-classic]:text-black group-[.pdv-classic]:shadow-none group-[.pdv-classic]:rounded-none group-[.pdv-classic]:hover:bg-slate-400 group-[.pdv-classic]:active:border-t-slate-500 group-[.pdv-classic]:active:border-l-slate-500 group-[.pdv-classic]:active:border-b-slate-200 group-[.pdv-classic]:active:border-r-slate-200";

  const [isAbrirCaixaModalOpen, setIsAbrirCaixaModalOpen] = useState(false);
  const [isFecharCaixaModalOpen, setIsFecharCaixaModalOpen] = useState(false);
  const [valorDesejado, setValorDesejado] = useState('');

  const handleConfirmAbrir = () => {
    onAbrirCaixa(valorDesejado || '0');
    setIsAbrirCaixaModalOpen(false);
    setValorDesejado('');
  };

  const handleConfirmFechar = () => {
    onFecharCaixa(valorDesejado || '0');
    setIsFecharCaixaModalOpen(false);
    setValorDesejado('');
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full group-[.pdv-classic]:bg-gradient-to-b group-[.pdv-classic]:from-blue-900 group-[.pdv-classic]:to-blue-700 group-[.pdv-classic]:p-2 group-[.pdv-classic]:border-2 group-[.pdv-classic]:border-t-slate-200 group-[.pdv-classic]:border-l-slate-200 group-[.pdv-classic]:border-b-slate-800 group-[.pdv-classic]:border-r-slate-800">
      
      {/* DIALOG DE ABRIR CAIXA */}
      <Dialog open={isAbrirCaixaModalOpen} onOpenChange={setIsAbrirCaixaModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Abrir Caixa</DialogTitle><DialogDescription>Digite o valor do troco inicial que está na gaveta agora.</DialogDescription></DialogHeader>
          <Input type="number" placeholder="0.00" value={valorDesejado} onChange={(e) => setValorDesejado(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAbrirCaixaModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleConfirmAbrir}>Confirmar Abertura</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG DE FECHAR CAIXA */}
      <Dialog open={isFecharCaixaModalOpen} onOpenChange={setIsFecharCaixaModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Fechar Caixa</DialogTitle><DialogDescription>Digite a contagem final de dinheiro físico na gaveta.</DialogDescription></DialogHeader>
          <Input type="number" placeholder="0.00" value={valorDesejado} onChange={(e) => setValorDesejado(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFecharCaixaModalOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleConfirmFechar}>Finalizar Sessão</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* No app desktop o sistema é só o PDV — não há para onde "voltar". */}
        {!isElectron() && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/')}
            className={`shrink-0 ${classicBtnClasses}`}
            title="Voltar ao Dashboard"
            disabled={caixaAberto}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate group-[.pdv-classic]:text-white">PDV</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base group-[.pdv-classic]:text-slate-300">Ponto de Venda</p>
        </div>
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
            onClick={() => { setValorDesejado(''); setIsFecharCaixaModalOpen(true); }} 
            className={`text-red-600 hover:text-red-700 w-full sm:w-auto ${classicBtnClasses}`}
          >
            Fechar Caixa
          </Button>
        ) : (
          <Button 
            onClick={() => { setValorDesejado(''); setIsAbrirCaixaModalOpen(true); }} 
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
