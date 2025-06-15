
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { isLoading } = useAuth();

  console.log('🏠 [Index] Renderizando, isLoading:', isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Renderizar o Dashboard diretamente, sem redirecionamento
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Visão geral do seu negócio</p>
      </div>
      
      <div className="text-center py-20">
        <p className="text-lg text-gray-600">Dashboard será carregado aqui...</p>
      </div>
    </div>
  );
};

export default Index;
