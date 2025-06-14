
import { supabase } from '@/integrations/supabase/client';
import type { UserWithPermissions } from '@/types/user';

export const fetchUsers = async (): Promise<UserWithPermissions[]> => {
  // Buscar perfis dos usuários
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (profiles) {
    const usersWithPermissions = await Promise.all(
      profiles.map(async (profile) => {
        // Buscar permissões do usuário
        const { data: permissions } = await supabase
          .from('user_permissions')
          .select('module')
          .eq('user_id', profile.id);

        // Buscar email do usuário na tabela auth.users através da API admin
        let userEmail = '';
        try {
          const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
          userEmail = userData.user?.email || '';
        } catch (error) {
          console.error('Erro ao buscar email do usuário:', error);
          // Se não conseguir buscar via admin, tentar via função
          try {
            const { data: emailData } = await supabase.functions.invoke('get-user-email', {
              body: { user_id: profile.id }
            });
            userEmail = emailData?.email || '';
          } catch (fnError) {
            console.error('Erro ao buscar email via função:', fnError);
          }
        }
        
        return {
          ...profile,
          email: userEmail,
          permissions: permissions?.map(p => p.module) || []
        };
      })
    );
    return usersWithPermissions;
  }

  return [];
};
