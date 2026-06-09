import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Complaint } from '@/types/complaint';

export interface DashboardStats {
  total: number;
  pending: number;
  approved: number;
  in_meeting: number;
  in_progress: number;
  resolved: number;
  rejected: number;
}

export function useDashboard(role: 'admin' | 'staff' | 'resident') {
  const [stats, setStats] = useState<DashboardStats>({
    total: 0, pending: 0, approved: 0, in_meeting: 0, in_progress: 0, resolved: 0, rejected: 0
  });
  const [urgentComplaints, setUrgentComplaints] = useState<Complaint[]>([]);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [houseNo, setHouseNo] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Residents only fetch their own complaints
        const endpoint = role === 'resident' ? '/complaints/my' : '/complaints/all';
        const res = await api.get(endpoint);
        
        if (res.data?.success && res.data?.data) {
          const complaints: Complaint[] = res.data.data;

          setStats({
            total: complaints.length,
            pending: complaints.filter(c => c.status === "pending").length,
            approved: complaints.filter(c => c.status === "approved").length,
            in_meeting: complaints.filter(c => c.status === "in_meeting").length,
            in_progress: complaints.filter(c => c.status === "in_progress").length,
            resolved: complaints.filter(c => c.status === "resolved" || c.status === "closed").length,
            rejected: complaints.filter(c => c.status === "rejected").length,
          });

          if (role !== 'resident') {
            const urgent = complaints
              .filter(c => c.status === "pending")
              .sort((a, b) => new Date(a.reported_date).getTime() - new Date(b.reported_date).getTime())
              .slice(0, 6);
            setUrgentComplaints(urgent);
          }

          setRecentComplaints(complaints.slice(0, 5));
        }

        if (role === 'resident') {
          const userRes = await api.get('/complaints/user-info');
          if (userRes.data?.success && userRes.data?.data) {
            setHouseNo(userRes.data.data.house_no || "");
          }
        }
      } catch (err: any) {
        console.error("Fetch dashboard data error:", err);
        setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [role]);

  return { stats, urgentComplaints, recentComplaints, houseNo, isLoading, error };
}
