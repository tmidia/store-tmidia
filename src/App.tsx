
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Produtos from "./pages/Produtos";
import PDV from "./pages/PDV";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Componente para verificar autenticação
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Layout principal com sidebar
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <div className="lg:hidden p-4 border-b border-gray-200 bg-white">
            <SidebarTrigger />
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/produtos" element={
            <ProtectedRoute>
              <MainLayout>
                <Produtos />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/pdv" element={
            <ProtectedRoute>
              <MainLayout>
                <PDV />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/estoque" element={
            <ProtectedRoute>
              <MainLayout>
                <div className="p-6">
                  <h1 className="text-3xl font-bold text-gray-900">Estoque</h1>
                  <p className="text-gray-600 mt-1">Em desenvolvimento...</p>
                </div>
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/financeiro" element={
            <ProtectedRoute>
              <MainLayout>
                <div className="p-6">
                  <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
                  <p className="text-gray-600 mt-1">Em desenvolvimento...</p>
                </div>
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/despesas" element={
            <ProtectedRoute>
              <MainLayout>
                <div className="p-6">
                  <h1 className="text-3xl font-bold text-gray-900">Despesas</h1>
                  <p className="text-gray-600 mt-1">Em desenvolvimento...</p>
                </div>
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/relatorios" element={
            <ProtectedRoute>
              <MainLayout>
                <div className="p-6">
                  <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
                  <p className="text-gray-600 mt-1">Em desenvolvimento...</p>
                </div>
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/usuarios" element={
            <ProtectedRoute>
              <MainLayout>
                <div className="p-6">
                  <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
                  <p className="text-gray-600 mt-1">Em desenvolvimento...</p>
                </div>
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/configuracoes" element={
            <ProtectedRoute>
              <MainLayout>
                <div className="p-6">
                  <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
                  <p className="text-gray-600 mt-1">Em desenvolvimento...</p>
                </div>
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
