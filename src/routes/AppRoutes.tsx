
import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthWrapper } from "@/components/layout/AuthWrapper";
import { MainLayout } from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { isElectron } from "@/lib/platform";

// Páginas carregadas sob demanda (code-splitting) para reduzir o bundle inicial.
const Login = lazy(() => import("@/pages/Login"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Produtos = lazy(() => import("@/pages/Produtos"));
const PDV = lazy(() => import("@/pages/PDV"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Estoque = lazy(() => import("@/pages/Estoque"));
const Fornecedores = lazy(() => import("@/pages/Fornecedores"));
const Categorias = lazy(() => import("@/pages/Categorias"));
const Financeiro = lazy(() => import("@/pages/Financeiro"));
const Despesas = lazy(() => import("@/pages/Despesas"));
const Relatorios = lazy(() => import("@/pages/Relatorios"));
const ConfiguracoesPage = lazy(() =>
  import("@/components/pages/ConfiguracoesPage").then((m) => ({ default: m.ConfiguracoesPage }))
);
const UsuariosPage = lazy(() =>
  import("@/components/pages/UsuariosPage").then((m) => ({ default: m.UsuariosPage }))
);

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div
      className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"
      role="status"
      aria-label="Carregando"
    />
  </div>
);

// No app desktop (caixa), o sistema é exclusivamente o PDV. Todas as demais
// telas (dashboard, cadastros, financeiro, relatórios, etc.) ficam apenas na
// versão web. Qualquer rota fora do PDV é redirecionada de volta ao PDV.
const ElectronRoutes = () => (
  <Suspense fallback={<RouteFallback />}>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/pdv" element={
        <AuthWrapper>
          <ProtectedRoute requiredPermission="pdv">
            <MainLayout>
              <PDV />
            </MainLayout>
          </ProtectedRoute>
        </AuthWrapper>
      } />
      <Route path="*" element={<Navigate to="/pdv" replace />} />
    </Routes>
  </Suspense>
);

export const AppRoutes = () => {
  if (isElectron()) {
    return <ElectronRoutes />;
  }

  return (
    <Suspense fallback={<RouteFallback />}>
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
          <ProtectedRoute requireSuperAdmin>
            <MainLayout>
              <ConfiguracoesPage />
            </MainLayout>
          </ProtectedRoute>
        </AuthWrapper>
      } />
      <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};
