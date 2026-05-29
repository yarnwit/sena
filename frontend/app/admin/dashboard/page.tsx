"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
  </svg>
);
const IconUsers = () => (
  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconClock = () => (
  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  const bgColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-900",
    in_progress: "bg-indigo-100 text-indigo-900",
    resolved: "bg-emerald-100 text-emerald-900",
    rejected: "bg-rose-100 text-rose-900",
    closed: "bg-gray-100 text-gray-700"
  };
  const dotColors: Record<string, string> = {
    pending: "bg-amber-500",
    in_progress: "bg-indigo-500",
    resolved: "bg-emerald-500",
    rejected: "bg-rose-500",
    closed: "bg-gray-500"
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColors[status] || bgColors.pending}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[status] || dotColors.pending}`} />
      {statusLabel(status)}
    </span>
  );
}

/* ===== Skeleton ===== */
function Skeleton({ w, h }: { w?: string; h?: string }) {
  return <div className="rounded-lg bg-[linear-gradient(90deg,#f3f4f6_25%,#e5e7eb_50%,#f3f4f6_75%)] bg-[length:200%_100%] animate-[dash-shimmer_1.4s_ease_infinite]" style={{ width: w ?? "100%", height: h ?? "16px" }} />;
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
  const iconColors: Record<string, string> = {
    indigo: "bg-gradient-to-br from-indigo-500 to-indigo-400",
    violet: "bg-gradient-to-br from-violet-600 to-violet-400",
    amber: "bg-gradient-to-br from-amber-500 to-amber-400",
    emerald: "bg-gradient-to-br from-emerald-500 to-emerald-400",
    rose: "bg-gradient-to-br from-rose-500 to-rose-400",
  };

  return (
    <div className="bg-white rounded-2xl p-5.5 px-6 flex items-center gap-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-black/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)]">
      <div className={`w-[52px] h-[52px] rounded-xl flex items-center justify-center shrink-0 ${iconColors[color]}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-400 font-medium whitespace-nowrap">{label}</div>
        {loading ? (
          <Skeleton w="60px" h="28px" />
        ) : (
          <div className="text-[28px] font-bold text-gray-900 leading-[1.2] my-0.5">{value}</div>
        )}
        {sub && !loading && <div className="text-xs text-gray-500">{sub}</div>}
      </div>
      {trend && !loading && (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trend.up ? "text-emerald-600 bg-emerald-100" : "text-red-600 bg-red-100"}`}>
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
        fetch(`${API}/complaints/all?limit=8&sort=desc`, { headers }),
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
    <div className="grid gap-5">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-[18px] md:text-2xl font-bold text-gray-900 m-0 tracking-tight">ภาพรวมระบบ</h1>
            <p className="text-sm text-gray-500 mt-1 m-0">
            {lastUpdated
              ? `อัปเดตล่าสุด ${lastUpdated.toLocaleTimeString("th-TH")}`
              : "กำลังโหลดข้อมูล..."}
          </p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium cursor-pointer disabled:opacity-60"
        >
          <IconRefresh /> รีเฟรช
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Status Distribution */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <p className="text-[15px] font-semibold text-gray-900 m-0">สถานะเรื่องร้องเรียน</p>
              <p className="text-xs text-gray-400 mt-0.5 m-0">สัดส่วนแต่ละสถานะ</p>
            </div>
            <Link href="/admin/reports" className="text-[13px] text-violet-600 font-medium no-underline hover:underline">ดูรายงาน →</Link>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col gap-3.5">
                {[1,2,3,4,5].map(i => <Skeleton key={i} h="14px" />)}
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {statusRows.map(row => (
                  <div key={row.key} className="flex items-center gap-3">
                    <span className="text-[13px] text-gray-700 w-[90px] shrink-0">{row.label}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-800 ease-out ${
                          row.key === 'pending' ? 'bg-amber-500' :
                          row.key === 'in_progress' ? 'bg-indigo-500' :
                          row.key === 'resolved' ? 'bg-emerald-500' :
                          row.key === 'rejected' ? 'bg-rose-500' :
                          'bg-gray-500'
                        }`}
                        style={{ width: `${pct(row.count)}%` }}
                      />
                    </div>
                    <span className="text-[13px] font-semibold text-gray-700 w-8 text-right shrink-0">{row.count}</span>
                  </div>
                ))}
                {total === 0 && (
                  <div className="flex flex-col items-center justify-center p-10 py-5 text-sm text-gray-400 gap-2">ยังไม่มีข้อมูลเรื่องร้องเรียน</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <p className="text-[15px] font-semibold text-gray-900 m-0">ผู้ใช้งานล่าสุด</p>
              <p className="text-xs text-gray-400 mt-0.5 m-0">5 รายการล่าสุด</p>
            </div>
            <Link href="/admin/users" className="text-[13px] text-violet-600 font-medium no-underline hover:underline">จัดการผู้ใช้ →</Link>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col gap-3">
                {[1,2,3,4,5].map(i => <Skeleton key={i} h="36px" />)}
              </div>
            ) : recentUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 py-5 text-sm text-gray-400 gap-2">ไม่พบข้อมูลผู้ใช้</div>
            ) : (
              recentUsers.map(u => (
                <div key={u.user_id} className="flex items-center gap-2.5 py-3 border-b border-gray-100 last:border-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center text-[13px] font-semibold text-white shrink-0">
                    {u.first_name?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-gray-900">{u.first_name} {u.last_name}</div>
                    <div className="text-xs text-gray-400">@{u.username}</div>
                  </div>
                  <span className={`ml-auto text-[11px] font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${
                    u.role === 'staff' ? 'bg-indigo-100 text-indigo-800' :
                    u.role === 'admin' ? 'bg-pink-100 text-pink-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {u.role === "staff" ? "นิติบุคคล" : u.role === "admin" ? "แอดมิน" : "ลูกบ้าน"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Row 3: Recent Complaints ── */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <p className="text-[15px] font-semibold text-gray-900 m-0">เรื่องร้องเรียนล่าสุด</p>
            <p className="text-xs text-gray-400 mt-0.5 m-0">8 รายการล่าสุดในระบบ</p>
          </div>
          <Link href="/admin/reports" className="text-[13px] text-violet-600 font-medium no-underline hover:underline">ดูทั้งหมด →</Link>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="px-6 py-5 flex flex-col gap-3">
              {[1,2,3,4,5].map(i => <Skeleton key={i} h="44px" />)}
            </div>
          ) : recentComplaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 py-10 text-sm text-gray-400 gap-2">ยังไม่มีเรื่องร้องเรียน</div>
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden sm:block">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-50 border-b border-gray-100">เลขที่</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-50 border-b border-gray-100">หัวข้อ</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-50 border-b border-gray-100">ผู้แจ้ง</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-50 border-b border-gray-100">สถานะ</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-50 border-b border-gray-100">วันที่</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentComplaints.map(c => (
                      <tr key={c.complaint_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3.5 border-b border-gray-50 text-gray-700 align-middle"><span className="font-mono text-xs text-violet-600 font-semibold">{c.ticket_no ?? `#${c.complaint_id}`}</span></td>
                        <td className="px-4 py-3.5 border-b border-gray-50 text-gray-700 align-middle"><span className="max-w-[180px] whitespace-nowrap overflow-hidden text-ellipsis font-medium text-gray-900">{c.subject}</span></td>
                        <td className="px-4 py-3.5 border-b border-gray-50 text-gray-700 align-middle">{c.resident_name ?? "—"}</td>
                        <td className="px-4 py-3.5 border-b border-gray-50 text-gray-700 align-middle"><StatusBadge status={c.status} /></td>
                        <td className="px-4 py-3.5 border-b border-gray-50 text-gray-700 align-middle text-xs text-gray-400">
                          {c.reported_date ? new Date(c.reported_date).toLocaleDateString("th-TH") : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="sm:hidden divide-y divide-gray-100">
                {recentComplaints.map(c => (
                  <div key={c.complaint_id} className="p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-violet-600 font-semibold">{c.ticket_no ?? `#${c.complaint_id}`}</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="text-sm font-semibold text-gray-800 truncate">
                      {c.subject}
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>ผู้แจ้ง: {c.resident_name ?? "—"}</span>
                      <span>
                        {c.reported_date ? new Date(c.reported_date).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "2-digit"
                        }) : "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Row 4: Audit Activity ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Quick Stats Summary */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <p className="text-[15px] font-semibold text-gray-900 m-0">สรุปสถิติ</p>
              <p className="text-xs text-gray-400 mt-0.5 m-0">ภาพรวมตัวเลขสำคัญ</p>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col gap-3">
                {[1,2,3,4].map(i => <Skeleton key={i} h="40px" />)}
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {[
                  { label: "รอดำเนินการ",    val: stats?.pendingCount ?? 0,     color: "#f59e0b" },
                  { label: "กำลังดำเนินการ", val: stats?.inProgressCount ?? 0,  color: "#6366f1" },
                  { label: "แก้ไขแล้ว",      val: stats?.resolvedCount ?? 0,    color: "#10b981" },
                  { label: "ปฏิเสธ",         val: stats?.rejectedCount ?? 0,    color: "#f43f5e" },
                  { label: "ปิดแล้ว",        val: stats?.closedCount ?? 0,      color: "#6b7280" },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                    <span className="text-[13px] text-gray-700 flex-1">{item.label}</span>
                    <span className="text-[13px] font-semibold text-gray-900">{item.val}</span>
                    <span className="text-xs text-gray-400 w-9 text-right">
                      {pct(item.val)}%
                    </span>
                  </div>
                ))}
                <div className="mt-4 pt-3.5 border-t border-gray-100">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-gray-700 font-semibold">รวมทั้งหมด</span>
                    <span className="text-gray-900 font-bold">{stats?.totalComplaints ?? 0} เรื่อง</span>
                  </div>
                  <div className="flex justify-between text-[13px] mt-1.5">
                    <span className="text-gray-700">เพิ่มวันนี้</span>
                    <span className="text-indigo-600 font-semibold">+{stats?.todayCount ?? 0} เรื่อง</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Audit Activity */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <p className="text-[15px] font-semibold text-gray-900 m-0">กิจกรรมล่าสุด</p>
              <p className="text-xs text-gray-400 mt-0.5 m-0">Audit log ล่าสุด</p>
            </div>
            <Link href="/admin/logs" className="text-[13px] text-violet-600 font-medium no-underline hover:underline">ดู Logs →</Link>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col gap-3">
                {[1,2,3,4,5].map(i => <Skeleton key={i} h="40px" />)}
              </div>
            ) : activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 py-5 text-sm text-gray-400 gap-2">ยังไม่มีกิจกรรม</div>
            ) : (
              <div className="flex flex-col gap-0">
                {activities.map(a => (
                  <div key={a.id} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0 relative">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      actionType(a.action) === 'create' ? 'bg-emerald-500' :
                      actionType(a.action) === 'update' ? 'bg-indigo-500' :
                      actionType(a.action) === 'delete' ? 'bg-rose-500' :
                      actionType(a.action) === 'login' ? 'bg-amber-500' :
                      'bg-gray-500'
                    }`} />
                    <div>
                      <div className="text-[13px] text-gray-700 flex-1 leading-relaxed">
                        <strong className="text-gray-900">{a.user_name ?? "ผู้ใช้"}</strong>{" "}
                        {actionLabel(a.action, a.entity)}
                        {a.details?.from && a.details?.to && (
                          <span className="text-gray-400">
                            {" "}({String(a.details.from)} → {String(a.details.to)})
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{timeAgo(a.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom padding ── */}
      <div className="h-2" />
    </div>
  );
}
