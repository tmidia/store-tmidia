
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type UserType = Database['public']['Enums']['user_type'];
type ModuleName = Database['public']['Enums']['module_permission'];

interface UserProfile {
  id: string;
  user_type: UserType;
  is_active: boolean;
  permissions: ModuleName[];
}

export const useRoleBasedAccess = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeUser = async () => {
      try {
        console.log('🔍 Iniciando verificação única de usuário...');
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!mounted) return;
        
        if (!user) {
          console.log('❌ Usuário não autenticado');
          setUserProfile(null);
          setIsLoading(false);
          return;
        }

        console.log('✅ Usuário encontrado:', user.email);

        // Buscar perfil do usuário
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, user_type, is_active')
          .eq('id', user.id)
          .single();

        if (!mounted) return;

        if (!profile?.is_active) {
          console.log('❌ Perfil inativo');
          setUserProfile(null);
          setIsLoading(false);
          return;
        }

        // Buscar permissões
        const { data: permissions } = await supabase
          .from('user_permissions')
          .select('module')
          .eq('user_id', user.id);

        if (!mounted) return;

        const userProfileData = {
          id: profile.id,
          user_type: profile.user_type,
          is_active: profile.is_active,
          permissions: permissions?.map(p => p.module) || []
        };

        console.log('🎯 Perfil carregado com sucesso:', userProfileData);
        setUserProfile(userProfileData);
        setIsLoading(false);
      } catch (error) {
        console.error('💥 Erro ao carregar perfil:', error);
        if (mounted) {
          setUserProfile(null);
          setIsLoading(false);
        }
      }
    };

    initializeUser();

    return () => {
      mounted = false;
    };
  }, []);

  const hasRole = (role: UserType): boolean => {
    return userProfile?.user_type === role;
  };

  const hasPermission = (module: ModuleName): boolean => {
    return userProfile?.permissions.includes(module) || hasRole('superadmin');
  };

  const isSuperAdmin = (): boolean => {
    return hasRole('superadmin');
  };

  const isAdmin = (): boolean => {
    return hasRole('superadmin') || hasRole('gerente');
  };

  const canAccessUserManagement = (): boolean => {
    return isSuperAdmin();
  };

  const canAccessFinancials = (): boolean => {
    return hasPermission('financeiro') || isAdmin();
  };

  const canAccessProducts = (): boolean => {
    return hasPermission('produtos') || isAdmin();
  };

  const canAccessSuppliers = (): boolean => {
    return hasPermission('fornecedores') || isAdmin();
  };

  const canAccessPDV = (): boolean => {
    return hasPermission('pdv') || isAdmin();
  };

  return {
    userProfile,
    isLoading,
    hasRole,
    hasPermission,
    isSuperAdmin,
    isAdmin,
    canAccessUserManagement,
    canAccessFinancials,
    canAccessProducts,
    canAccessSuppliers,
    canAccessPDV
  };
};
