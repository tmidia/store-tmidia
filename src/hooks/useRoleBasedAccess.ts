
import { useState, useEffect, useRef } from 'react';
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

// Cache global para evitar múltiplas chamadas
let globalUserProfile: UserProfile | null = null;
let globalIsLoading = false;
let globalLoadPromise: Promise<void> | null = null;

export const useRoleBasedAccess = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(globalUserProfile);
  const [isLoading, setIsLoading] = useState(globalIsLoading);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Evitar múltiplas execuções
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;

    // Se já temos dados cached, usar eles
    if (globalUserProfile) {
      setUserProfile(globalUserProfile);
      setIsLoading(false);
      return;
    }

    // Se já está carregando, aguardar a promise existente
    if (globalLoadPromise) {
      globalLoadPromise.then(() => {
        setUserProfile(globalUserProfile);
        setIsLoading(false);
      });
      return;
    }

    // Iniciar novo carregamento
    const loadUserProfile = async () => {
      try {
        globalIsLoading = true;
        setIsLoading(true);

        console.log('🔍 [RoleAccess] Carregando perfil do usuário...');
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log('❌ [RoleAccess] Usuário não autenticado');
          globalUserProfile = null;
          globalIsLoading = false;
          setUserProfile(null);
          setIsLoading(false);
          return;
        }

        console.log('✅ [RoleAccess] Usuário encontrado:', user.email);

        // Buscar perfil
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, user_type, is_active')
          .eq('id', user.id)
          .single();

        if (profileError || !profile?.is_active) {
          console.log('❌ [RoleAccess] Perfil inativo ou erro:', profileError);
          globalUserProfile = null;
          globalIsLoading = false;
          setUserProfile(null);
          setIsLoading(false);
          return;
        }

        // Buscar permissões
        const { data: permissions } = await supabase
          .from('user_permissions')
          .select('module')
          .eq('user_id', user.id);

        const userProfileData = {
          id: profile.id,
          user_type: profile.user_type,
          is_active: profile.is_active,
          permissions: permissions?.map(p => p.module) || []
        };

        console.log('🎯 [RoleAccess] Perfil carregado:', userProfileData);
        
        // Atualizar cache global
        globalUserProfile = userProfileData;
        globalIsLoading = false;
        
        setUserProfile(userProfileData);
        setIsLoading(false);
      } catch (error) {
        console.error('💥 [RoleAccess] Erro ao carregar perfil:', error);
        globalUserProfile = null;
        globalIsLoading = false;
        setUserProfile(null);
        setIsLoading(false);
      } finally {
        globalLoadPromise = null;
      }
    };

    globalLoadPromise = loadUserProfile();
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
