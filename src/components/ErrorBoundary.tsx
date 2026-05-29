import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Captura erros de renderização em qualquer ponto da árvore React e exibe
 * uma tela de fallback amigável em vez de uma página em branco.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Em produção isto pode ser enviado a um serviço de monitoramento (Sentry, etc.)
    console.error("ErrorBoundary capturou um erro:", error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md text-center space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
            Algo deu errado
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ocorreu um erro inesperado ao carregar esta tela. Tente recarregar a
            página. Se o problema persistir, entre em contato com o suporte.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <pre className="overflow-auto rounded-lg bg-slate-100 dark:bg-slate-800 p-3 text-left text-xs text-red-600 dark:text-red-400">
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={this.handleReload}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Recarregar página
          </button>
        </div>
      </div>
    );
  }
}
