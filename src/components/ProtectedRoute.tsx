import { ReactNode } from 'react';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';

type UserType = Database['public']['Enums']['user_type'];
type ModuleName = Database['public']['Enums']['module_permission'];

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
  
  const navigate = useNavigate();

  // Extra: debug na checagem de permissão
  console.log('[ProtectedRoute] isLoading:', isLoading,
    '\nuserProfile:', userProfile,
    '\nrequiredRole:', requiredRole,
    '\nrequiredPermission:', requiredPermission);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!userProfile) {
    console.log('[ProtectedRoute] Sem perfil de usuário');
    return (
      <div className="flex items-center justify-center min-h-96 p-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-red-500" />
              <CardTitle className="text-red-600">Acesso Negado</CardTitle>
            </div>
            <CardDescription>
              Você precisa estar logado para acessar esta página.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full"
              variant="outline"
            >
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check for super admin requirement
  if (requireSuperAdmin && !isSuperAdmin()) {
    console.log('[ProtectedRoute] Requer superadmin');
    return (
      <div className="flex items-center justify-center min-h-96 p-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <CardTitle className="text-red-600">Acesso Restrito</CardTitle>
            </div>
            <CardDescription>
              Apenas superadministradores podem acessar esta funcionalidade.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full"
              variant="outline"
            >
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check for specific role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    console.log('[ProtectedRoute] Papel insuficiente');
    return (
      <div className="flex items-center justify-center min-h-96 p-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <CardTitle className="text-red-600">Acesso Restrito</CardTitle>
            </div>
            <CardDescription>
              Você não tem o nível de acesso necessário para esta página.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full"
              variant="outline"
            >
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check for specific permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    console.log('[ProtectedRoute] Permissão insuficiente:', requiredPermission, 'User perms:', userProfile.permissions);
    return (
      <div className="flex items-center justify-center min-h-96 p-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <CardTitle className="text-red-600">Permissão Insuficiente</CardTitle>
            </div>
            <CardDescription>
              Você não tem permissão para acessar o módulo: {requiredPermission}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full"
              variant="outline"
            >
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('[ProtectedRoute] Acesso liberado!');
  return <>{children}</>;
};

export default ProtectedRoute;
