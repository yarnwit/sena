'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('accessToken');
      if (savedUser && token) {
        setUser(JSON.parse(savedUser));
      }
    } catch {
      // Invalid data
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const response = await api.post<{ success: boolean; data: AuthResponse }>('/auth/login', data);
    const { user: userData, accessToken } = response.data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));

    // Set cookies for middleware
    document.cookie = `accessToken=${accessToken}; path=/; max-age=${15 * 60}`;
    document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=${15 * 60}`;

    setUser(userData);
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    await api.post('/auth/register', data);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Even if API fails, clear local state
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    document.cookie = 'accessToken=; path=/; max-age=0';
    document.cookie = 'user=; path=/; max-age=0';
    setUser(null);
  }, []);

  const refreshUser = useCallback(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch {
      // Invalid data
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
