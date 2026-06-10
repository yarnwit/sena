/**
 * SENA Mobile App — useComplaints Hook
 *
 * Hook for managing complaint list state with pagination,
 * filtering, and CRUD operations
 */

import { useCallback, useState } from 'react';
import { complaintsApi } from '@api/index';
import type {
  Complaint,
  ComplaintCreatePayload,
  ComplaintListParams,
  ComplaintStatus,
  ComplaintCreateForStaffPayload,
} from '../types/complaint';

interface UseComplaintsReturn {
  complaints: Complaint[];
  isLoading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  /** Fetch complaints with current filters */
  fetchComplaints: (params?: ComplaintListParams) => Promise<void>;
  /** Refresh the current page */
  refresh: () => Promise<void>;
  /** Load next page (for infinite scroll) */
  loadMore: () => Promise<void>;
  /** Filter by status */
  filterByStatus: (status: ComplaintStatus | undefined) => Promise<void>;
  /** Search by keyword */
  search: (keyword: string) => Promise<void>;
  /** Create a new complaint */
  createComplaint: (data: ComplaintCreatePayload) => Promise<Complaint>;
  /** Create a new complaint by staff */
  createComplaintForStaff: (data: ComplaintCreateForStaffPayload) => Promise<Complaint>;
}

import { useAuth } from './useAuth';

export const useComplaints = (): UseComplaintsReturn => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentParams, setCurrentParams] = useState<ComplaintListParams>({});

  const fetchComplaints = useCallback(async (params?: ComplaintListParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = { ...params, page: params?.page || 1, limit: 10 };
      const response = await complaintsApi.getComplaints(queryParams, user?.role);

      let newComplaints = response.data || [];
      if (queryParams.status) {
        newComplaints = newComplaints.filter(c => c.status === queryParams.status);
      }

      if (queryParams.page === 1) {
        setComplaints(newComplaints);
      } else {
        setComplaints(prev => [...prev, ...newComplaints]);
      }

      if (response.pagination) {
        setPage(response.pagination.page);
        setTotalPages(response.pagination.totalPages);
      } else {
        setPage(1);
        setTotalPages(1);
      }
      setCurrentParams(queryParams);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.role]);

  const refresh = useCallback(async () => {
    await fetchComplaints({ ...currentParams, page: 1 });
  }, [fetchComplaints, currentParams]);

  const loadMore = useCallback(async () => {
    if (page < totalPages && !isLoading) {
      await fetchComplaints({ ...currentParams, page: page + 1 });
    }
  }, [page, totalPages, isLoading, fetchComplaints, currentParams]);

  const filterByStatus = useCallback(
    async (status: ComplaintStatus | undefined) => {
      await fetchComplaints({ ...currentParams, status, page: 1 });
    },
    [fetchComplaints, currentParams],
  );

  const searchByKeyword = useCallback(
    async (keyword: string) => {
      await fetchComplaints({ ...currentParams, search: keyword, page: 1 });
    },
    [fetchComplaints, currentParams],
  );

  const createComplaint = useCallback(
    async (data: ComplaintCreatePayload): Promise<Complaint> => {
      const response = await complaintsApi.createComplaint(data);
      // Prepend the new complaint to the list
      setComplaints(prev => [response.data, ...prev]);
      return response.data;
    },
    [],
  );

  const createComplaintForStaff = useCallback(
    async (data: ComplaintCreateForStaffPayload): Promise<Complaint> => {
      const response = await complaintsApi.createComplaintForStaff(data);
      // Prepend the new complaint to the list
      setComplaints(prev => [response.data, ...prev]);
      return response.data;
    },
    [],
  );

  return {
    complaints,
    isLoading,
    error,
    page,
    totalPages,
    fetchComplaints,
    refresh,
    loadMore,
    filterByStatus,
    search: searchByKeyword,
    createComplaint,
    createComplaintForStaff,
  };
};
