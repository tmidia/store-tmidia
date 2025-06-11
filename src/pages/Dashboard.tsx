
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts';

const Dashboard = () => {
  // Dados simulados para demonstração
  const salesData = [
    { name: 'Seg', vendas: 4000 },
    { name: 'Ter', vendas: 3000 },
    { name: 'Qua', vendas: 5000 },
    { name: 'Qui', vendas: 2780 },
    { name: 'Sex', vendas: 6890 },
    { name: 'Sáb', vendas: 8390 },
    { name: 'Dom', vendas: 3490 },
  ];

  const lowStockProducts = [
    { name: 'Capa iPhone 14', stock: 3, min: 10 },
    { name: 'Chinelo Havaianas', stock: 5, min: 15 },
    { name: 'Copo Personalizado', stock: 2, min: 8 },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral do seu negócio</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button className="bg-primary hover:bg-blue-dark">
            <Calendar className="w-4 h-4 mr-2" />
            Hoje
          </Button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Vendas do Dia
            </CardTitle>
            <DollarSign className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">R$ 2.450,00</div>
            <p className="text-xs text-green-600 mt-1">
              +15% em relação a ontem
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Produtos Vendidos
            </CardTitle>
            <Package className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">47</div>
            <p className="text-xs text-blue-600 mt-1">
              Última venda: 10min atrás
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Vendas da Semana
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">R$ 12.680,00</div>
            <p className="text-xs text-primary mt-1">
              Meta: R$ 15.000,00
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Produtos em Falta
            </CardTitle>
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">3</div>
            <p className="text-xs text-orange-600 mt-1">
              Requer atenção
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Tabelas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Vendas */}
        <Card className="border-0 shadow-md bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Vendas da Semana
            </CardTitle>
            <CardDescription className="text-gray-600">
              Acompanhe o desempenho diário das vendas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) => `R$ ${value}`}
                  />
                  <Bar 
                    dataKey="vendas" 
                    fill="#1E90FF" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Produtos com Estoque Baixo */}
        <Card className="border-0 shadow-md bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Estoque Baixo
            </CardTitle>
            <CardDescription className="text-gray-600">
              Produtos que precisam de reposição
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600">
                      Estoque atual: {product.stock} unidades
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="destructive" className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                      Baixo
                    </Badge>
                    <Button size="sm" className="bg-primary hover:bg-blue-dark">
                      Repor
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card className="border-0 shadow-md bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Ações Rápidas
          </CardTitle>
          <CardDescription className="text-gray-600">
            Acesse rapidamente as funcionalidades mais utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 bg-primary hover:bg-blue-dark flex flex-col items-center justify-center space-y-2">
              <ShoppingCart className="w-6 h-6" />
              <span className="font-medium">Abrir PDV</span>
            </Button>
            <Button variant="outline" className="h-20 border-gray-200 hover:bg-gray-50 flex flex-col items-center justify-center space-y-2">
              <Package className="w-6 h-6 text-gray-600" />
              <span className="font-medium text-gray-600">Cadastrar Produto</span>
            </Button>
            <Button variant="outline" className="h-20 border-gray-200 hover:bg-gray-50 flex flex-col items-center justify-center space-y-2">
              <BarChart3 className="w-6 h-6 text-gray-600" />
              <span className="font-medium text-gray-600">Ver Relatórios</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
