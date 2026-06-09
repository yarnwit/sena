/**
 * SENA Mobile App — Auth Types
 *
 * Types for authentication-related data
 */

/** User roles in the system */
export type UserRole = 'resident' | 'staff' | 'admin';

/** User object returned from API */
export interface User {
  user_id: string;
  username: string;
  first_name: string;
  last_name: string;
  role: UserRole;
}

/** Extended user with resident info */
export interface ResidentUser extends User {
  role: 'resident';
  resident_id: number;
  house_no: string;
  phone_number: string;
  resident_type: string;
  phase: string;
  soi: string;
}

/** Login request payload */
export interface LoginPayload {
  username: string;
  password: string;
}

/** Register request payload (resident only) */
export interface RegisterPayload {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  house_no: string;
  phone_number: string;
  resident_type: string;
  phase: string;
  soi: string;
}

/** Auth API response */
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

/** Auth context state */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
