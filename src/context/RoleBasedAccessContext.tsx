import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { useAuthContext } from './AuthContext';

type UserType = Database['public']['Enums']['user_type'];
type ModuleName = Database['public']['Enums']['module_permission'];

interface UserProfile {
  id: string;
  user_type: UserType;
  is_active: boolean;
  permissions: ModuleName[];
}

interface RoleBasedAccessContextProps {
  userProfile: UserProfile | null;
  isLoading: boolean;
  hasRole: (role: UserType) => boolean;
  hasPermission: (module: string) => boolean;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
  canAccessUserManagement: () => boolean;
  canAccessFinancials: () => boolean;
  canAccessProducts: () => boolean;
  canAccessSuppliers: () => boolean;
  canAccessPDV: () => boolean;
}

const RoleBasedAccessContext = createContext<RoleBasedAccessContextProps | undefined>(undefined);

export function RoleBasedAccessProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    (async () => {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, user_type, is_active')
          .eq('id', user.id)
          .single();

        if (profileError || !profile?.is_active) {
          setUserProfile(null);
          setIsLoading(false);
          return;
        }
        const { data: permissions, error: permError } = await supabase
          .from('user_permissions')
          .select('module')
          .eq('user_id', user.id);

        // Fix: enforce correct type for permissions (ModuleName[])
        const loadedPerms = (permissions?.map((p) => p.module).filter(Boolean) ?? []) as ModuleName[];

        console.log('[RoleBasedAccess] Perfil cargado', {
          id: profile.id,
          user_type: profile.user_type,
          is_active: profile.is_active,
          permissions: loadedPerms
        });

        setUserProfile({
          id: profile.id,
          user_type: profile.user_type,
          is_active: profile.is_active,
          permissions: loadedPerms
        });
        setIsLoading(false);
      } catch (err) {
        setUserProfile(null);
        setIsLoading(false);
        console.error('[RoleBasedAccess] Erro carregando perfil:', err);
      }
    })();
  }, [user]);

  const hasRole = (role: UserType): boolean => {
    const result = userProfile?.user_type === role;
    console.log('[RoleBasedAccess] hasRole', { want: role, user_type: userProfile?.user_type, result });
    return result;
  };

  // AJUSTE: permitir string simples e tolerância a tipos
  const hasPermission = (module: string): boolean => {
    if (!userProfile) return false;
    const plainModule = typeof module === 'string' ? module : String(module);
    // usar includes de string para comparar
    const permsArr: string[] = Array.isArray(userProfile.permissions) ? userProfile.permissions : [];
    const has = permsArr.includes(plainModule) || isAdmin(); // Changed from hasRole('superadmin') to isAdmin()
    console.log('[RoleBasedAccess] hasPermission', { module: plainModule, perms: permsArr, user_type: userProfile?.user_type, has, isAdmin: isAdmin() });
    return has;
  };

  const isSuperAdmin = () => hasRole('superadmin');
  const isAdmin = () => hasRole('superadmin') || hasRole('gerente');

  const canAccessUserManagement = () => isSuperAdmin();
  const canAccessFinancials = () => hasPermission('financeiro') || isAdmin();
  const canAccessProducts = () => hasPermission('produtos') || isAdmin();
  const canAccessSuppliers = () => hasPermission('fornecedores') || isAdmin();
  const canAccessPDV = () => hasPermission('pdv') || isAdmin();

  return (
    <RoleBasedAccessContext.Provider value={{
      userProfile, isLoading, hasRole, hasPermission, isSuperAdmin, isAdmin,
      canAccessUserManagement, canAccessFinancials, canAccessProducts, canAccessSuppliers, canAccessPDV
    }}>
      {children}
    </RoleBasedAccessContext.Provider>
  );
}

export function useRoleBasedAccess() {
  const ctx = useContext(RoleBasedAccessContext);
  if (!ctx) throw new Error("useRoleBasedAccess must be used within RoleBasedAccessProvider");
  return ctx;
}
