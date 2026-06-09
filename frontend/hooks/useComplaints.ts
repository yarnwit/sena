import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Complaint } from '@/types/complaint';

export function useComplaints(role: 'admin' | 'staff' | 'resident', initialFilter?: string) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComplaints = useCallback(async (filter?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const endpoint = role === 'resident' ? '/complaints/my' : '/complaints/all';
      const params = filter && filter !== 'all' ? { filter } : {};
      
      const res = await api.get(endpoint, { params });
      
      if (res.data?.success) {
        setComplaints(res.data.data || []);
      }
    } catch (err: any) {
      console.error("Fetch complaints error:", err);
      setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลเรื่องร้องเรียน');
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchComplaints(initialFilter);
  }, [fetchComplaints, initialFilter]);

  return { complaints, isLoading, error, refetch: fetchComplaints };
}

export function useComplaintDetail(id: string, role: 'admin' | 'staff' | 'resident') {
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const endpoint = role === 'resident' ? `/complaints/${id}` : `/complaints/staff/${id}`;
      const res = await api.get(endpoint);
      
      if (res.data?.success) {
        setComplaint(res.data.data);
      }
    } catch (err: any) {
      console.error("Fetch complaint detail error:", err);
      setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลรายละเอียด');
    } finally {
      setIsLoading(false);
    }
  }, [id, role]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { complaint, isLoading, error, refetch: fetchDetail };
}
