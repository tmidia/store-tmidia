
import type { Database } from '@/integrations/supabase/types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type UserPermission = Database['public']['Tables']['user_permissions']['Row'];

export interface UserWithPermissions extends Profile {
  email?: string;
  permissions: string[];
}

export interface UserFormData {
  username: string;
  full_name: string;
  email: string;
  password: string;
  cpf: string;
  user_type: Database['public']['Enums']['user_type'];
  permissions: string[];
}
