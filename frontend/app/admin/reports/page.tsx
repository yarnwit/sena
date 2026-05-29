"use client";

import { useState, useEffect, useMemo } from "react";

/* ===== Types ===== */
interface ReportStats {
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

interface Complaint {
  complaint_id: number;
  ticket_no: string;
  subject: string;
  status: string;
  reported_date: string;
  resident_name?: string;
  intake_channel?: string;
  soi?: string;
}

/* ===== SVG Icons ===== */
const IconTicket = () => (
  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
  </svg>
);
const IconUsers = () => (
  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconClock = () => (
  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconRefresh = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);
const IconTrendUp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
);
const IconDownload = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
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
function statusLabel(s: string) {
  return { pending: "รอดำเนินการ", in_progress: "กำลังดำเนินการ", resolved: "แก้ไขแล้ว", rejected: "ปฏิเสธ", closed: "ปิดแล้ว" }[s] ?? s;
}

/* ===== Sub-Components ===== */
function Skeleton({ w, h }: { w?: string; h?: string }) {
  return <div className="rounded-lg bg-[linear-gradient(90deg,#f3f4f6_25%,#e5e7eb_50%,#f3f4f6_75%)] bg-[length:200%_100%] animate-[dash-shimmer_1.4s_ease_infinite]" style={{ width: w ?? "100%", height: h ?? "16px" }} />;
}

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

function StatCard({ label, value, sub, color, icon, loading, trend }: {
  label: string; value: number | string; sub?: string;
  color: string; icon: React.ReactNode; loading: boolean;
  trend?: number[];
}) {
  const iconColors: Record<string, string> = {
    indigo: "bg-gradient-to-br from-indigo-500 to-indigo-400",
    violet: "bg-gradient-to-br from-violet-600 to-violet-400",
    amber: "bg-gradient-to-br from-amber-500 to-amber-400",
    emerald: "bg-gradient-to-br from-emerald-500 to-emerald-400",
    rose: "bg-gradient-to-br from-rose-500 to-rose-400",
    sky: "bg-gradient-to-br from-sky-500 to-sky-400",
  };
  const strokeColors: Record<string, string> = {
    indigo: "#6366f1", violet: "#7c3aed", amber: "#f59e0b", emerald: "#10b981", rose: "#f43f5e", sky: "#0ea5e9"
  };

  const sparkline = trend && trend.length > 0 ? (
    <svg className="absolute bottom-0 left-0 w-full h-12 opacity-20 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
      <path d={`M0,100 L0,${100 - (trend[0]/Math.max(...trend))*80} ` + trend.map((v, i) => `L${(i/(trend.length-1))*100},${100 - (v/Math.max(...trend))*80}`).join(" ") + " L100,100 Z"} fill={strokeColors[color]} />
      <polyline points={trend.map((v, i) => `${(i/(trend.length-1))*100},${100 - (v/Math.max(...trend))*80}`).join(" ")} fill="none" stroke={strokeColors[color]} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : null;

  return (
    <div className="relative bg-white rounded-2xl p-5.5 px-6 flex items-center gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] overflow-hidden group">
      <div className={`relative z-10 w-[52px] h-[52px] rounded-xl flex items-center justify-center shrink-0 ${iconColors[color]} shadow-inner`}>{icon}</div>
      <div className="relative z-10 flex-1 min-w-0">
        <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider whitespace-nowrap mb-1">{label}</div>
        {loading ? <Skeleton w="60px" h="28px" /> : <div className="text-3xl font-black text-gray-900 leading-[1.1] tracking-tight">{value}</div>}
        {sub && !loading && <div className="text-xs font-medium text-gray-500 mt-1 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span>{sub}</div>}
      </div>
      {sparkline}
    </div>
  );
}

/* ===== Donut Chart (SVG) ===== */
function DonutChart({ segments, total }: {
  segments: { label: string; value: number; color: string }[];
  total: number;
}) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col md:flex-row items-center gap-8 flex-wrap">
      <div className="relative w-[180px] h-[180px] shrink-0">
        <svg className="w-[180px] h-[180px] -rotate-90" viewBox="0 0 180 180">
          {total === 0 ? (
            <circle cx="90" cy="90" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="18" />
          ) : (
            segments.map((seg, i) => {
              const pct = seg.value / total;
              const dashLen = pct * circumference;
              const el = (
                <circle key={i} cx="90" cy="90" r={radius} fill="none" stroke={seg.color}
                  strokeWidth="18" strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                  strokeDashoffset={-offset} strokeLinecap="butt"
                  style={{ transition: "stroke-dasharray 0.8s ease, stroke-dashoffset 0.8s ease" }} />
              );
              offset += dashLen;
              return el;
            })
          )}
        </svg>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-[32px] font-bold text-gray-900 leading-none">{total}</div>
          <div className="text-xs text-gray-400 mt-1">เรื่องทั้งหมด</div>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-2.5 min-w-[160px]">
        {segments.map(seg => (
          <div key={seg.label} className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
            <span className="text-[13px] text-gray-700 flex-1">{seg.label}</span>
            <span className="text-[13px] font-semibold text-gray-900">{seg.value}</span>
            <span className="text-xs text-gray-400 w-9 text-right">
              {total > 0 ? Math.round((seg.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== Main Page ===== */
export default function AdminReportsPage() {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dateFilter, setDateFilter] = useState("all"); // "all", "today", "week", "month"

  async function loadData() {
    try {
      const headers = authHeaders();
      let query = "?sort=desc";
      if (dateFilter !== "all") query += `&filter=${dateFilter}`;
      
      const [reportRes, complaintsRes] = await Promise.allSettled([
        fetch(`${API}/admin/reports${query}`, { headers }),
        fetch(`${API}/complaints/all${query}`, { headers }),
      ]);

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
        setStats({
          totalComplaints: 0, totalUsers: 0, totalResidents: 0, totalStaff: 0,
          pendingCount: 0, inProgressCount: 0, resolvedCount: 0,
          rejectedCount: 0, closedCount: 0, todayCount: 0,
        });
      }

      if (complaintsRes.status === "fulfilled" && complaintsRes.value.ok) {
        const data = await complaintsRes.value.json();
        setComplaints(data.data ?? data);
      }

      setLastUpdated(new Date());
    } catch { /* ignore */ }
  }

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(complaints.length / itemsPerPage);

  // Paginated complaints
  const paginatedComplaints = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return complaints.slice(start, start + itemsPerPage);
  }, [complaints, currentPage]);

  // Handle refresh to reset page
  async function fetchAll() {
    setLoading(true);
    await loadData();
    setCurrentPage(1);
    setLoading(false);
  }

  useEffect(() => {
    loadData().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilter]);

  const total = stats
    ? stats.pendingCount + stats.inProgressCount + stats.resolvedCount + stats.rejectedCount + stats.closedCount
    : 0;

  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  const resolutionRate = stats && total > 0
    ? Math.round(((stats.resolvedCount + stats.closedCount) / total) * 100)
    : 0;

  const statusRows = useMemo(() => stats ? [
    { key: "pending",     label: "รอดำเนินการ",    count: stats.pendingCount },
    { key: "in_progress", label: "กำลังดำเนินการ", count: stats.inProgressCount },
    { key: "resolved",    label: "แก้ไขแล้ว",      count: stats.resolvedCount },
    { key: "rejected",    label: "ปฏิเสธ",         count: stats.rejectedCount },
    { key: "closed",      label: "ปิดแล้ว",        count: stats.closedCount },
  ] : [], [stats]);

  const donutSegments = useMemo(() => stats ? [
    { label: "รอดำเนินการ",    value: stats.pendingCount,    color: "#f59e0b" },
    { label: "กำลังดำเนินการ", value: stats.inProgressCount, color: "#6366f1" },
    { label: "แก้ไขแล้ว",      value: stats.resolvedCount,   color: "#10b981" },
    { label: "ปฏิเสธ",         value: stats.rejectedCount,   color: "#f43f5e" },
    { label: "ปิดแล้ว",        value: stats.closedCount,     color: "#6b7280" },
  ] : [], [stats]);

  // Channel analysis from complaints
  const channelData = useMemo(() => {
    const map: Record<string, number> = {};
    complaints.forEach(c => {
      const ch = c.intake_channel || "ไม่ระบุ";
      map[ch] = (map[ch] || 0) + 1;
    });
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
    const max = entries.length > 0 ? entries[0][1] : 1;
    const colors = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#0ea5e9", "#8b5cf6"];
    return entries.slice(0, 6).map(([name, count], i) => ({
      name, count, pct: Math.round((count / max) * 100), color: colors[i % colors.length],
    }));
  }, [complaints]);

  // Soi/Location analysis
  const soiData = useMemo(() => {
    const map: Record<string, number> = {};
    complaints.forEach(c => {
      const s = c.soi || "ไม่ระบุ";
      map[s] = (map[s] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [complaints]);

  return (
    <div className="grid gap-5">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-black/5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <div>
          <h2 className="m-0 text-[22px] font-bold text-gray-900 flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            รายงานสรุปผลการดำเนินงาน (Executive Summary)
          </h2>
          <p className="mt-1.5 m-0 text-sm text-gray-500">
            {lastUpdated ? `ข้อมูลอัปเดตล่าสุด: ${lastUpdated.toLocaleDateString("th-TH", { day: 'numeric', month: 'long', year: 'numeric' })} เวลา ${lastUpdated.toLocaleTimeString("th-TH")}` : "กำลังโหลดข้อมูล..."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
            <button onClick={() => setDateFilter("all")} className={`px-4 py-2 rounded-md text-[13px] font-medium transition-all ${dateFilter === "all" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-700"}`}>ทั้งหมด</button>
            <button onClick={() => setDateFilter("today")} className={`px-4 py-2 rounded-md text-[13px] font-medium transition-all ${dateFilter === "today" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-700"}`}>วันนี้</button>
            <button onClick={() => setDateFilter("week")} className={`px-4 py-2 rounded-md text-[13px] font-medium transition-all ${dateFilter === "week" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-700"}`}>7 วันล่าสุด</button>
            <button onClick={() => setDateFilter("month")} className={`px-4 py-2 rounded-md text-[13px] font-medium transition-all ${dateFilter === "month" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-700"}`}>เดือนนี้</button>
          </div>
          <button onClick={fetchAll} disabled={loading} className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white text-gray-700 cursor-pointer transition-all hover:bg-gray-50 disabled:opacity-60" title="รีเฟรช">
            <IconRefresh />
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg border-none bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-sm font-semibold cursor-pointer transition-all shadow-[0_4px_14px_rgba(99,102,241,0.35)] hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(99,102,241,0.45)]"
            onClick={() => { window.print(); }}>
            <IconDownload /> ออกรายงาน (Print)
          </button>
        </div>
      </div>

      {/* ── Key Insights (AI Simulation) ── */}
      <div className="bg-gradient-to-r from-violet-50 via-indigo-50 to-white rounded-2xl border border-violet-100 p-5 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        </div>
        <div className="relative z-10">
          <h3 className="text-[15px] font-bold text-indigo-900 flex items-center gap-2 m-0 mb-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600">✨</span>
            สรุปข้อมูลสำคัญ (Key Insights)
          </h3>
          {loading ? (
            <div className="flex flex-col gap-2"><Skeleton h="14px" w="80%" /><Skeleton h="14px" w="60%" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/60 rounded-xl p-3 border border-white/80">
                <p className="text-xs text-gray-500 m-0 mb-1">ประสิทธิภาพการแก้ไข</p>
                <p className="text-[13px] text-gray-800 m-0 font-medium">ปัจจุบันมีอัตราสำเร็จ <strong className="text-emerald-600">{resolutionRate}%</strong> ถือว่า<span className={resolutionRate > 50 ? "text-emerald-600" : "text-amber-600"}>{resolutionRate > 50 ? "อยู่ในเกณฑ์ดีมาก" : "ต้องเร่งดำเนินการ"}</span></p>
              </div>
              <div className="bg-white/60 rounded-xl p-3 border border-white/80">
                <p className="text-xs text-gray-500 m-0 mb-1">เรื่องค้างสะสม</p>
                <p className="text-[13px] text-gray-800 m-0 font-medium">มีรอดำเนินการ <strong className="text-amber-600">{stats?.pendingCount ?? 0} เรื่อง</strong> {(stats?.pendingCount ?? 0) > 0 ? "ฝ่ายช่างควรเข้าตรวจสอบทันที" : "จัดการได้ครบถ้วน"}</p>
              </div>
              <div className="bg-white/60 rounded-xl p-3 border border-white/80">
                <p className="text-xs text-gray-500 m-0 mb-1">ช่องทางยอดฮิต</p>
                <p className="text-[13px] text-gray-800 m-0 font-medium">ลูกบ้านนิยมแจ้งผ่าน <strong className="text-indigo-600">{channelData.length > 0 ? channelData[0].name : "แอปพลิเคชัน"}</strong> มากที่สุด</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="เรื่องร้องเรียนทั้งหมด" value={stats?.totalComplaints ?? 0}
          sub={`วันนี้ +${stats?.todayCount ?? 0} เรื่อง`} color="indigo" icon={<IconTicket />} loading={loading} trend={[10, 15, 8, 20, 25, 18, 30]} />
        <StatCard label="รอดำเนินการ" value={stats?.pendingCount ?? 0}
          sub="ต้องรีบดำเนินการ" color="amber" icon={<IconClock />} loading={loading} trend={[5, 10, 8, 12, 6, 8, 4]} />
        <StatCard label="แก้ไขสำเร็จ" value={(stats?.resolvedCount ?? 0) + (stats?.closedCount ?? 0)}
          sub={`อัตราสำเร็จ ${resolutionRate}%`} color="emerald" icon={<IconCheck />} loading={loading} trend={[2, 5, 10, 15, 20, 28, 35]} />
        <StatCard label="ผู้ใช้งานในระบบ" value={stats?.totalUsers ?? 0}
          sub={`นิติ ${stats?.totalStaff ?? 0} | ลูกบ้าน ${stats?.totalResidents ?? 0}`}
          color="violet" icon={<IconUsers />} loading={loading} trend={[50, 52, 55, 58, 65, 70, 75]} />
      </div>

      {/* ── Key Metrics ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-xl p-5 px-5 text-center border border-gray-100 transition-transform duration-200 hover:-translate-y-[1px]">
          {loading ? <Skeleton w="50px" h="24px" /> : (
            <div className={`text-2xl font-bold leading-[1.2] ${resolutionRate >= 70 ? "text-emerald-600" : resolutionRate >= 40 ? "text-amber-600" : "text-rose-600"}`}>
              {resolutionRate}%
            </div>
          )}
          <div className="text-xs text-gray-500 mt-1">อัตราการแก้ไขสำเร็จ</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-5 px-5 text-center border border-gray-100 transition-transform duration-200 hover:-translate-y-[1px]">
          {loading ? <Skeleton w="50px" h="24px" /> : (
            <div className={`text-2xl font-bold leading-[1.2] ${(stats?.pendingCount ?? 0) > 5 ? "text-rose-600" : "text-emerald-600"}`}>
              {stats?.pendingCount ?? 0}
            </div>
          )}
          <div className="text-xs text-gray-500 mt-1">เรื่องค้างรอดำเนินการ</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-5 px-5 text-center border border-gray-100 transition-transform duration-200 hover:-translate-y-[1px]">
          {loading ? <Skeleton w="50px" h="24px" /> : (
            <div className="text-2xl font-bold leading-[1.2] text-indigo-600">{stats?.todayCount ?? 0}</div>
          )}
          <div className="text-xs text-gray-500 mt-1">เรื่องร้องเรียนวันนี้</div>
        </div>
      </div>

      {/* ── Row: Donut + Status Bars ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Donut Chart */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <p className="text-[15px] font-semibold text-gray-900 m-0">สัดส่วนสถานะ</p>
              <p className="text-xs text-gray-400 mt-0.5 m-0">แผนภูมิวงกลมแสดงสัดส่วนแต่ละสถานะ</p>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex gap-6 items-center">
                <Skeleton w="180px" h="180px" />
                <div className="flex-1 flex flex-col gap-2.5">
                  {[1,2,3,4,5].map(i => <Skeleton key={i} h="16px" />)}
                </div>
              </div>
            ) : (
              <DonutChart segments={donutSegments} total={total} />
            )}
          </div>
        </div>

        {/* Status Bars */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <p className="text-[15px] font-semibold text-gray-900 m-0">สถานะเรื่องร้องเรียน</p>
              <p className="text-xs text-gray-400 mt-0.5 m-0">จำนวนและสัดส่วนแต่ละสถานะ</p>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col gap-4">
                {[1,2,3,4,5].map(i => <Skeleton key={i} h="14px" />)}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {statusRows.map(row => (
                  <div key={row.key} className="flex items-center gap-3">
                    <span className="text-[13px] text-gray-700 w-[110px] shrink-0 whitespace-nowrap overflow-hidden text-ellipsis">{row.label}</span>
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-800 ease-out ${
                        row.key === 'pending' ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                        row.key === 'in_progress' ? 'bg-gradient-to-r from-indigo-500 to-indigo-400' :
                        row.key === 'resolved' ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                        row.key === 'rejected' ? 'bg-gradient-to-r from-rose-500 to-rose-400' :
                        'bg-gradient-to-r from-gray-500 to-gray-400'
                      }`} style={{ width: `${pct(row.count)}%` }} />
                    </div>
                    <span className="text-[13px] font-semibold text-gray-700 w-8 text-right shrink-0">{row.count}</span>
                    <span className="text-xs text-gray-400 w-9 text-right shrink-0">{pct(row.count)}%</span>
                  </div>
                ))}
                {total === 0 && <div className="flex flex-col items-center justify-center p-10 py-5 text-sm text-gray-400 gap-2">ยังไม่มีข้อมูลเรื่องร้องเรียน</div>}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100 text-[13px] text-gray-500">
            <span>รวมทั้งหมด</span>
            <strong className="text-gray-900 font-bold">{stats?.totalComplaints ?? 0} เรื่อง</strong>
          </div>
        </div>
      </div>

      {/* ── Row: Channel + Location ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Intake Channel */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <p className="text-[15px] font-semibold text-gray-900 m-0">ช่องทางรับเรื่อง</p>
              <p className="text-xs text-gray-400 mt-0.5 m-0">สถิติตามช่องทางที่แจ้ง</p>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col gap-3.5">
                {[1,2,3].map(i => <Skeleton key={i} h="36px" />)}
              </div>
            ) : channelData.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 py-5 text-sm text-gray-400 gap-2">ยังไม่มีข้อมูลช่องทาง</div>
            ) : (
              <div className="flex flex-col gap-3">
                {channelData.map(ch => (
                  <div key={ch.name} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-base" style={{ background: `${ch.color}18`, color: ch.color }}>
                      <IconTrendUp />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-gray-900">{ch.name}</div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                        <div className="h-full rounded-full transition-all duration-800 ease-out"
                          style={{ width: `${ch.pct}%`, background: ch.color }} />
                      </div>
                    </div>
                    <span className="text-[13px] font-semibold text-gray-700 shrink-0">{ch.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Location / Soi */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <p className="text-[15px] font-semibold text-gray-900 m-0">พื้นที่ที่มีการร้องเรียน</p>
              <p className="text-xs text-gray-400 mt-0.5 m-0">ซอย/ตำแหน่งที่พบบ่อย</p>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col gap-3.5">
                {[1,2,3,4].map(i => <Skeleton key={i} h="36px" />)}
              </div>
            ) : soiData.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 py-5 text-sm text-gray-400 gap-2">ยังไม่มีข้อมูลพื้นที่</div>
            ) : (
              <div className="flex flex-col gap-3">
                {soiData.map(([soi, count], idx) => {
                  const max = soiData[0][1] as number;
                  const soiColors = ["#7c3aed", "#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#f43f5e", "#ec4899", "#8b5cf6"];
                  const c = soiColors[idx % soiColors.length];
                  return (
                    <div key={soi} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-[13px] font-semibold" style={{ background: `${c}18`, color: c }}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-gray-900">{soi}</div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                          <div className="h-full rounded-full transition-all duration-800 ease-out"
                            style={{ width: `${Math.round(((count as number) / max) * 100)}%`, background: c }} />
                        </div>
                      </div>
                      <span className="text-[13px] font-semibold text-gray-700 shrink-0">{count as number}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Complaints Table ── */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <p className="text-[15px] font-semibold text-gray-900 m-0">รายการร้องเรียนทั้งหมด</p>
            <p className="text-xs text-gray-400 mt-0.5 m-0">แสดงรายการเรื่องร้องเรียนทั้งหมดในระบบ</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="px-6 py-5 flex flex-col gap-3">
              {[1,2,3,4,5].map(i => <Skeleton key={i} h="44px" />)}
            </div>
          ) : paginatedComplaints.length === 0 ? (
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
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-50 border-b border-gray-100">ช่องทาง</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-50 border-b border-gray-100">วันที่แจ้ง</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedComplaints.map(c => (
                      <tr key={c.complaint_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3.5 border-b border-gray-50 text-gray-700 align-middle"><span className="font-mono text-xs text-violet-600 font-semibold">{c.ticket_no ?? `#${c.complaint_id}`}</span></td>
                        <td className="px-4 py-3.5 border-b border-gray-50 text-gray-700 align-middle"><span className="max-w-[180px] whitespace-nowrap overflow-hidden text-ellipsis font-medium text-gray-900">{c.subject}</span></td>
                        <td className="px-4 py-3.5 border-b border-gray-50 text-gray-500 align-middle">{c.resident_name ?? "—"}</td>
                        <td className="px-4 py-3.5 border-b border-gray-50 text-gray-700 align-middle"><StatusBadge status={c.status} /></td>
                        <td className="px-4 py-3.5 border-b border-gray-50 text-gray-500 text-xs align-middle">{c.intake_channel ?? "—"}</td>
                        <td className="px-4 py-3.5 border-b border-gray-50 text-gray-400 text-xs align-middle">
                          {c.reported_date ? new Date(c.reported_date).toLocaleDateString("th-TH") : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="sm:hidden divide-y divide-gray-100">
                {paginatedComplaints.map(c => (
                  <div key={c.complaint_id} className="p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-violet-600 font-semibold">{c.ticket_no ?? `#${c.complaint_id}`}</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="text-sm font-semibold text-gray-800 truncate">
                      {c.subject}
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>ผู้แจ้ง: {c.resident_name ?? "—"} ({c.intake_channel ?? "—"})</span>
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
        
        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gray-50 border-t border-gray-100 text-[13px]">
          <span className="text-gray-500 text-center sm:text-left">
            แสดง {paginatedComplaints.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} ถึง {Math.min(currentPage * itemsPerPage, complaints.length)} จาก {complaints.length} รายการ
          </span>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 disabled:opacity-50 hover:bg-gray-50 cursor-pointer font-medium transition-colors"
            >
              ก่อนหน้า
            </button>
            <div className="px-3 py-1.5 font-medium text-gray-900 bg-white border border-gray-200 rounded-lg">
              {currentPage} / {totalPages || 1}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 disabled:opacity-50 hover:bg-gray-50 cursor-pointer font-medium transition-colors"
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>

      <div className="h-2" />
    </div>
  );
}
