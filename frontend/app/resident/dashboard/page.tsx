"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import "./dashboard.css";

/* ===== Types ===== */
interface Complaint {
  complaint_id: number;
  ticket_no: string;
  subject: string;
  status: string;
  reported_date: string;
}

interface Stats {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
}

/* ===== Status Label Map ===== */
const statusLabels: Record<string, string> = {
  pending: "รอดำเนินการ",
  in_progress: "กำลังดำเนินการ",
  resolved: "แก้ไขแล้ว",
  rejected: "ปฏิเสธ",
  closed: "ปิดเรื่อง",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, in_progress: 0, resolved: 0 });
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // ดึง resident_id
      const { data: residentData } = await supabase
        .from("resident")
        .select("resident_id")
        .eq("user_id", user.id)
        .single();

      if (!residentData) {
        setLoading(false);
        return;
      }

      // ดึง complaints ทั้งหมดของ resident
      const { data: complaints } = await supabase
        .from("complaints")
        .select("complaint_id, ticket_no, subject, status, reported_date")
        .eq("resident_id", residentData.resident_id)
        .order("reported_date", { ascending: false });

      if (complaints) {
        setRecentComplaints(complaints.slice(0, 5));
        setStats({
          total: complaints.length,
          pending: complaints.filter((c) => c.status === "pending").length,
          in_progress: complaints.filter((c) => c.status === "in_progress").length,
          resolved: complaints.filter((c) => c.status === "resolved" || c.status === "closed").length,
        });
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper total">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">ร้องเรียนทั้งหมด</div>
            <div className="stat-value">{stats.total}<span className="stat-suffix">เรื่อง</span></div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper pending">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">รอดำเนินการ</div>
            <div className="stat-value">{stats.pending}<span className="stat-suffix">เรื่อง</span></div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper progress">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">กำลังดำเนินการ</div>
            <div className="stat-value">{stats.in_progress}<span className="stat-suffix">เรื่อง</span></div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper resolved">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">แก้ไขแล้ว/ปิดเรื่อง</div>
            <div className="stat-value">{stats.resolved}<span className="stat-suffix">เรื่อง</span></div>
          </div>
        </div>
      </div>

      {/* Recent Complaints */}
      <div>
        <div className="section-header">
          <h2 className="section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            ร้องเรียนล่าสุด
          </h2>
          <Link href="/resident/complaints" className="section-link">
            ดูทั้งหมด →
          </Link>
        </div>

        {recentComplaints.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            <h3 className="empty-title">ยังไม่มีเรื่องร้องเรียน</h3>
            <p className="empty-text">เริ่มสร้างเรื่องร้องเรียนเพื่อแจ้งปัญหาของคุณ</p>
            <Link href="/resident/complaints/new" className="empty-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              สร้างร้องเรียนใหม่
            </Link>
          </div>
        ) : (
          <div className="complaint-card-list">
            {recentComplaints.map((complaint) => (
              <Link
                key={complaint.complaint_id}
                href={`/resident/complaints/${complaint.complaint_id}`}
                className="complaint-card"
              >
                <div className="complaint-card-left">
                  <div className="complaint-card-ticket">{complaint.ticket_no || `#${complaint.complaint_id}`}</div>
                  <div className="complaint-card-subject">{complaint.subject}</div>
                  <div className="complaint-card-date">
                    {new Date(complaint.reported_date).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="complaint-card-right">
                  <span className={`status-badge ${complaint.status}`}>
                    <span className="status-dot" />
                    {statusLabels[complaint.status] || complaint.status}
                  </span>
                  <svg className="arrow-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
