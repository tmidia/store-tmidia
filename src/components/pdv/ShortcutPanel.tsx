import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Keyboard } from 'lucide-react';

interface Shortcut {
  label: string;
  keyLabel: string;
  action: () => void;
  disabled?: boolean;
}

interface ShortcutPanelProps {
  onFinalizeSale: () => void;
  onCancelSale: () => void;
  onSearchProduct: () => void;
  onToggleFullscreen?: () => void;
  caixaAberto: boolean;
}

const ShortcutPanel = ({ onFinalizeSale, onCancelSale, onSearchProduct, onToggleFullscreen, caixaAberto }: ShortcutPanelProps) => {
  const classicCard = "group-[.pdv-classic]:bg-slate-300 group-[.pdv-classic]:border-2 group-[.pdv-classic]:border-t-slate-200 group-[.pdv-classic]:border-l-slate-200 group-[.pdv-classic]:border-b-slate-500 group-[.pdv-classic]:border-r-slate-500 group-[.pdv-classic]:shadow-none group-[.pdv-classic]:rounded-none group-[.pdv-classic]:text-black";
  const classicButton = "group-[.pdv-classic]:bg-slate-300 group-[.pdv-classic]:border-2 group-[.pdv-classic]:border-t-slate-200 group-[.pdv-classic]:border-l-slate-200 group-[.pdv-classic]:border-b-slate-500 group-[.pdv-classic]:border-r-slate-500 group-[.pdv-classic]:text-black group-[.pdv-classic]:shadow-none group-[.pdv-classic]:rounded-none group-[.pdv-classic]:hover:bg-slate-400 group-[.pdv-classic]:active:border-t-slate-500 group-[.pdv-classic]:active:border-l-slate-500 group-[.pdv-classic]:active:border-b-slate-200 group-[.pdv-classic]:active:border-r-slate-200";

  const shortcuts: Shortcut[] = [
    { label: 'Localizar Produto', keyLabel: 'F5', action: onSearchProduct, disabled: !caixaAberto },
    { label: 'Finalizar Pagamento', keyLabel: 'F2', action: onFinalizeSale, disabled: !caixaAberto },
    { label: 'Cancelar Venda', keyLabel: 'F9', action: onCancelSale, disabled: !caixaAberto },
    ...(onToggleFullscreen ? [{ label: 'Tela Cheia', keyLabel: 'F12', action: onToggleFullscreen, disabled: false }] : []),
  ];

  return (
    <Card className={`border border-gray-100 shadow-sm bg-white rounded-2xl overflow-hidden ${classicCard}`}>
      <CardHeader className="bg-slate-50 pb-3 pt-4 px-5 border-b border-gray-100 group-[.pdv-classic]:bg-slate-300 group-[.pdv-classic]:border-b-slate-500">
        <CardTitle className="text-sm font-semibold flex items-center text-slate-600">
          <Keyboard className="w-4 h-4 mr-2" />
          Atalhos de Teclado
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {shortcuts.map(shortcut => (
            <Button
              key={shortcut.keyLabel}
              variant="outline"
              onClick={shortcut.action}
              disabled={shortcut.disabled}
              className={`flex-col items-center justify-center p-3 h-auto min-h-[5rem] gap-2 rounded-xl border-gray-200 shadow-sm hover:border-blue-300 hover:bg-blue-50 transition-all ${classicButton} group-[.pdv-classic]:flex-row group-[.pdv-classic]:min-h-[3rem] group-[.pdv-classic]:justify-between`}
            >
              <kbd className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-white shadow-sm border border-slate-200 rounded-md group-[.pdv-classic]:bg-slate-200 group-[.pdv-classic]:border-slate-400 group-[.pdv-classic]:shadow-none">
                {shortcut.keyLabel}
              </kbd>
              <span className="text-xs text-center text-slate-600 font-medium whitespace-normal leading-tight group-[.pdv-classic]:text-left leading-[1.1]">
                {shortcut.label}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ShortcutPanel;
