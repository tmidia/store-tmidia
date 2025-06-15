
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  caixaAberto: boolean;
}

const ShortcutPanel = ({ onFinalizeSale, onCancelSale, onSearchProduct, caixaAberto }: ShortcutPanelProps) => {
  const classicCard = "group-[.pdv-classic]:bg-slate-300 group-[.pdv-classic]:border-2 group-[.pdv-classic]:border-t-slate-200 group-[.pdv-classic]:border-l-slate-200 group-[.pdv-classic]:border-b-slate-500 group-[.pdv-classic]:border-r-slate-500 group-[.pdv-classic]:shadow-none group-[.pdv-classic]:rounded-none group-[.pdv-classic]:text-black";
  const classicButton = "group-[.pdv-classic]:bg-slate-300 group-[.pdv-classic]:border-2 group-[.pdv-classic]:border-t-slate-200 group-[.pdv-classic]:border-l-slate-200 group-[.pdv-classic]:border-b-slate-500 group-[.pdv-classic]:border-r-slate-500 group-[.pdv-classic]:text-black group-[.pdv-classic]:shadow-none group-[.pdv-classic]:rounded-none group-[.pdv-classic]:hover:bg-slate-400 group-[.pdv-classic]:active:border-t-slate-500 group-[.pdv-classic]:active:border-l-slate-500 group-[.pdv-classic]:active:border-b-slate-200 group-[.pdv-classic]:active:border-r-slate-200";

  const shortcuts: Shortcut[] = [
    { label: 'Finalizar Pedido', keyLabel: 'F2', action: onFinalizeSale, disabled: !caixaAberto },
    { label: 'Localizar Produto', keyLabel: 'F5', action: onSearchProduct, disabled: !caixaAberto },
    { label: 'Cancelar Pedido', keyLabel: 'F9', action: onCancelSale, disabled: !caixaAberto },
    { label: 'Menu Completo', keyLabel: 'F1', action: () => {}, disabled: true },
    { label: 'Cliente/CPF', keyLabel: 'F4', action: () => {}, disabled: true },
    { label: 'Cancelar Item', keyLabel: 'F6', action: () => {}, disabled: true },
    { label: 'Desconto Item', keyLabel: 'F7', action: () => {}, disabled: true },
    { label: 'Tabela de Preços', keyLabel: 'F8', action: () => {}, disabled: true },
    { label: 'Recuperar Pedido', keyLabel: 'F10', action: () => {}, disabled: true },
  ];

  return (
    <Card className={`border-0 shadow-md bg-white ${classicCard}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Atalhos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {shortcuts.map(shortcut => (
            <Button
              key={shortcut.keyLabel}
              variant="outline"
              onClick={shortcut.action}
              disabled={shortcut.disabled}
              className={`justify-between ${classicButton}`}
            >
              <span>{shortcut.label}</span>
              <kbd className="hidden sm:inline-block px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md group-[.pdv-classic]:bg-slate-200 group-[.pdv-classic]:border-slate-400">
                {shortcut.keyLabel}
              </kbd>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ShortcutPanel;
