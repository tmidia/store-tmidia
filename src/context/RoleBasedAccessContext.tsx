
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
  hasPermission: (module: ModuleName) => boolean;
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
        const { data: permissions } = await supabase
          .from('user_permissions')
          .select('module')
          .eq('user_id', user.id);

        setUserProfile({
          id: profile.id,
          user_type: profile.user_type,
          is_active: profile.is_active,
          permissions: permissions?.map(p => p.module) || []
        });
        setIsLoading(false);
      } catch {
        setUserProfile(null);
        setIsLoading(false);
      }
    })();
  }, [user]);

  const hasRole = (role: UserType): boolean => userProfile?.user_type === role;
  const hasPermission = (module: ModuleName): boolean =>
    userProfile?.permissions.includes(module) || hasRole('superadmin');
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
