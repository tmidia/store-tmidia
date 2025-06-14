
import { supabase } from '@/integrations/supabase/client';
import type { UserWithPermissions } from '@/types/user';

export const toggleUserStatus = async (user: UserWithPermissions): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: !user.is_active })
    .eq('id', user.id);

  if (error) throw error;
};
