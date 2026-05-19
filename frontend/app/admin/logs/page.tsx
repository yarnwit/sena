"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import "./logs.css";

/* ===== Types ===== */
interface AuditLog {
  log_id: string | number;
  user_id: string;
  username?: string;
  action: string;
  entity: string;
  entity_id: string | number;
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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

function getToken() {
  try { return localStorage.getItem("accessToken") ?? ""; } catch { return ""; }
}

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
}

function getActionStyle(action: string) {
  const a = action.toLowerCase();
  if (a.includes("update") || a.includes("edit")) return "update";
  if (a.includes("create") || a.includes("insert") || a.includes("add")) return "create";
  if (a.includes("delete") || a.includes("remove")) return "delete";
  if (a.includes("login") || a.includes("auth")) return "login";
  if (a.includes("status")) return "status";
  return "update"; // default
}

function formatActionLabel(action: string) {
  // Can be formatted mapping if needed
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
  return <div className="logs-skeleton" style={{ width: w ?? "100%", height: h ?? "16px" }} />;
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
      const res = await fetch(`${API}/admin/logs`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
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
    <div className="logs-grid">
      {/* ── Header ── */}
      <div className="logs-header">
        <div className="logs-header-left">
          <h2>Audit Logs</h2>
          <p>
            {lastUpdated
              ? `อัปเดตล่าสุด ${lastUpdated.toLocaleTimeString("th-TH")} • บันทึกระบบทั้งหมด ${logs.length} รายการ`
              : "กำลังโหลดข้อมูล..."}
          </p>
        </div>
        <div className="logs-header-actions">
          <button onClick={reload} disabled={loading} className="logs-refresh-btn" id="logs-refresh-btn">
            <IconRefresh /> รีเฟรช
          </button>
        </div>
      </div>

      {/* ── Search & Filter Toolbar ── */}
      <div className="logs-toolbar">
        <div className="logs-search-box">
          <IconSearch />
          <input
            type="text"
            className="logs-search-input"
            placeholder="ค้นหาชื่อผู้ใช้, IP Address, หรือ Entity ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="log-search-input"
          />
        </div>
        <select
          className="logs-filter-select"
          value={filterAction}
          onChange={e => setFilterAction(e.target.value)}
          id="log-action-filter"
        >
          <option value="all">ทุกการกระทำ (All Actions)</option>
          {availableActions.map(action => (
            <option key={action} value={action}>{action}</option>
          ))}
        </select>
        <span className="logs-result-count">
          แสดง {paginatedLogs.length} จาก {filteredLogs.length} รายการ
        </span>
      </div>

      {/* ── Logs Table ── */}
      <div className="logs-table-card">
        <div className="logs-table-wrap">
          {loading ? (
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 14 }}>
              {[1, 2, 3, 4, 5, 6, 7].map(i => <Skeleton key={i} h="56px" />)}
            </div>
          ) : paginatedLogs.length === 0 ? (
            <div className="logs-empty">
              <IconDatabase />
              {search || filterAction !== "all"
                ? "ไม่พบข้อมูล Logs ที่ตรงกับเงื่อนไข"
                : "ยังไม่มีประวัติการทำงานในระบบ"}
            </div>
          ) : (
            <table className="logs-table" id="audit-logs-table">
              <thead>
                <tr>
                  <th>วันเวลา</th>
                  <th>ผู้ดำเนินการ</th>
                  <th>IP Address</th>
                  <th>การกระทำ (Action)</th>
                  <th>ส่วนที่เกี่ยวข้อง (Entity)</th>
                  <th>รายละเอียด (Details)</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map((log, idx) => {
                  const { date, time } = formatDate(log.created_at);
                  return (
                    <tr key={log.log_id ?? idx}>
                      {/* ── Date/Time ── */}
                      <td>
                        <div className="logs-date-cell">
                          <span>{date}</span>
                          <span className="time">{time}</span>
                        </div>
                      </td>

                      {/* ── User ── */}
                      <td>
                        <div className="logs-user-cell">
                          <div className="logs-user-avatar">
                            {(log.username || "?").charAt(0).toUpperCase()}
                          </div>
                          <div className="logs-user-info">
                            <span>{log.username || "System/Unknown"}</span>
                            {log.user_id && (
                              <span className="logs-user-id" title={log.user_id}>
                                {log.user_id.substring(0, 8)}...
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* ── IP Address ── */}
                      <td style={{ color: "#6b7280", fontSize: 13 }}>
                        {log.ip_address || "—"}
                      </td>

                      {/* ── Action ── */}
                      <td>
                        <span className={`logs-action-badge ${getActionStyle(log.action)}`}>
                          {formatActionLabel(log.action)}
                        </span>
                      </td>

                      {/* ── Entity ── */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span className="logs-entity-badge">{log.entity.toUpperCase()}</span>
                          <span style={{ fontSize: 13, color: "#9ca3af" }}>
                            #{log.entity_id}
                          </span>
                        </div>
                      </td>

                      {/* ── Details ── */}
                      <td>
                        {log.details && Object.keys(log.details).length > 0 ? (
                          <div className="logs-details-box" title={JSON.stringify(log.details, null, 2)}>
                            {JSON.stringify(log.details)}
                          </div>
                        ) : (
                          <span style={{ color: "#9ca3af", fontSize: 13 }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Pagination ── */}
        {!loading && filteredLogs.length > ITEMS_PER_PAGE && (
          <div className="logs-pagination">
            <button
              className="logs-page-btn"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="หน้าก่อนหน้า"
            >
              <IconChevronLeft />
            </button>
            {pageNumbers.map(n => (
              <button
                key={n}
                className={`logs-page-btn ${n === currentPage ? "active" : ""}`}
                onClick={() => setCurrentPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              className="logs-page-btn"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="หน้าถัดไป"
            >
              <IconChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
