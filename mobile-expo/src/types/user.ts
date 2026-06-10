/**
 * SENA Mobile App — User Types
 *
 * Types for user management (admin features)
 */

import type { UserRole } from './auth';

/** User object for admin management */
export interface ManagedUser {
  user_id: string;
  username: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

/** Payload for updating a user (admin) */
export interface UserUpdatePayload {
  role?: UserRole;
  is_active?: boolean;
}

/** Profile update payload */
export interface ProfileUpdatePayload {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}
