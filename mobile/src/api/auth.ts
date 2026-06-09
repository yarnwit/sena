/**
 * SENA Mobile App — Auth API Functions
 *
 * API calls for authentication:
 * - POST /api/auth/register
 * - POST /api/auth/login
 * - POST /api/auth/refresh
 * - POST /api/auth/logout
 * - POST /api/auth/forgot-password
 * - POST /api/auth/reset-password
 */

import apiClient from './client';
import type { LoginPayload, RegisterPayload, AuthResponse } from '../types/auth';

/** Forgot password request payload */
export interface ForgotPasswordPayload {
  username: string;
  first_name: string;
  last_name: string;
}

/** Reset password request payload */
export interface ResetPasswordPayload {
  resetToken: string;
  newPassword: string;
}

/**
 * Register a new resident account
 */
export const register = async (data: RegisterPayload): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
};

/**
 * Login with username and password
 */
export const login = async (data: LoginPayload): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/login', data);
  return response.data;
};

/**
 * Refresh access token using refresh token
 */
export const refreshToken = async (token: string): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/refresh', { refreshToken: token });
  return response.data;
};

/**
 * Logout — invalidate session
 */
export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};

/**
 * Forgot password — verify identity to get reset token
 * Requires: username, first_name, last_name
 */
export const forgotPassword = async (
  data: ForgotPasswordPayload,
): Promise<{ success: boolean; data: { resetToken: string }; message: string }> => {
  const response = await apiClient.post('/auth/forgot-password', data);
  return response.data;
};

/**
 * Reset password — use reset token to set new password
 */
export const resetPassword = async (
  data: ResetPasswordPayload,
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post('/auth/reset-password', data);
  return response.data;
};
