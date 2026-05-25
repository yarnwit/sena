export type UserRole = 'resident' | 'staff' | 'admin';

export interface User {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
  full_name?: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  password: string;
  username: string;
  first_name: string;
  last_name: string;
  house_no?: string;
  phone_number?: string;
  resident_type?: string;
  phase?: string;
  soi?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface ForgotPasswordRequest {
  username: string;
  first_name: string;
  last_name: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
}
