import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

export interface TimelineEvent {
  id: string | number;
  type: 'comment' | 'system_log';
  content?: string;
  action?: string;
  details?: any;
  created_at: string;
  user_name: string;
  user_role: string;
  user_id: string;
}

export function useComplaintDetail(complaintId: string, role: 'resident' | 'staff' | 'admin') {
  const [complaint, setComplaint] = useState<any>(null);
  const [comments, setComments] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = role === 'resident' ? `/complaints/${complaintId}` : `/complaints/staff/${complaintId}`;
      const res = await api.get(endpoint);
      if (res.data?.success && res.data?.data) {
        setComplaint(res.data.data);
      } else {
        setError('ไม่พบเรื่องร้องเรียน');
      }

      // Fetch comments
      try {
        const timelineRes = await api.get(`/complaints/${complaintId}/comments`);
        if (timelineRes.data?.success) {
          setComments(timelineRes.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch timeline:", err);
      }

    } catch (err: any) {
      console.error("Fetch complaint detail error:", err);
      setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setIsLoading(false);
    }
  }, [complaintId, role]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const updateStatus = async (status: string, petition: string = "") => {
    if (role === 'resident') return false; // residents cannot update status
    try {
      const res = await api.patch(`/complaints/staff/${complaintId}/status`, { status, petition });
      if (res.data?.success) {
        setComplaint((prev: any) => ({ ...prev, status, petition }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Update status error:", err);
      throw err;
    }
  };

  const addComment = async (content: string) => {
    try {
      const res = await api.post(`/complaints/${complaintId}/comments`, { content });
      if (res.data?.success && res.data?.data) {
        setComments((prev) => [...prev, res.data.data]);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Add comment error:", err);
      throw err;
    }
  };

  return { complaint, comments, isLoading, error, fetchDetail, updateStatus, addComment };
}
