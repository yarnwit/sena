import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

export interface AdminDashboardStats {
  totalComplaints: number;
  totalUsers: number;
  totalResidents: number;
  totalStaff: number;
  totalAdmins: number;
  approvedCount: number;
  inMeetingCount: number;
  pendingCount: number;
  inProgressCount: number;
  resolvedCount: number;
  rejectedCount: number;
  closedCount: number;
  todayCount: number;
}

export interface RecentUser {
  user_id: string;
  first_name: string;
  last_name: string;
  username: string;
  role: string;
}

export interface ActivityItem {
  id?: number;
  log_id?: number;
  action: string;
  entity: string;
  details?: Record<string, any> | null;
  created_at: string;
  user_name?: string;
}

export interface RecentComplaint {
  complaint_id: number;
  ticket_no: string;
  subject: string;
  status: string;
  reported_date: string;
  resident_name?: string;
}

export function useAdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recentComplaints, setRecentComplaints] = useState<RecentComplaint[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [reportRes, usersRes, logsRes, complaintsRes] = await Promise.allSettled([
        api.get('/admin/reports'),
        api.get('/admin/users'),
        api.get('/admin/logs', { params: { limit: 10 } }),
        api.get('/complaints/all', { params: { limit: 8, sort: 'desc' } }),
      ]);

      // ── Reports ──
      if (reportRes.status === "fulfilled" && reportRes.value.data?.success) {
        const r = reportRes.value.data.data;
        setStats({
          totalComplaints: r.total_complaints ?? r.totalComplaints ?? 0,
          totalUsers: r.total_users ?? r.totalUsers ?? 0,
          totalResidents: r.total_residents ?? r.totalResidents ?? 0,
          totalStaff: r.total_staff ?? r.totalStaff ?? 0,
          totalAdmins: r.total_admins ?? r.totalAdmins ?? 0,
          approvedCount: r.approved ?? r.approvedCount ?? 0,
          inMeetingCount: r.in_meeting ?? r.inMeetingCount ?? 0,
          pendingCount: r.pending ?? r.pendingCount ?? 0,
          inProgressCount: r.in_progress ?? r.inProgressCount ?? 0,
          resolvedCount: r.resolved ?? r.resolvedCount ?? 0,
          rejectedCount: r.rejected ?? r.rejectedCount ?? 0,
          closedCount: r.closed ?? r.closedCount ?? (r.status_summary?.closed) ?? 0,
          todayCount: r.today ?? r.todayCount ?? 0,
        });
      } else {
        setStats({
          totalComplaints: 0, totalUsers: 0, totalResidents: 0, totalStaff: 0, totalAdmins: 0, 
          approvedCount: 0, inMeetingCount: 0, pendingCount: 0, inProgressCount: 0, resolvedCount: 0,
          rejectedCount: 0, closedCount: 0, todayCount: 0,
        });
      }

      // ── Users ──
      if (usersRes.status === "fulfilled" && usersRes.value.data?.success) {
        setRecentUsers(usersRes.value.data.data.slice(0, 5));
      }

      // ── Audit Logs ──
      if (logsRes.status === "fulfilled" && logsRes.value.data?.success) {
        setActivities(logsRes.value.data.data.slice(0, 8));
      }

      // ── Recent Complaints ──
      if (complaintsRes.status === "fulfilled" && complaintsRes.value.data?.success) {
        setRecentComplaints(complaintsRes.value.data.data.slice(0, 6));
      }

      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("Fetch admin dashboard data error:", err);
      setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { stats, recentComplaints, recentUsers, activities, isLoading, error, lastUpdated, refetch: fetchDashboardData };
}
