
import type { UserWithPermissions, UserFormData } from '@/types/user';
import { fetchUsers } from './user/userFetchService';
import { createUser } from './user/userCreateService';
import { updateUser } from './user/userUpdateService';
import { toggleUserStatus } from './user/userStatusService';

// Re-export all functions for backward compatibility
export { fetchUsers, createUser, updateUser, toggleUserStatus };
