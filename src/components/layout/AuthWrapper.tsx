import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    // Preserva o hash (usado para tokens do Supabase) ao redirecionar
    return <Navigate to={`/login${location.search}${location.hash}`} replace />;
  }

  return <>{children}</>;
};
