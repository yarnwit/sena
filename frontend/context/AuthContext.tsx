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
      // Clean up legacy accessToken from localStorage to prevent confusion
      localStorage.removeItem('accessToken');
      
      const savedUser = localStorage.getItem('user');
      // Token is now an HttpOnly cookie, we only rely on user data from localStorage
      // However, to ensure they are actually authenticated, the API calls will fail if token is missing
      if (savedUser) {
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
    const { user: userData } = response.data.data;

    localStorage.setItem('user', JSON.stringify(userData));

    // Set user cookie for middleware
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

    localStorage.removeItem('user');
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
