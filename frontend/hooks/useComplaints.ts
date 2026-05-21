'use client';

import { useState, useCallback } from 'react';
import api from '@/lib/api';
import { Complaint, CreateComplaintRequest, UpdateComplaintRequest } from '@/types/complaint';

/**
 * Custom hook for complaint CRUD operations
 * ตาม AGENTS.md — แยก Business Logic ไปไว้ใน Custom Hooks
 */
export function useComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyComplaints = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/complaints/my');
      setComplaints(data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch complaints');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAllComplaints = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/complaints/all');
      setComplaints(data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch complaints');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getComplaintById = useCallback(async (id: string | number): Promise<Complaint | null> => {
    try {
      const { data } = await api.get(`/complaints/${id}`);
      return data.data;
    } catch {
      return null;
    }
  }, []);

  const createComplaint = useCallback(async (input: CreateComplaintRequest) => {
    const { data } = await api.post('/complaints', input);
    return data.data;
  }, []);

  const updateComplaint = useCallback(async (id: string | number, input: UpdateComplaintRequest) => {
    const { data } = await api.patch(`/complaints/${id}`, input);
    return data.data;
  }, []);

  const updateStatus = useCallback(async (id: string | number, status: string) => {
    const { data } = await api.patch(`/complaints/staff/${id}/status`, { status });
    return data.data;
  }, []);

  const deleteComplaint = useCallback(async (id: string | number) => {
    await api.delete(`/complaints/${id}`);
  }, []);

  return {
    complaints,
    isLoading,
    error,
    fetchMyComplaints,
    fetchAllComplaints,
    getComplaintById,
    createComplaint,
    updateComplaint,
    updateStatus,
    deleteComplaint,
  };
}
