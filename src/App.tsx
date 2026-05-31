
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { RoleBasedAccessProvider } from "@/context/RoleBasedAccessContext";
import { AppRoutes } from "@/routes/AppRoutes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { isElectron } from "@/lib/platform";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import SetupWizard from "@/pages/SetupWizard";

const queryClient = new QueryClient();

// No app desktop (Electron) o HTML é carregado via file://, onde o BrowserRouter
// não funciona. O HashRouter usa o fragmento (#/rota) e funciona em ambos.
const Router = isElectron() ? HashRouter : BrowserRouter;

const App = () => {
  // Sem credenciais do Supabase (build-time ou salvas) → tela de configuração.
  if (!isSupabaseConfigured) {
    return (
      <ErrorBoundary>
        <SetupWizard />
      </ErrorBoundary>
    );
  }

  return (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <RoleBasedAccessProvider>
            <Router>
              <AppRoutes />
            </Router>
          </RoleBasedAccessProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
  );
};

export default App;
