/**
 * SENA Mobile App — Auth Context
 *
 * Provides authentication state across the app:
 * - user object, isAuthenticated, isLoading
 * - login, logout, register functions
 * - Auto-restores session on app start
 */

import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, setAccessToken } from '@api/index';
import type { AuthState, LoginPayload, RegisterPayload, User } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (data: LoginPayload) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = user !== null;

  /**
   * Restore session from stored refresh token on app start
   */
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await authApi.refreshToken(refreshToken);
          const { user: userData, accessToken, refreshToken: newRefreshToken } =
            response.data;
          setAccessToken(accessToken);
          await AsyncStorage.setItem('refreshToken', newRefreshToken);
          setUser(userData);
        }
      } catch {
        // Session expired or invalid — clear everything
        setAccessToken(null);
        await AsyncStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  /**
   * Login with username and password
   */
  const login = useCallback(async (data: LoginPayload) => {
    const response = await authApi.login(data);
    const { user: userData, accessToken, refreshToken } = response.data;
    setAccessToken(accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    setUser(userData);
  }, []);

  /**
   * Register a new resident account
   */
  const register = useCallback(async (data: RegisterPayload) => {
    const response = await authApi.register(data);
    const { user: userData, accessToken, refreshToken } = response.data;
    setAccessToken(accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    setUser(userData);
  }, []);

  /**
   * Logout and clear all tokens
   */
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if API fails, clear local state
    } finally {
      setAccessToken(null);
      await AsyncStorage.removeItem('refreshToken');
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isAuthenticated, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
