'use client';

import { useAuthContext } from '@/context/AuthContext';

/**
 * Custom hook for auth operations
 * ตาม AGENTS.md — แยก Business Logic ไปไว้ใน Custom Hooks
 */
export function useAuth() {
  return useAuthContext();
}
