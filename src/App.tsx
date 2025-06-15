
import { useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider } from "@/context/AuthContext";
import { RoleBasedAccessProvider } from "@/context/RoleBasedAccessContext";
import { useAuth } from "@/hooks/useAuth";
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
import Financeiro from "./pages/Financeiro";
import UserManagement from "./components/UserManagement";
import CompanySettings from "./components/CompanySettings";
import SystemParameters from "./components/SystemParameters";
import IntegrationsSettings from "./components/IntegrationsSettings";
import LogoutButton from "./components/LogoutButton";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

const MainLayout = ({ children }: { children: React.ReactNode }) => (
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <RoleBasedAccessProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <AuthWrapper>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </AuthWrapper>
              } />
              <Route path="/dashboard" element={
                <AuthWrapper>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </AuthWrapper>
              } />
              <Route path="/produtos" element={
                <AuthWrapper>
                  <ProtectedRoute requiredPermission="produtos">
                    <MainLayout>
                      <Produtos />
                    </MainLayout>
                  </ProtectedRoute>
                </AuthWrapper>
              } />
              <Route path="/pdv" element={
                <AuthWrapper>
                  <ProtectedRoute requiredPermission="pdv">
                    <MainLayout>
                      <PDV />
                    </MainLayout>
                  </ProtectedRoute>
                </AuthWrapper>
              } />
              <Route path="/estoque" element={
                <AuthWrapper>
                  <ProtectedRoute requiredPermission="estoque">
                    <MainLayout>
                      <Estoque />
                    </MainLayout>
                  </ProtectedRoute>
                </AuthWrapper>
              } />
              <Route path="/fornecedores" element={
                <AuthWrapper>
                  <ProtectedRoute requiredPermission="fornecedores">
                    <MainLayout>
                      <Fornecedores />
                    </MainLayout>
                  </ProtectedRoute>
                </AuthWrapper>
              } />
              <Route path="/categorias" element={
                <AuthWrapper>
                  <ProtectedRoute requiredPermission="produtos">
                    <MainLayout>
                      <Categorias />
                    </MainLayout>
                  </ProtectedRoute>
                </AuthWrapper>
              } />
              <Route path="/financeiro" element={
                <AuthWrapper>
                  <ProtectedRoute requiredPermission="financeiro">
                    <MainLayout>
                      <Financeiro />
                    </MainLayout>
                  </ProtectedRoute>
                </AuthWrapper>
              } />
              <Route path="/despesas" element={
                <AuthWrapper>
                  <ProtectedRoute requiredPermission="financeiro">
                    <MainLayout>
                      <div className="p-6">
                        <h1 className="text-3xl font-bold text-gray-900">Despesas</h1>
                        <p className="text-gray-600 mt-1">Em desenvolvimento...</p>
                      </div>
                    </MainLayout>
                  </ProtectedRoute>
                </AuthWrapper>
              } />
              <Route path="/relatorios" element={
                <AuthWrapper>
                  <ProtectedRoute requiredPermission="relatorios">
                    <MainLayout>
                      <div className="p-6">
                        <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
                        <p className="text-gray-600 mt-1">Em desenvolvimento...</p>
                      </div>
                    </MainLayout>
                  </ProtectedRoute>
                </AuthWrapper>
              } />
              <Route path="/usuarios" element={
                <AuthWrapper>
                  <ProtectedRoute requireSuperAdmin>
                    <MainLayout>
                      <div className="p-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestão de Usuários</h1>
                        <UserManagement />
                      </div>
                    </MainLayout>
                  </ProtectedRoute>
                </AuthWrapper>
              } />
              <Route path="/configuracoes" element={
                <AuthWrapper>
                  <ProtectedRoute requiredPermission="configuracoes">
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
                </AuthWrapper>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </RoleBasedAccessProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
