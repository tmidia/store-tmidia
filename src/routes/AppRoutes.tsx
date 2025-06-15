
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthWrapper } from "@/components/layout/AuthWrapper";
import { MainLayout } from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Produtos from "@/pages/Produtos";
import PDV from "@/pages/PDV";
import NotFound from "@/pages/NotFound";
import Estoque from "@/pages/Estoque";
import Fornecedores from "@/pages/Fornecedores";
import Categorias from "@/pages/Categorias";
import Financeiro from "@/pages/Financeiro";
import Despesas from "@/pages/Despesas";
import Relatorios from "@/pages/Relatorios";
import { ConfiguracoesPage } from "@/components/pages/ConfiguracoesPage";
import { UsuariosPage } from "@/components/pages/UsuariosPage";

export const AppRoutes = () => {
  return (
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
              <Despesas />
            </MainLayout>
          </ProtectedRoute>
        </AuthWrapper>
      } />
      <Route path="/relatorios" element={
        <AuthWrapper>
          <ProtectedRoute requiredPermission="relatorios">
            <MainLayout>
              <Relatorios />
            </MainLayout>
          </ProtectedRoute>
        </AuthWrapper>
      } />
      <Route path="/usuarios" element={
        <AuthWrapper>
          <ProtectedRoute requireSuperAdmin>
            <MainLayout>
              <UsuariosPage />
            </MainLayout>
          </ProtectedRoute>
        </AuthWrapper>
      } />
      <Route path="/configuracoes" element={
        <AuthWrapper>
          <ProtectedRoute requiredPermission="configuracoes">
            <MainLayout>
              <ConfiguracoesPage />
            </MainLayout>
          </ProtectedRoute>
        </AuthWrapper>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
