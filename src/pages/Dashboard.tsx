
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, 
  AlertTriangle, 
  BarChart3,
  Users,
  ShoppingCart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Cache global para as estatísticas
let globalStats: any = null;
let statsLoadPromise: Promise<void> | null = null;

const Dashboard = () => {
  const [stats, setStats] = useState(globalStats || {
    totalProducts: 0,
    lowStockProducts: 0,
    totalCategories: 0,
    totalSuppliers: 0
  });
  const [loading, setLoading] = useState(!globalStats);
  const hasLoadedStats = useRef(false);

  useEffect(() => {
    // Evitar múltiplas execuções
    if (hasLoadedStats.current) return;
    hasLoadedStats.current = true;

    // Se já temos dados cached, usar eles
    if (globalStats) {
      setStats(globalStats);
      setLoading(false);
      return;
    }

    // Se já está carregando, aguardar a promise existente
    if (statsLoadPromise) {
      statsLoadPromise.then(() => {
        setStats(globalStats);
        setLoading(false);
      });
      return;
    }

    const fetchStats = async () => {
      try {
        console.log('📊 [Dashboard] Carregando estatísticas...');
        
        const [
          { count: productsCount },
          { data: lowStockData },
          { count: categoriesCount },
          { count: suppliersCount }
        ] = await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('stock_quantity, minimum_stock').lte('stock_quantity', 'minimum_stock'),
          supabase.from('categories').select('*', { count: 'exact', head: true }),
          supabase.from('suppliers').select('*', { count: 'exact', head: true })
        ]);

        const newStats = {
          totalProducts: productsCount || 0,
          lowStockProducts: lowStockData?.length || 0,
          totalCategories: categoriesCount || 0,
          totalSuppliers: suppliersCount || 0
        };
        
        console.log('✅ [Dashboard] Estatísticas carregadas:', newStats);
        
        // Atualizar cache global
        globalStats = newStats;
        setStats(newStats);
        setLoading(false);
      } catch (error) {
        console.error('💥 [Dashboard] Erro ao buscar estatísticas:', error);
        setLoading(false);
      } finally {
        statsLoadPromise = null;
      }
    };

    statsLoadPromise = fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Visão geral do seu negócio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Produtos
            </CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalProducts}</div>
            <p className="text-xs text-gray-600 mt-1">
              Produtos cadastrados no sistema
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Estoque Baixo
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.lowStockProducts}</div>
            <p className="text-xs text-gray-600 mt-1">
              Produtos com estoque baixo
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Categorias
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalCategories}</div>
            <p className="text-xs text-gray-600 mt-1">
              Categorias cadastradas
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Fornecedores
            </CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalSuppliers}</div>
            <p className="text-xs text-gray-600 mt-1">
              Fornecedores cadastrados
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-md bg-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2 text-blue-600" />
              Gestão de Produtos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm mb-4">
              Gerencie seu catálogo de produtos, preços e estoque.
            </p>
            <Link 
              to="/produtos" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Acessar Produtos →
            </Link>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2 text-green-600" />
              Controle de Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm mb-4">
              Monitore os níveis de estoque e movimentações.
            </p>
            <Link 
              to="/estoque" 
              className="inline-flex items-center text-green-600 hover:text-green-700 text-sm font-medium"
            >
              Acessar Estoque →
            </Link>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-purple-600" />
              Fornecedores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm mb-4">
              Cadastre e gerencie seus fornecedores.
            </p>
            <Link 
              to="/fornecedores" 
              className="inline-flex items-center text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              Acessar Fornecedores →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
