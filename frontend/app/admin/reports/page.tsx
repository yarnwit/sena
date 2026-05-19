"use client";

import { useState, useEffect, useMemo } from "react";
import "./reports.css";

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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
  </svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  return <div className="reports-skeleton" style={{ width: w ?? "100%", height: h ?? "16px" }} />;
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`reports-badge ${status}`}>
      <span className={`reports-badge-dot ${status}`} />
      {statusLabel(status)}
    </span>
  );
}

function StatCard({ label, value, sub, color, icon, loading }: {
  label: string; value: number | string; sub?: string;
  color: string; icon: React.ReactNode; loading: boolean;
}) {
  return (
    <div className="reports-stat-card">
      <div className={`reports-stat-icon ${color}`}>{icon}</div>
      <div className="reports-stat-body">
        <div className="reports-stat-label">{label}</div>
        {loading ? <Skeleton w="60px" h="28px" /> : <div className="reports-stat-value">{value}</div>}
        {sub && !loading && <div className="reports-stat-sub">{sub}</div>}
      </div>
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
    <div className="reports-donut-container">
      <div className="reports-donut-wrapper">
        <svg className="reports-donut-svg" viewBox="0 0 180 180">
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
        <div className="reports-donut-center">
          <div className="reports-donut-center-value">{total}</div>
          <div className="reports-donut-center-label">เรื่องทั้งหมด</div>
        </div>
      </div>
      <div className="reports-donut-legend">
        {segments.map(seg => (
          <div key={seg.label} className="reports-donut-legend-item">
            <div className="reports-donut-legend-dot" style={{ background: seg.color }} />
            <span className="reports-donut-legend-label">{seg.label}</span>
            <span className="reports-donut-legend-val">{seg.value}</span>
            <span className="reports-donut-legend-pct">
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

  async function loadData() {
    try {
      const headers = authHeaders();
      const [reportRes, complaintsRes] = await Promise.allSettled([
        fetch(`${API}/admin/reports`, { headers }),
        fetch(`${API}/complaints?sort=desc`, { headers }),
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

  async function fetchAll() {
    setLoading(true);
    await loadData();
    setLoading(false);
  }

  useEffect(() => {
    loadData().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Recent complaints (top 10)
  const recentComplaints = useMemo(() => complaints.slice(0, 10), [complaints]);

  return (
    <div className="reports-grid">
      {/* ── Header ── */}
      <div className="reports-header">
        <div className="reports-header-left">
          <h2>รายงานสรุป</h2>
          <p>{lastUpdated ? `อัปเดตล่าสุด ${lastUpdated.toLocaleTimeString("th-TH")}` : "กำลังโหลดข้อมูล..."}</p>
        </div>
        <div className="reports-header-actions">
          <button onClick={fetchAll} disabled={loading} className="reports-refresh-btn" id="reports-refresh-btn">
            <IconRefresh /> รีเฟรช
          </button>
          <button className="reports-export-btn" id="reports-export-btn"
            onClick={() => { window.print(); }}>
            <IconDownload /> พิมพ์รายงาน
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="reports-stats-row">
        <StatCard label="เรื่องร้องเรียนทั้งหมด" value={stats?.totalComplaints ?? 0}
          sub={`วันนี้ +${stats?.todayCount ?? 0} เรื่อง`} color="indigo" icon={<IconTicket />} loading={loading} />
        <StatCard label="รอดำเนินการ" value={stats?.pendingCount ?? 0}
          sub="ต้องรีบดำเนินการ" color="amber" icon={<IconClock />} loading={loading} />
        <StatCard label="แก้ไขสำเร็จ" value={(stats?.resolvedCount ?? 0) + (stats?.closedCount ?? 0)}
          sub={`อัตราสำเร็จ ${resolutionRate}%`} color="emerald" icon={<IconCheck />} loading={loading} />
        <StatCard label="ผู้ใช้งานในระบบ" value={stats?.totalUsers ?? 0}
          sub={`นิติ ${stats?.totalStaff ?? 0} | ลูกบ้าน ${stats?.totalResidents ?? 0}`}
          color="violet" icon={<IconUsers />} loading={loading} />
      </div>

      {/* ── Key Metrics ── */}
      <div className="reports-metrics-row">
        <div className="reports-metric-card">
          {loading ? <Skeleton w="50px" h="24px" /> : (
            <div className={`reports-metric-value ${resolutionRate >= 70 ? "emerald" : resolutionRate >= 40 ? "amber" : "rose"}`}>
              {resolutionRate}%
            </div>
          )}
          <div className="reports-metric-label">อัตราการแก้ไขสำเร็จ</div>
        </div>
        <div className="reports-metric-card">
          {loading ? <Skeleton w="50px" h="24px" /> : (
            <div className={`reports-metric-value ${(stats?.pendingCount ?? 0) > 5 ? "rose" : "emerald"}`}>
              {stats?.pendingCount ?? 0}
            </div>
          )}
          <div className="reports-metric-label">เรื่องค้างรอดำเนินการ</div>
        </div>
        <div className="reports-metric-card">
          {loading ? <Skeleton w="50px" h="24px" /> : (
            <div className="reports-metric-value indigo">{stats?.todayCount ?? 0}</div>
          )}
          <div className="reports-metric-label">เรื่องร้องเรียนวันนี้</div>
        </div>
      </div>

      {/* ── Row: Donut + Status Bars ── */}
      <div className="reports-two-col">
        {/* Donut Chart */}
        <div className="reports-card">
          <div className="reports-card-header">
            <div>
              <p className="reports-card-title">สัดส่วนสถานะ</p>
              <p className="reports-card-subtitle">แผนภูมิวงกลมแสดงสัดส่วนแต่ละสถานะ</p>
            </div>
          </div>
          <div className="reports-card-body">
            {loading ? (
              <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                <Skeleton w="180px" h="180px" />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                  {[1,2,3,4,5].map(i => <Skeleton key={i} h="16px" />)}
                </div>
              </div>
            ) : (
              <DonutChart segments={donutSegments} total={total} />
            )}
          </div>
        </div>

        {/* Status Bars */}
        <div className="reports-card">
          <div className="reports-card-header">
            <div>
              <p className="reports-card-title">สถานะเรื่องร้องเรียน</p>
              <p className="reports-card-subtitle">จำนวนและสัดส่วนแต่ละสถานะ</p>
            </div>
          </div>
          <div className="reports-card-body">
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[1,2,3,4,5].map(i => <Skeleton key={i} h="14px" />)}
              </div>
            ) : (
              <div className="reports-bar-chart">
                {statusRows.map(row => (
                  <div key={row.key} className="reports-bar-row">
                    <span className="reports-bar-label">{row.label}</span>
                    <div className="reports-bar-track">
                      <div className={`reports-bar-fill ${row.key}`} style={{ width: `${pct(row.count)}%` }} />
                    </div>
                    <span className="reports-bar-count">{row.count}</span>
                    <span className="reports-bar-pct">{pct(row.count)}%</span>
                  </div>
                ))}
                {total === 0 && <div className="reports-empty">ยังไม่มีข้อมูลเรื่องร้องเรียน</div>}
              </div>
            )}
          </div>
          <div className="reports-footer-summary">
            <span>รวมทั้งหมด</span>
            <strong>{stats?.totalComplaints ?? 0} เรื่อง</strong>
          </div>
        </div>
      </div>

      {/* ── Row: Channel + Location ── */}
      <div className="reports-two-col">
        {/* Intake Channel */}
        <div className="reports-card">
          <div className="reports-card-header">
            <div>
              <p className="reports-card-title">ช่องทางรับเรื่อง</p>
              <p className="reports-card-subtitle">สถิติตามช่องทางที่แจ้ง</p>
            </div>
          </div>
          <div className="reports-card-body">
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[1,2,3].map(i => <Skeleton key={i} h="36px" />)}
              </div>
            ) : channelData.length === 0 ? (
              <div className="reports-empty">ยังไม่มีข้อมูลช่องทาง</div>
            ) : (
              <div className="reports-channel-list">
                {channelData.map(ch => (
                  <div key={ch.name} className="reports-channel-item">
                    <div className="reports-channel-icon" style={{ background: `${ch.color}18`, color: ch.color }}>
                      <IconTrendUp />
                    </div>
                    <div className="reports-channel-info">
                      <div className="reports-channel-name">{ch.name}</div>
                      <div className="reports-channel-bar">
                        <div className="reports-channel-bar-fill"
                          style={{ width: `${ch.pct}%`, background: ch.color }} />
                      </div>
                    </div>
                    <span className="reports-channel-count">{ch.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Location / Soi */}
        <div className="reports-card">
          <div className="reports-card-header">
            <div>
              <p className="reports-card-title">พื้นที่ที่มีการร้องเรียน</p>
              <p className="reports-card-subtitle">ซอย/ตำแหน่งที่พบบ่อย</p>
            </div>
          </div>
          <div className="reports-card-body">
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[1,2,3,4].map(i => <Skeleton key={i} h="36px" />)}
              </div>
            ) : soiData.length === 0 ? (
              <div className="reports-empty">ยังไม่มีข้อมูลพื้นที่</div>
            ) : (
              <div className="reports-channel-list">
                {soiData.map(([soi, count], idx) => {
                  const max = soiData[0][1] as number;
                  const soiColors = ["#7c3aed", "#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#f43f5e", "#ec4899", "#8b5cf6"];
                  const c = soiColors[idx % soiColors.length];
                  return (
                    <div key={soi} className="reports-channel-item">
                      <div className="reports-channel-icon" style={{ background: `${c}18`, color: c, fontSize: 13, fontWeight: 600 }}>
                        {idx + 1}
                      </div>
                      <div className="reports-channel-info">
                        <div className="reports-channel-name">{soi}</div>
                        <div className="reports-channel-bar">
                          <div className="reports-channel-bar-fill"
                            style={{ width: `${Math.round(((count as number) / max) * 100)}%`, background: c }} />
                        </div>
                      </div>
                      <span className="reports-channel-count">{count as number}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Complaints Table ── */}
      <div className="reports-card">
        <div className="reports-card-header">
          <div>
            <p className="reports-card-title">รายการร้องเรียนล่าสุด</p>
            <p className="reports-card-subtitle">10 รายการล่าสุดในระบบ</p>
          </div>
        </div>
        <div className="reports-table-wrap">
          {loading ? (
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
              {[1,2,3,4,5].map(i => <Skeleton key={i} h="44px" />)}
            </div>
          ) : recentComplaints.length === 0 ? (
            <div className="reports-empty">ยังไม่มีเรื่องร้องเรียน</div>
          ) : (
            <table className="reports-table" id="reports-complaints-table">
              <thead>
                <tr>
                  <th>เลขที่</th>
                  <th>หัวข้อ</th>
                  <th>ผู้แจ้ง</th>
                  <th>สถานะ</th>
                  <th>ช่องทาง</th>
                  <th>วันที่แจ้ง</th>
                </tr>
              </thead>
              <tbody>
                {recentComplaints.map(c => (
                  <tr key={c.complaint_id}>
                    <td><span className="reports-complaint-ticket">{c.ticket_no ?? `#${c.complaint_id}`}</span></td>
                    <td><span className="reports-complaint-subject">{c.subject}</span></td>
                    <td style={{ color: "#6b7280", fontSize: 13 }}>{c.resident_name ?? "—"}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td style={{ color: "#6b7280", fontSize: 12 }}>{c.intake_channel ?? "—"}</td>
                    <td style={{ color: "#9ca3af", fontSize: 12 }}>
                      {c.reported_date ? new Date(c.reported_date).toLocaleDateString("th-TH") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="reports-footer-summary">
          <span>แสดง {recentComplaints.length} จาก {complaints.length} รายการ</span>
          <strong>ทั้งหมด {stats?.totalComplaints ?? 0} เรื่อง</strong>
        </div>
      </div>

      <div style={{ height: 8 }} />
    </div>
  );
}
