
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Search, Eye } from 'lucide-react';

interface ProductSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  modoConsulta: boolean;
  onModoConsultaChange: (value: boolean) => void;
  caixaAberto: boolean;
}

const ProductSearch = ({ 
  searchTerm, 
  onSearchChange, 
  modoConsulta, 
  onModoConsultaChange, 
  caixaAberto 
}: ProductSearchProps) => {
  return (
    <Card className="border-0 shadow-md bg-white">
      <CardContent className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant={!modoConsulta ? "default" : "outline"}
            onClick={() => onModoConsultaChange(false)}
            className="flex items-center gap-2"
            disabled={!caixaAberto}
          >
            <ShoppingCart className="w-4 h-4" />
            Modo Venda
          </Button>
          <Button
            variant={modoConsulta ? "default" : "outline"}
            onClick={() => onModoConsultaChange(true)}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Consultar Produtos
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder={modoConsulta ? "Consultar produto por nome ou código..." : "Buscar produto por nome ou código..."}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-12 text-lg"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductSearch;
