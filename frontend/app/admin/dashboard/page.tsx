"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "./dashboard.css";

/* ===== Types ===== */
interface DashboardStats {
  totalComplaints: number;
  totalUsers: number;
  totalResidents: number;
  totalStaff: number;
  pendingCount: number;
  inProgressCount: number;
  resolvedCount: number;
  rejectedCount: number;
  closedCount: number;
  todayCount: number;
}

interface RecentComplaint {
  complaint_id: number;
  ticket_no: string;
  subject: string;
  status: string;
  reported_date: string;
  resident_name?: string;
}

interface RecentUser {
  user_id: string;
  first_name: string;
  last_name: string;
  username: string;
  role: string;
}

interface ActivityItem {
  id: number;
  action: string;
  entity: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: Record<string, any> | null;
  created_at: string;
  user_name?: string;
}

/* ===== SVG Icons ===== */
const IconTicket = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
  </svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconRefresh = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

/* ===== Helpers ===== */
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

function getToken() {
  try { return localStorage.getItem("accessToken") ?? ""; } catch { return ""; }
}

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "เมื่อกี้";
  if (m < 60) return `${m} นาทีที่แล้ว`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ชั่วโมงที่แล้ว`;
  return `${Math.floor(h / 24)} วันที่แล้ว`;
}

function statusLabel(s: string) {
  return { pending: "รอดำเนินการ", in_progress: "กำลังดำเนินการ", resolved: "แก้ไขแล้ว", rejected: "ปฏิเสธ", closed: "ปิดแล้ว" }[s] ?? s;
}

function actionLabel(action: string, entity: string) {
  const map: Record<string, string> = {
    CREATE_COMPLAINT: "สร้างเรื่องร้องเรียนใหม่",
    UPDATE_STATUS: "เปลี่ยนสถานะ",
    DELETE_COMPLAINT: "ลบเรื่องร้องเรียน",
    LOGIN: "เข้าสู่ระบบ",
    LOGOUT: "ออกจากระบบ",
    UPDATE_USER: "แก้ไขข้อมูลผู้ใช้",
    CREATE_USER: "สร้างผู้ใช้ใหม่",
  };
  return map[action] ?? `${action} (${entity})`;
}

function actionType(action: string) {
  if (action.startsWith("CREATE")) return "create";
  if (action.startsWith("DELETE")) return "delete";
  if (action === "LOGIN" || action === "LOGOUT") return "login";
  if (action === "UPDATE_STATUS" && String(action).includes("closed")) return "close";
  return "update";
}

/* ===== Status Badge ===== */
function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`dash-badge ${status}`}>
      <span className={`dash-badge-dot ${status}`} />
      {statusLabel(status)}
    </span>
  );
}

/* ===== Skeleton ===== */
function Skeleton({ w, h }: { w?: string; h?: string }) {
  return <div className="dash-skeleton" style={{ width: w ?? "100%", height: h ?? "16px" }} />;
}

/* ===== Stat Card ===== */
function StatCard({
  label, value, sub, trend, color, icon, loading,
}: {
  label: string;
  value: number | string;
  sub?: string;
  trend?: { val: string; up: boolean };
  color: string;
  icon: React.ReactNode;
  loading: boolean;
}) {
  return (
    <div className="dash-stat-card">
      <div className={`dash-stat-icon ${color}`}>{icon}</div>
      <div className="dash-stat-body">
        <div className="dash-stat-label">{label}</div>
        {loading ? (
          <Skeleton w="60px" h="28px" />
        ) : (
          <div className="dash-stat-value">{value}</div>
        )}
        {sub && !loading && <div className="dash-stat-sub">{sub}</div>}
      </div>
      {trend && !loading && (
        <span className={`dash-stat-trend ${trend.up ? "up" : "down"}`}>
          {trend.up ? "▲" : "▼"} {trend.val}
        </span>
      )}
    </div>
  );
}

/* ===== Main Page ===== */
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentComplaints, setRecentComplaints] = useState<RecentComplaint[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function loadData() {
    try {
      const headers = authHeaders();

      // Reports endpoint (สถิติรวม)
      const [reportRes, usersRes, logsRes, complaintsRes] = await Promise.allSettled([
        fetch(`${API}/admin/reports`, { headers }),
        fetch(`${API}/admin/users`, { headers }),
        fetch(`${API}/admin/logs?limit=10`, { headers }),
        fetch(`${API}/complaints?limit=8&sort=desc`, { headers }),
      ]);

      // ── Reports ──
      if (reportRes.status === "fulfilled" && reportRes.value.ok) {
        const data = await reportRes.value.json();
        const r = data.data ?? data;
        setStats({
          totalComplaints: r.total_complaints ?? r.totalComplaints ?? 0,
          totalUsers: r.total_users ?? r.totalUsers ?? 0,
          totalResidents: r.total_residents ?? r.totalResidents ?? 0,
          totalStaff: r.total_staff ?? r.totalStaff ?? 0,
          pendingCount: r.pending ?? r.pendingCount ?? 0,
          inProgressCount: r.in_progress ?? r.inProgressCount ?? 0,
          resolvedCount: r.resolved ?? r.resolvedCount ?? 0,
          rejectedCount: r.rejected ?? r.rejectedCount ?? 0,
          closedCount: r.closed ?? r.closedCount ?? 0,
          todayCount: r.today ?? r.todayCount ?? 0,
        });
      } else {
        // Fallback: mock ถ้า backend ยังไม่พร้อม
        setStats({
          totalComplaints: 0, totalUsers: 0, totalResidents: 0, totalStaff: 0,
          pendingCount: 0, inProgressCount: 0, resolvedCount: 0,
          rejectedCount: 0, closedCount: 0, todayCount: 0,
        });
      }

      // ── Users ──
      if (usersRes.status === "fulfilled" && usersRes.value.ok) {
        const data = await usersRes.value.json();
        const list: RecentUser[] = (data.data ?? data).slice(0, 5);
        setRecentUsers(list);
      }

      // ── Audit Logs ──
      if (logsRes.status === "fulfilled" && logsRes.value.ok) {
        const data = await logsRes.value.json();
        setActivities((data.data ?? data).slice(0, 8));
      }

      // ── Recent Complaints ──
      if (complaintsRes.status === "fulfilled" && complaintsRes.value.ok) {
        const data = await complaintsRes.value.json();
        setRecentComplaints((data.data ?? data).slice(0, 6));
      }

      setLastUpdated(new Date());
    } catch {
      // ignore
    }
  }

  async function fetchAll() {
    setLoading(true);
    await loadData();
    setLoading(false);
  }

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, []);

  const total = stats
    ? stats.pendingCount + stats.inProgressCount + stats.resolvedCount + stats.rejectedCount + stats.closedCount
    : 0;

  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  const statusRows = stats
    ? [
        { key: "pending",     label: "รอดำเนินการ",     count: stats.pendingCount },
        { key: "in_progress", label: "กำลังดำเนินการ",  count: stats.inProgressCount },
        { key: "resolved",    label: "แก้ไขแล้ว",       count: stats.resolvedCount },
        { key: "rejected",    label: "ปฏิเสธ",          count: stats.rejectedCount },
        { key: "closed",      label: "ปิดแล้ว",         count: stats.closedCount },
      ]
    : [];

  return (
    <div className="dash-grid">
      {/* ── Header Row ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" }}>ภาพรวมทั้งระบบ</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#9ca3af" }}>
            {lastUpdated
              ? `อัปเดตล่าสุด ${lastUpdated.toLocaleTimeString("th-TH")}`
              : "กำลังโหลดข้อมูล..."}
          </p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 10, border: "1px solid #e5e7eb",
            background: "#fff", color: "#374151", fontSize: 13, cursor: "pointer",
            opacity: loading ? 0.6 : 1, fontWeight: 500,
          }}
        >
          <IconRefresh /> รีเฟรช
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="dash-stats-row">
        <StatCard label="เรื่องร้องเรียนทั้งหมด" value={stats?.totalComplaints ?? 0}
          sub={`วันนี้ +${stats?.todayCount ?? 0} เรื่อง`} color="indigo" icon={<IconTicket />} loading={loading} />
        <StatCard label="รอดำเนินการ" value={stats?.pendingCount ?? 0}
          sub="ต้องรีบดำเนินการ" color="amber" icon={<IconClock />} loading={loading} />
        <StatCard label="แก้ไขแล้ว" value={stats?.resolvedCount ?? 0}
          sub={`${pct(stats?.resolvedCount ?? 0)}% ของทั้งหมด`} color="emerald" icon={<IconCheck />} loading={loading} />
        <StatCard label="ผู้ใช้งานในระบบ" value={stats?.totalUsers ?? 0}
          sub={`นิติ ${stats?.totalStaff ?? 0} | ลูกบ้าน ${stats?.totalResidents ?? 0}`}
          color="violet" icon={<IconUsers />} loading={loading} />
      </div>

      {/* ── Row 2: Status bars + Recent Users ── */}
      <div className="dash-two-col">

        {/* Status Distribution */}
        <div className="dash-card">
          <div className="dash-card-header">
            <div>
              <p className="dash-card-title">สถานะเรื่องร้องเรียน</p>
              <p className="dash-card-subtitle">สัดส่วนแต่ละสถานะ</p>
            </div>
            <Link href="/admin/reports" className="dash-card-link">ดูรายงาน →</Link>
          </div>
          <div className="dash-card-body">
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[1,2,3,4,5].map(i => <Skeleton key={i} h="14px" />)}
              </div>
            ) : (
              <div className="dash-status-bars">
                {statusRows.map(row => (
                  <div key={row.key} className="dash-status-bar-row">
                    <span className="dash-status-bar-label">{row.label}</span>
                    <div className="dash-status-bar-track">
                      <div
                        className={`dash-status-bar-fill ${row.key}`}
                        style={{ width: `${pct(row.count)}%` }}
                      />
                    </div>
                    <span className="dash-status-bar-count">{row.count}</span>
                  </div>
                ))}
                {total === 0 && (
                  <div className="dash-empty">ยังไม่มีข้อมูลเรื่องร้องเรียน</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="dash-card">
          <div className="dash-card-header">
            <div>
              <p className="dash-card-title">ผู้ใช้งานล่าสุด</p>
              <p className="dash-card-subtitle">5 รายการล่าสุด</p>
            </div>
            <Link href="/admin/users" className="dash-card-link">จัดการผู้ใช้ →</Link>
          </div>
          <div className="dash-card-body">
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[1,2,3,4,5].map(i => <Skeleton key={i} h="36px" />)}
              </div>
            ) : recentUsers.length === 0 ? (
              <div className="dash-empty">ไม่พบข้อมูลผู้ใช้</div>
            ) : (
              recentUsers.map(u => (
                <div key={u.user_id} className="dash-user-row">
                  <div className="dash-user-avatar">
                    {u.first_name?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <div className="dash-user-name">{u.first_name} {u.last_name}</div>
                    <div className="dash-user-meta">@{u.username}</div>
                  </div>
                  <span className={`dash-user-role-badge ${u.role}`}>
                    {u.role === "staff" ? "นิติบุคคล" : u.role === "admin" ? "แอดมิน" : "ลูกบ้าน"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Row 3: Recent Complaints ── */}
      <div className="dash-card">
        <div className="dash-card-header">
          <div>
            <p className="dash-card-title">เรื่องร้องเรียนล่าสุด</p>
            <p className="dash-card-subtitle">8 รายการล่าสุดในระบบ</p>
          </div>
          <Link href="/admin/reports" className="dash-card-link">ดูทั้งหมด →</Link>
        </div>
        <div className="dash-table-wrap">
          {loading ? (
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
              {[1,2,3,4,5].map(i => <Skeleton key={i} h="44px" />)}
            </div>
          ) : recentComplaints.length === 0 ? (
            <div className="dash-empty">ยังไม่มีเรื่องร้องเรียน</div>
          ) : (
            <table className="dash-table">
              <thead>
                <tr>
                  <th>เลขที่</th>
                  <th>หัวข้อ</th>
                  <th>ผู้แจ้ง</th>
                  <th>สถานะ</th>
                  <th>วันที่</th>
                </tr>
              </thead>
              <tbody>
                {recentComplaints.map(c => (
                  <tr key={c.complaint_id}>
                    <td><span className="dash-ticket-no">{c.ticket_no ?? `#${c.complaint_id}`}</span></td>
                    <td><span className="dash-subject">{c.subject}</span></td>
                    <td>{c.resident_name ?? "—"}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td style={{ color: "#9ca3af", fontSize: 12 }}>
                      {c.reported_date ? new Date(c.reported_date).toLocaleDateString("th-TH") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Row 4: Audit Activity ── */}
      <div className="dash-two-col">
        {/* Quick Stats Summary */}
        <div className="dash-card">
          <div className="dash-card-header">
            <div>
              <p className="dash-card-title">สรุปสถิติ</p>
              <p className="dash-card-subtitle">ภาพรวมตัวเลขสำคัญ</p>
            </div>
          </div>
          <div className="dash-card-body">
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[1,2,3,4].map(i => <Skeleton key={i} h="40px" />)}
              </div>
            ) : (
              <div className="dash-donut-legend">
                {[
                  { label: "รอดำเนินการ",    val: stats?.pendingCount ?? 0,     color: "#f59e0b" },
                  { label: "กำลังดำเนินการ", val: stats?.inProgressCount ?? 0,  color: "#6366f1" },
                  { label: "แก้ไขแล้ว",      val: stats?.resolvedCount ?? 0,    color: "#10b981" },
                  { label: "ปฏิเสธ",         val: stats?.rejectedCount ?? 0,    color: "#f43f5e" },
                  { label: "ปิดแล้ว",        val: stats?.closedCount ?? 0,      color: "#6b7280" },
                ].map(item => (
                  <div key={item.label} className="dash-donut-legend-item">
                    <div className="dash-donut-legend-dot" style={{ background: item.color }} />
                    <span className="dash-donut-legend-label">{item.label}</span>
                    <span className="dash-donut-legend-val">{item.val}</span>
                    <span style={{ fontSize: 12, color: "#9ca3af", width: 36, textAlign: "right" }}>
                      {pct(item.val)}%
                    </span>
                  </div>
                ))}
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #f3f4f6" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#374151", fontWeight: 600 }}>รวมทั้งหมด</span>
                    <span style={{ color: "#111827", fontWeight: 700 }}>{stats?.totalComplaints ?? 0} เรื่อง</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 6 }}>
                    <span style={{ color: "#374151" }}>เพิ่มวันนี้</span>
                    <span style={{ color: "#6366f1", fontWeight: 600 }}>+{stats?.todayCount ?? 0} เรื่อง</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Audit Activity */}
        <div className="dash-card">
          <div className="dash-card-header">
            <div>
              <p className="dash-card-title">กิจกรรมล่าสุด</p>
              <p className="dash-card-subtitle">Audit log ล่าสุด</p>
            </div>
            <Link href="/admin/logs" className="dash-card-link">ดู Logs →</Link>
          </div>
          <div className="dash-card-body">
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[1,2,3,4,5].map(i => <Skeleton key={i} h="40px" />)}
              </div>
            ) : activities.length === 0 ? (
              <div className="dash-empty">ยังไม่มีกิจกรรม</div>
            ) : (
              <div className="dash-activity-list">
                {activities.map(a => (
                  <div key={a.id} className="dash-activity-item">
                    <div className={`dash-activity-dot ${actionType(a.action)}`} />
                    <div>
                      <div className="dash-activity-text">
                        <strong>{a.user_name ?? "ผู้ใช้"}</strong>{" "}
                        {actionLabel(a.action, a.entity)}
                        {a.details?.from && a.details?.to && (
                          <span style={{ color: "#9ca3af" }}>
                            {" "}({String(a.details.from)} → {String(a.details.to)})
                          </span>
                        )}
                      </div>
                      <div className="dash-activity-time">{timeAgo(a.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom padding ── */}
      <div style={{ height: 8 }} />
    </div>
  );
}
