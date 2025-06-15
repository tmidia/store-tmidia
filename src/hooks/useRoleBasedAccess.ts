
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
    checkUserAccess();
  }, []);

  const checkUserAccess = async () => {
    try {
      console.log('🔍 Verificando acesso do usuário...');
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('❌ Usuário não autenticado');
        setUserProfile(null);
        setIsLoading(false);
        return;
      }

      console.log('✅ Usuário autenticado:', user.email);

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_type, is_active')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('❌ Erro ao buscar perfil:', profileError);
        setUserProfile(null);
        setIsLoading(false);
        return;
      }

      if (!profile || !profile.is_active) {
        console.log('❌ Perfil não encontrado ou inativo');
        setUserProfile(null);
        setIsLoading(false);
        return;
      }

      console.log('👤 Perfil encontrado:', profile);

      // Get user permissions
      const { data: permissions, error: permissionsError } = await supabase
        .from('user_permissions')
        .select('module')
        .eq('user_id', user.id);

      if (permissionsError) {
        console.error('❌ Erro ao buscar permissões:', permissionsError);
        // Continue mesmo com erro nas permissões
      }

      const userProfileData = {
        id: profile.id,
        user_type: profile.user_type,
        is_active: profile.is_active,
        permissions: permissions?.map(p => p.module) || []
      };

      console.log('🎯 Perfil completo carregado:', userProfileData);
      setUserProfile(userProfileData);
    } catch (error) {
      console.error('💥 Erro inesperado ao verificar acesso:', error);
      setUserProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

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
    canAccessPDV,
    checkUserAccess
  };
};
