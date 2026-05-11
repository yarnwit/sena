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
  location_written: string | null;
}

interface Stats {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  rejected: number;
}

/* ===== Helpers ===== */
const statusLabels: Record<string, string> = {
  pending: "รอดำเนินการ",
  in_progress: "กำลังดำเนินการ",
  resolved: "แก้ไขแล้ว",
  rejected: "ปฏิเสธ",
  closed: "ปิดเรื่อง",
};

/** คำนวณอายุของเรื่องร้องเรียน */
function getDaysAgo(dateStr: string): number {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function formatDaysAgo(days: number): string {
  if (days === 0) return "วันนี้";
  if (days === 1) return "เมื่อวาน";
  return `${days} วันที่แล้ว`;
}

/* ===== Icon Components ===== */
const InboxIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ActivityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const AlertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const ListIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const ZapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

/* ===== Page Component ===== */
export default function StaffDashboardPage() {
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, in_progress: 0, resolved: 0, rejected: 0 });
  const [urgentComplaints, setUrgentComplaints] = useState<Complaint[]>([]);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // ดึง complaints ทั้งหมดสำหรับ staff (ดูได้ทุกเรื่อง)
      const { data: complaints } = await supabase
        .from("complaints")
        .select("complaint_id, ticket_no, subject, status, reported_date, location_written")
        .order("reported_date", { ascending: false });

      if (complaints) {
        // คำนวณ Stats
        setStats({
          total:       complaints.length,
          pending:     complaints.filter((c) => c.status === "pending").length,
          in_progress: complaints.filter((c) => c.status === "in_progress").length,
          resolved:    complaints.filter((c) => c.status === "resolved" || c.status === "closed").length,
          rejected:    complaints.filter((c) => c.status === "rejected").length,
        });

        // เรื่องเร่งด่วน = pending ที่นานเกิน 3 วัน + pending ใหม่ทั้งหมด
        const urgent = complaints
          .filter((c) => c.status === "pending")
          .sort((a, b) => new Date(a.reported_date).getTime() - new Date(b.reported_date).getTime())
          .slice(0, 6);
        setUrgentComplaints(urgent);

        // เรื่องล่าสุดทั้งหมด (5 รายการ)
        setRecentComplaints(complaints.slice(0, 5));
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
    <div className="staff-dashboard">

      {/* ===== Stats Cards ===== */}
      <div className="stats-grid">
        {/* รวมทั้งหมด */}
        <div className="stat-card">
          <div className="stat-icon-wrapper total">
            <InboxIcon />
          </div>
          <div className="stat-info">
            <div className="stat-label">ร้องเรียนทั้งหมด</div>
            <div className="stat-value">{stats.total}<span className="stat-suffix">เรื่อง</span></div>
          </div>
        </div>

        {/* รอดำเนินการ */}
        <div className="stat-card">
          <div className="stat-icon-wrapper pending">
            <ClockIcon />
          </div>
          <div className="stat-info">
            <div className="stat-label">รอดำเนินการ</div>
            <div className="stat-value">{stats.pending}<span className="stat-suffix">เรื่อง</span></div>
          </div>
        </div>

        {/* กำลังดำเนินการ */}
        <div className="stat-card">
          <div className="stat-icon-wrapper progress">
            <ActivityIcon />
          </div>
          <div className="stat-info">
            <div className="stat-label">กำลังดำเนินการ</div>
            <div className="stat-value">{stats.in_progress}<span className="stat-suffix">เรื่อง</span></div>
          </div>
        </div>

        {/* แก้ไขแล้ว */}
        <div className="stat-card">
          <div className="stat-icon-wrapper resolved">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">แก้ไขแล้ว / ปิด</div>
            <div className="stat-value">{stats.resolved}<span className="stat-suffix">เรื่อง</span></div>
          </div>
        </div>

        {/* ปฏิเสธ */}
        <div className="stat-card">
          <div className="stat-icon-wrapper rejected">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">ปฏิเสธ</div>
            <div className="stat-value">{stats.rejected}<span className="stat-suffix">เรื่อง</span></div>
          </div>
        </div>
      </div>

      {/* ===== Quick Actions ===== */}
      <div className="quick-actions-grid">
        <Link href="/staff/complaints?status=pending" className="quick-action-card">
          <div className="quick-action-icon amber">
            <ZapIcon />
          </div>
          <div className="quick-action-label">เรื่องรอรับ</div>
          <div className="quick-action-sub">{stats.pending} เรื่องรอดำเนินการ</div>
        </Link>

        <Link href="/staff/complaints?status=in_progress" className="quick-action-card">
          <div className="quick-action-icon green">
            <ActivityIcon />
          </div>
          <div className="quick-action-label">กำลังดำเนินการ</div>
          <div className="quick-action-sub">{stats.in_progress} เรื่องอยู่ระหว่างแก้ไข</div>
        </Link>

        <Link href="/staff/complaints" className="quick-action-card">
          <div className="quick-action-icon purple">
            <ListIcon />
          </div>
          <div className="quick-action-label">ดูทั้งหมด</div>
          <div className="quick-action-sub">เรื่องร้องเรียนทุกสถานะ</div>
        </Link>
      </div>

      {/* ===== Two-Column: เรื่องเร่งด่วน + ล่าสุด ===== */}
      <div className="two-col-grid">

        {/* ซ้าย: เรื่องที่รอดำเนินการ (เรียงตามเก่าสุด) */}
        <div className="panel-card">
          <div className="panel-card-header">
            <h2 className="panel-card-title">
              <AlertIcon />
              เรื่องที่รอดำเนินการ
            </h2>
            <Link href="/staff/complaints?status=pending" className="panel-link">
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="panel-card-body">
            {urgentComplaints.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-text">ไม่มีเรื่องที่รอดำเนินการ 🎉</p>
              </div>
            ) : (
              urgentComplaints.map((c) => {
                const days = getDaysAgo(c.reported_date);
                const isOld = days >= 3;
                return (
                  <Link
                    key={c.complaint_id}
                    href={`/staff/complaints/${c.complaint_id}`}
                    className="urgency-item"
                  >
                    <span className={`urgency-dot ${isOld ? "new" : "pending"}`} />
                    <div className="urgency-info">
                      <div className="urgency-ticket">{c.ticket_no || `#${c.complaint_id}`}</div>
                      <div className="urgency-subject">{c.subject}</div>
                      <div className="urgency-meta">
                        {c.location_written || "ไม่ระบุสถานที่"}
                      </div>
                    </div>
                    <span className={`urgency-age ${isOld ? "" : "ok"}`}>
                      {formatDaysAgo(days)}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* ขวา: เรื่องล่าสุดทั้งหมด */}
        <div className="panel-card">
          <div className="panel-card-header">
            <h2 className="panel-card-title">
              <ClockIcon />
              เรื่องร้องเรียนล่าสุด
            </h2>
            <Link href="/staff/complaints" className="panel-link">
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="panel-card-body">
            {recentComplaints.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-text">ยังไม่มีเรื่องร้องเรียน</p>
              </div>
            ) : (
              recentComplaints.map((c) => {
                // กำหนด icon type ตาม status
                let iconClass = "new-complaint";
                let icon = <AlertIcon />;
                if (c.status === "resolved" || c.status === "closed") {
                  iconClass = "resolved";
                  icon = <CheckCircleIcon />;
                } else if (c.status === "in_progress") {
                  iconClass = "status-change";
                  icon = <ActivityIcon />;
                } else if (c.status === "rejected") {
                  iconClass = "rejected";
                  icon = (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  );
                }

                return (
                  <Link
                    key={c.complaint_id}
                    href={`/staff/complaints/${c.complaint_id}`}
                    className="activity-item"
                    style={{ textDecoration: "none" }}
                  >
                    <div className={`activity-icon ${iconClass}`}>{icon}</div>
                    <div className="activity-info">
                      <div className="activity-text">
                        <span className="activity-ticket">{c.ticket_no || `#${c.complaint_id}`}</span>
                        {"  "}
                        <strong>{c.subject}</strong>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                        <span className={`status-badge ${c.status}`}>
                          <span className="status-dot" />
                          {statusLabels[c.status] || c.status}
                        </span>
                        <span className="activity-time">
                          {new Date(c.reported_date).toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
