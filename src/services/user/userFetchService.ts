
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

        // Buscar email do usuário via função edge
        let userEmail = '';
        try {
          const { data: emailData, error } = await supabase.functions.invoke('get-user-email', {
            body: { user_id: profile.id }
          });
          
          if (error) {
            console.error('Erro ao buscar email via função:', error);
          } else {
            userEmail = emailData?.email || '';
          }
        } catch (fnError) {
          console.error('Erro ao chamar função get-user-email:', fnError);
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
