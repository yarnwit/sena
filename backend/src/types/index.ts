// Shared TypeScript types for SENA Backend

export type UserRole = 'resident' | 'staff' | 'admin';

export type ComplaintStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected' | 'closed';

export interface JwtPayload {
  id: string;
  role: UserRole;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: unknown;
}
