
import { ReactNode } from 'react';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type UserType = Database['public']['Enums']['user_type'];
type ModuleName = Database['public']['Enums']['module_name'];

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserType;
  requiredPermission?: ModuleName;
  requireSuperAdmin?: boolean;
}

const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  requiredPermission, 
  requireSuperAdmin 
}: ProtectedRouteProps) => {
  const { 
    userProfile, 
    isLoading, 
    hasRole, 
    hasPermission, 
    isSuperAdmin 
  } = useRoleBasedAccess();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-red-500" />
            <CardTitle className="text-red-600">Acesso Negado</CardTitle>
          </div>
          <CardDescription>
            Você precisa estar logado para acessar esta página.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Check for super admin requirement
  if (requireSuperAdmin && !isSuperAdmin()) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <CardTitle className="text-red-600">Acesso Restrito</CardTitle>
          </div>
          <CardDescription>
            Apenas superadministradores podem acessar esta funcionalidade.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Check for specific role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <CardTitle className="text-red-600">Acesso Restrito</CardTitle>
          </div>
          <CardDescription>
            Você não tem o nível de acesso necessário para esta página.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Check for specific permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <CardTitle className="text-red-600">Permissão Insuficiente</CardTitle>
          </div>
          <CardDescription>
            Você não tem permissão para acessar o módulo: {requiredPermission}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
