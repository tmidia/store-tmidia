
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart as ShoppingCartIcon, User, Plus, Minus, Trash2 } from 'lucide-react';

interface CartItem {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
}

interface ShoppingCartProps {
  carrinho: CartItem[];
  clienteNome: string;
  onClienteNomeChange: (value: string) => void;
  onRemoverDoCarrinho: (id: string) => void;
  onAlterarQuantidade: (id: string, quantidade: number) => void;
  caixaAberto: boolean;
}

const ShoppingCart = ({ 
  carrinho, 
  clienteNome, 
  onClienteNomeChange, 
  onRemoverDoCarrinho, 
  onAlterarQuantidade, 
  caixaAberto 
}: ShoppingCartProps) => {
  return (
    <>
      {/* Informações do Cliente */}
      <Card className="border-0 shadow-md bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center">
            <User className="w-5 h-5 mr-2" />
            Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Nome do cliente (opcional)"
            value={clienteNome}
            onChange={(e) => onClienteNomeChange(e.target.value)}
            disabled={!caixaAberto}
          />
        </CardContent>
      </Card>

      {/* Carrinho */}
      <Card className="border-0 shadow-md bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center">
            <ShoppingCartIcon className="w-5 h-5 mr-2" />
            Carrinho ({carrinho.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {carrinho.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Carrinho vazio</p>
            ) : (
              carrinho.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 text-sm">{item.nome}</h5>
                    <p className="text-primary font-semibold">R$ {item.preco.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAlterarQuantidade(item.id, item.quantidade - 1)}
                      className="h-8 w-8 p-0"
                      disabled={!caixaAberto}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="font-medium min-w-[20px] text-center">{item.quantidade}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAlterarQuantidade(item.id, item.quantidade + 1)}
                      className="h-8 w-8 p-0"
                      disabled={!caixaAberto}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRemoverDoCarrinho(item.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      disabled={!caixaAberto}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ShoppingCart;
