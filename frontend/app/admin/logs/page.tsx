"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import api from "@/lib/api";
/* ===== Types ===== */
interface AuditLog {
  log_id: string | number;
  user_id: string;
  username?: string;
  action: string;
  entity: string;
  entity_id: string | number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details: any;
  ip_address: string;
  created_at: string;
}

/* ===== SVG Icons ===== */
const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconRefresh = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);
const IconDatabase = () => (
  <svg className="w-12 h-12 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);
const IconChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IconChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 6 15 12 9 18" />
  </svg>
);

/* ===== Helpers ===== */

function getActionStyle(action: string) {
  const a = action.toLowerCase();
  if (a.includes("update") || a.includes("edit")) return "bg-blue-50 text-blue-600";
  if (a.includes("create") || a.includes("insert") || a.includes("add")) return "bg-emerald-50 text-emerald-600";
  if (a.includes("delete") || a.includes("remove")) return "bg-red-50 text-red-600";
  if (a.includes("login") || a.includes("auth")) return "bg-purple-50 text-purple-600";
  if (a.includes("status")) return "bg-amber-50 text-amber-600";
  return "bg-gray-100 text-gray-700"; // default
}

function formatActionLabel(action: string) {
  return action.replace(/_/g, " ").toUpperCase();
}

function formatDate(isoStr: string) {
  if (!isoStr) return { date: "—", time: "—" };
  const d = new Date(isoStr);
  return {
    date: d.toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  };
}

/* ===== Skeleton Loader ===== */
function Skeleton({ w, h }: { w?: string; h?: string }) {
  return <div className="rounded-md bg-[linear-gradient(90deg,#f3f4f6_25%,#e5e7eb_50%,#f3f4f6_75%)] bg-[length:200%_100%] animate-[dash-shimmer_1.5s_infinite]" style={{ width: w ?? "100%", height: h ?? "16px" }} />;
}

/* ===== Constants ===== */
const ITEMS_PER_PAGE = 15;

/* ===== Main Page Component ===== */
export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  /* ── Fetch Logs ── */
  const fetchLogs = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/logs');
      if (data.success || Array.isArray(data.data)) {
        const list: AuditLog[] = data.data ?? data;
        setLogs(list);
      } else {
        setLogs([]);
      }
      setLastUpdated(new Date());
    } catch {
      setLogs([]);
    }
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    await fetchLogs();
    setLoading(false);
  }, [fetchLogs]);

  useEffect(() => {
    fetchLogs().finally(() => setLoading(false));
  }, [fetchLogs]);

  /* ── Filtered & Searched Logs ── */
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Filter by action
      if (filterAction !== "all" && log.action !== filterAction) return false;
      // Search
      if (search) {
        const q = search.toLowerCase();
        return (
          (log.username || "").toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q) ||
          log.entity.toLowerCase().includes(q) ||
          String(log.entity_id).toLowerCase().includes(q) ||
          (log.ip_address || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [logs, search, filterAction]);

  /* ── Pagination ── */
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / ITEMS_PER_PAGE));
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLogs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLogs, currentPage]);

  // Reset page when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterAction]);

  /* ── Unique Actions for Filter ── */
  const availableActions = useMemo(() => {
    const actions = new Set<string>();
    logs.forEach(l => actions.add(l.action));
    return Array.from(actions).sort();
  }, [logs]);

  /* ── Pagination page numbers ── */
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto pb-10">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 m-0 mb-1 tracking-tight">Audit Logs</h2>
          <p className="text-sm text-gray-500 m-0">
            {lastUpdated
              ? `อัปเดตล่าสุด ${lastUpdated.toLocaleTimeString("th-TH")} • บันทึกระบบทั้งหมด ${logs.length} รายการ`
              : "กำลังโหลดข้อมูล..."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={reload} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 cursor-pointer shadow-sm transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed" id="logs-refresh-btn">
            <IconRefresh /> รีเฟรช
          </button>
        </div>
      </div>

      {/* ── Search & Filter Toolbar ── */}
      <div className="flex flex-col md:flex-row flex-wrap gap-4 items-stretch md:items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 min-w-[250px]">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none">
            <IconSearch />
          </div>
          <input
            type="text"
            className="w-full py-2.5 px-4 pl-10 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none transition-all duration-200 focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] placeholder:text-gray-400"
            placeholder="ค้นหาชื่อผู้ใช้, IP Address, หรือ Entity ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="log-search-input"
          />
        </div>
        <select
          className="py-2.5 pl-4 pr-9 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white cursor-pointer outline-none transition-all duration-200 focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg_xmlns=\'http://www.w3.org/2000/svg\'_fill=\'none\'_viewBox=\'0_0_20_20\'%3E%3Cpath_stroke=\'%236B7280\'_stroke-linecap=\'round\'_stroke-linejoin=\'round\'_stroke-width=\'1.5\'_d=\'m6_8_4_4_4-4\'/%3E%3C/svg%3E')] bg-[position:right_8px_center] bg-no-repeat bg-[size:20px_20px]"
          value={filterAction}
          onChange={e => setFilterAction(e.target.value)}
          id="log-action-filter"
        >
          <option value="all">ทุกการกระทำ (All Actions)</option>
          {availableActions.map(action => (
            <option key={action} value={action}>{action}</option>
          ))}
        </select>
        <span className="text-sm text-gray-500 text-right md:ml-auto">
          แสดง {paginatedLogs.length} จาก {filteredLogs.length} รายการ
        </span>
      </div>

      {/* ── Logs Table ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="w-full overflow-x-auto">
          {loading ? (
            <div className="p-6 flex flex-col gap-3.5">
              {[1, 2, 3, 4, 5, 6, 7].map(i => <Skeleton key={i} h="56px" />)}
            </div>
          ) : paginatedLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-[60px] px-5 text-gray-500 text-[15px] text-center">
              <IconDatabase />
              <div className="mt-4">
              {search || filterAction !== "all"
                ? "ไม่พบข้อมูล Logs ที่ตรงกับเงื่อนไข"
                : "ยังไม่มีประวัติการทำงานในระบบ"}
              </div>
            </div>
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden sm:block">
                <table className="w-full text-left border-collapse whitespace-nowrap" id="audit-logs-table">
                  <thead>
                    <tr>
                      <th className="bg-gray-50 px-5 py-3.5 text-[13px] font-semibold text-gray-600 border-b border-gray-100">วันเวลา</th>
                      <th className="bg-gray-50 px-5 py-3.5 text-[13px] font-semibold text-gray-600 border-b border-gray-100">ผู้ดำเนินการ</th>
                      <th className="bg-gray-50 px-5 py-3.5 text-[13px] font-semibold text-gray-600 border-b border-gray-100">IP Address</th>
                      <th className="bg-gray-50 px-5 py-3.5 text-[13px] font-semibold text-gray-600 border-b border-gray-100">การกระทำ (Action)</th>
                      <th className="bg-gray-50 px-5 py-3.5 text-[13px] font-semibold text-gray-600 border-b border-gray-100">ส่วนที่เกี่ยวข้อง (Entity)</th>
                      <th className="bg-gray-50 px-5 py-3.5 text-[13px] font-semibold text-gray-600 border-b border-gray-100">รายละเอียด (Details)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLogs.map((log, idx) => {
                      const { date, time } = formatDate(log.created_at);
                      return (
                        <tr key={log.log_id ?? idx} className="hover:bg-slate-50 transition-colors duration-150">
                          {/* ── Date/Time ── */}
                          <td className="px-5 py-4 text-sm text-gray-900 border-b border-gray-100 align-middle">
                            <div className="flex flex-col">
                              <span>{date}</span>
                              <span className="text-xs text-gray-500 mt-0.5">{time}</span>
                            </div>
                          </td>

                          {/* ── User ── */}
                          <td className="px-5 py-4 text-sm text-gray-900 border-b border-gray-100 align-middle">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold text-sm shrink-0">
                                {(log.username || "?").charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span>{log.username || "System/Unknown"}</span>
                                {log.user_id && (
                                  <span className="text-xs text-gray-400 mt-0.5" title={log.user_id}>
                                    {log.user_id.substring(0, 8)}...
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* ── IP Address ── */}
                          <td className="px-5 py-4 text-[13px] text-gray-500 border-b border-gray-100 align-middle">
                            {log.ip_address || "—"}
                          </td>

                          {/* ── Action ── */}
                          <td className="px-5 py-4 text-sm text-gray-900 border-b border-gray-100 align-middle">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getActionStyle(log.action)}`}>
                              {formatActionLabel(log.action)}
                            </span>
                          </td>

                          {/* ── Entity ── */}
                          <td className="px-5 py-4 text-sm text-gray-900 border-b border-gray-100 align-middle">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">{log.entity.toUpperCase()}</span>
                              <span className="text-[13px] text-gray-400">
                                #{log.entity_id}
                              </span>
                            </div>
                          </td>

                          {/* ── Details ── */}
                          <td className="px-5 py-4 text-sm text-gray-900 border-b border-gray-100 align-middle">
                            {log.details && Object.keys(log.details).length > 0 ? (
                              <div className="bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2.5 font-mono text-xs text-slate-700 max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap" title={JSON.stringify(log.details, null, 2)}>
                                {JSON.stringify(log.details)}
                              </div>
                            ) : (
                              <span className="text-[13px] text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="sm:hidden divide-y divide-gray-100">
                {paginatedLogs.map((log, idx) => {
                  const { date, time } = formatDate(log.created_at);
                  return (
                    <div key={log.log_id ?? idx} className="p-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getActionStyle(log.action)}`}>
                          {formatActionLabel(log.action)}
                        </span>
                        <div className="text-[11px] text-gray-400 text-right">
                          <span>{date} {time}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold text-[11px] shrink-0">
                          {(log.username || "?").charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold text-gray-800">{log.username || "System/Unknown"}</span>
                        <span className="text-xs text-gray-400">({log.ip_address || "—"})</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">{log.entity.toUpperCase()}</span>
                        <span>ID: #{log.entity_id}</span>
                      </div>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="mt-1 p-2 bg-gray-50 rounded-lg text-[11px] text-gray-600 font-mono break-all max-h-24 overflow-y-auto">
                          {JSON.stringify(log.details)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ── Pagination ── */}
        {!loading && filteredLogs.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-center gap-1 p-4 bg-white border-t border-gray-100">
            <button
              className="flex items-center justify-center w-9 h-9 rounded-lg border border-transparent bg-transparent text-gray-600 text-sm font-medium cursor-pointer transition-all duration-200 hover:not(:disabled):bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="หน้าก่อนหน้า"
            >
              <span className="w-4 h-4"><IconChevronLeft /></span>
            </button>
            {pageNumbers.map(n => (
              <button
                key={n}
                className={`flex items-center justify-center w-9 h-9 rounded-lg border border-transparent text-sm cursor-pointer transition-all duration-200 hover:not(:disabled):bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed ${n === currentPage ? 'bg-indigo-500 text-white font-semibold hover:not(:disabled):bg-indigo-500' : 'bg-transparent text-gray-600 font-medium'}`}
                onClick={() => setCurrentPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              className="flex items-center justify-center w-9 h-9 rounded-lg border border-transparent bg-transparent text-gray-600 text-sm font-medium cursor-pointer transition-all duration-200 hover:not(:disabled):bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="หน้าถัดไป"
            >
              <span className="w-4 h-4"><IconChevronRight /></span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
