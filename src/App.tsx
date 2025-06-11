
import { useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Produtos from "./pages/Produtos";
import PDV from "./pages/PDV";
import NotFound from "./pages/NotFound";
import UserProfile from "./components/UserProfile";
import ChangePasswordForm from "./components/ChangePasswordForm";
import Estoque from "./pages/Estoque";
import Fornecedores from "./pages/Fornecedores";
import Categorias from "./pages/Categorias";
import UserManagement from "./components/UserManagement";
import CompanySettings from "./components/CompanySettings";
import SystemParameters from "./components/SystemParameters";
import IntegrationsSettings from "./components/IntegrationsSettings";
import LogoutButton from "./components/LogoutButton";

const queryClient = new QueryClient();

// Componente para verificar autenticação
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

// Layout principal com sidebar
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <div className="lg:hidden p-4 border-b border-gray-200 bg-white flex justify-between items-center">
            <SidebarTrigger />
            <LogoutButton />
          </div>
          <div className="hidden lg:flex justify-end p-4 border-b border-gray-200 bg-white">
            <LogoutButton />
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
                <Estoque />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/fornecedores" element={
            <ProtectedRoute>
              <MainLayout>
                <Fornecedores />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/categorias" element={
            <ProtectedRoute>
              <MainLayout>
                <Categorias />
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
                  <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestão de Usuários</h1>
                  <UserManagement />
                </div>
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/configuracoes" element={
            <ProtectedRoute>
              <MainLayout>
                <div className="p-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-6">Configurações</h1>
                  <div className="grid gap-6">
                    <CompanySettings />
                    <SystemParameters />
                    <IntegrationsSettings />
                    <div className="grid gap-6 md:grid-cols-2">
                      <UserProfile />
                      <ChangePasswordForm />
                    </div>
                  </div>
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
