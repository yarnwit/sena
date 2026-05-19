"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import "./users.css";

/* ===== Types ===== */
interface User {
  user_id: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface Toast {
  message: string;
  type: "success" | "error";
}

interface ModalData {
  user: User;
  action: "promote" | "demote";
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

const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconUserCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <polyline points="17 11 19 13 23 9" />
  </svg>
);

const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconArrowUp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

const IconArrowDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
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

const IconEmptyUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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

function roleLabel(role: string) {
  return { resident: "ลูกบ้าน", staff: "นิติบุคคล", admin: "แอดมิน" }[role] ?? role;
}

/* ===== Skeleton Loader ===== */
function Skeleton({ w, h }: { w?: string; h?: string }) {
  return <div className="users-skeleton" style={{ width: w ?? "100%", height: h ?? "16px" }} />;
}

/* ===== Constants ===== */
const ITEMS_PER_PAGE = 10;

/* ===== Main Page Component ===== */
export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Modal
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const [updating, setUpdating] = useState(false);

  // Toast
  const [toast, setToast] = useState<Toast | null>(null);

  /* ── Show Toast ── */
  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  /* ── Fetch Users ── */
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/users`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        const list: User[] = data.data ?? data;
        setUsers(list);
      } else {
        // Fallback: ถ้า API ยังไม่พร้อม
        setUsers([]);
      }
      setLastUpdated(new Date());
    } catch {
      setUsers([]);
    }
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    await fetchUsers();
    setLoading(false);
  }, [fetchUsers]);

  useEffect(() => {
    fetchUsers().finally(() => setLoading(false));
  }, [fetchUsers]);

  /* ── Role Change ── */
  async function handleRoleChange() {
    if (!modalData) return;
    setUpdating(true);

    const { user, action } = modalData;
    const newRole = action === "promote" ? "staff" : "resident";

    try {
      const res = await fetch(`${API}/admin/users/${user.user_id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        // อัปเดตใน state โดยตรงเพื่อ UX ที่เร็ว
        setUsers(prev => prev.map(u =>
          u.user_id === user.user_id ? { ...u, role: newRole } : u
        ));
        showToast(
          action === "promote"
            ? `เลื่อน ${user.first_name} ${user.last_name} เป็นนิติบุคคลสำเร็จ`
            : `ลดสิทธิ์ ${user.first_name} ${user.last_name} เป็นลูกบ้านสำเร็จ`,
          "success"
        );
      } else {
        const errData = await res.json().catch(() => null);
        showToast(errData?.message || "เกิดข้อผิดพลาดในการเปลี่ยนสิทธิ์", "error");
      }
    } catch {
      showToast("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้", "error");
    }

    setUpdating(false);
    setModalData(null);
  }

  /* ── Filtered & Searched Users ── */
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      // Filter by role
      if (filterRole !== "all" && u.role !== filterRole) return false;
      // Search
      if (search) {
        const q = search.toLowerCase();
        return (
          u.username.toLowerCase().includes(q) ||
          u.first_name.toLowerCase().includes(q) ||
          u.last_name.toLowerCase().includes(q) ||
          `${u.first_name} ${u.last_name}`.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [users, search, filterRole]);

  /* ── Pagination ── */
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  // Reset page when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterRole]);

  /* ── Stats ── */
  const stats = useMemo(() => ({
    total: users.length,
    residents: users.filter(u => u.role === "resident").length,
    staff: users.filter(u => u.role === "staff").length,
    admins: users.filter(u => u.role === "admin").length,
  }), [users]);

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
    <div className="users-grid">
      {/* ── Header ── */}
      <div className="users-header">
        <div className="users-header-left">
          <h2>จัดการผู้ใช้งาน</h2>
          <p>
            {lastUpdated
              ? `อัปเดตล่าสุด ${lastUpdated.toLocaleTimeString("th-TH")}`
              : "กำลังโหลดข้อมูล..."}
          </p>
        </div>
        <div className="users-header-actions">
          <button onClick={reload} disabled={loading} className="users-refresh-btn">
            <IconRefresh /> รีเฟรช
          </button>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="users-stats-row">
        <div className="users-stat-card">
          <div className="users-stat-icon violet"><IconUsers /></div>
          <div className="users-stat-body">
            <div className="users-stat-label">ผู้ใช้ทั้งหมด</div>
            {loading ? <Skeleton w="50px" h="26px" /> : <div className="users-stat-value">{stats.total}</div>}
          </div>
        </div>
        <div className="users-stat-card">
          <div className="users-stat-icon emerald"><IconHome /></div>
          <div className="users-stat-body">
            <div className="users-stat-label">ลูกบ้าน (Resident)</div>
            {loading ? <Skeleton w="50px" h="26px" /> : <div className="users-stat-value">{stats.residents}</div>}
          </div>
        </div>
        <div className="users-stat-card">
          <div className="users-stat-icon indigo"><IconUserCheck /></div>
          <div className="users-stat-body">
            <div className="users-stat-label">นิติบุคคล (Staff)</div>
            {loading ? <Skeleton w="50px" h="26px" /> : <div className="users-stat-value">{stats.staff}</div>}
          </div>
        </div>
        <div className="users-stat-card">
          <div className="users-stat-icon amber"><IconShield /></div>
          <div className="users-stat-body">
            <div className="users-stat-label">แอดมิน (Admin)</div>
            {loading ? <Skeleton w="50px" h="26px" /> : <div className="users-stat-value">{stats.admins}</div>}
          </div>
        </div>
      </div>

      {/* ── Search & Filter Toolbar ── */}
      <div className="users-toolbar">
        <div className="users-search-box">
          <IconSearch />
          <input
            type="text"
            className="users-search-input"
            placeholder="ค้นหาชื่อ, นามสกุล หรือ username..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="user-search-input"
          />
        </div>
        <select
          className="users-filter-select"
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          id="user-role-filter"
        >
          <option value="all">ทุก Role</option>
          <option value="resident">ลูกบ้าน</option>
          <option value="staff">นิติบุคคล</option>
          <option value="admin">แอดมิน</option>
        </select>
        <span className="users-result-count">
          แสดง {paginatedUsers.length} จาก {filteredUsers.length} รายการ
        </span>
      </div>

      {/* ── Users Table ── */}
      <div className="users-table-card">
        <div className="users-table-wrap">
          {loading ? (
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 14 }}>
              {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} h="52px" />)}
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div className="users-empty">
              <IconEmptyUser />
              {search || filterRole !== "all"
                ? "ไม่พบผู้ใช้ที่ตรงกับเงื่อนไขการค้นหา"
                : "ยังไม่มีข้อมูลผู้ใช้ในระบบ"}
            </div>
          ) : (
            <table className="users-table" id="users-management-table">
              <thead>
                <tr>
                  <th>ผู้ใช้งาน</th>
                  <th>Username</th>
                  <th>สิทธิ์ (Role)</th>
                  <th>จัดการสิทธิ์</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map(user => (
                  <tr key={user.user_id}>
                    {/* ── User Info ── */}
                    <td data-label="ผู้ใช้งาน">
                      <div className="users-cell-user">
                        <div className={`users-avatar ${user.role}`}>
                          {user.first_name?.charAt(0).toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <div className="users-cell-name">
                            {user.first_name} {user.last_name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* ── Username ── */}
                    <td data-label="Username">
                      <span className="users-cell-username" style={{ fontSize: 13, color: "#6b7280" }}>
                        @{user.username}
                      </span>
                    </td>

                    {/* ── Role Badge ── */}
                    <td data-label="สิทธิ์">
                      <span className={`users-role-badge ${user.role}`}>
                        <span className={`users-role-dot ${user.role}`} />
                        {roleLabel(user.role)}
                      </span>
                    </td>

                    {/* ── Actions ── */}
                    <td data-label="จัดการ">
                      <div className="users-action-group">
                        {user.role === "resident" && (
                          <button
                            className="users-action-btn promote"
                            onClick={() => setModalData({ user, action: "promote" })}
                            title="เลื่อนเป็นนิติบุคคล"
                            id={`promote-${user.user_id}`}
                          >
                            <IconArrowUp />
                            เลื่อนเป็นนิติ
                          </button>
                        )}
                        {user.role === "staff" && (
                          <button
                            className="users-action-btn demote"
                            onClick={() => setModalData({ user, action: "demote" })}
                            title="ลดสิทธิ์เป็นลูกบ้าน"
                            id={`demote-${user.user_id}`}
                          >
                            <IconArrowDown />
                            ลดเป็นลูกบ้าน
                          </button>
                        )}
                        {user.role === "admin" && (
                          <span style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>
                            — ผู้ดูแลระบบ
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Pagination ── */}
        {!loading && filteredUsers.length > ITEMS_PER_PAGE && (
          <div className="users-pagination">
            <button
              className="users-page-btn"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="หน้าก่อนหน้า"
            >
              <IconChevronLeft />
            </button>
            {pageNumbers.map(n => (
              <button
                key={n}
                className={`users-page-btn ${n === currentPage ? "active" : ""}`}
                onClick={() => setCurrentPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              className="users-page-btn"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="หน้าถัดไป"
            >
              <IconChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* ── Confirmation Modal ── */}
      {modalData && (
        <div className="users-modal-overlay" onClick={() => !updating && setModalData(null)}>
          <div className="users-modal" onClick={e => e.stopPropagation()}>
            <div className={`users-modal-icon ${modalData.action}`}>
              {modalData.action === "promote" ? <IconArrowUp /> : <IconArrowDown />}
            </div>
            <h3>
              {modalData.action === "promote" ? "เลื่อนสิทธิ์เป็นนิติบุคคล" : "ลดสิทธิ์เป็นลูกบ้าน"}
            </h3>
            <p>
              คุณต้องการ{modalData.action === "promote" ? "เลื่อนสิทธิ์" : "ลดสิทธิ์"}ของ{" "}
              <span className="users-modal-highlight">
                {modalData.user.first_name} {modalData.user.last_name}
              </span>{" "}
              ใช่หรือไม่?
            </p>
            <div className="users-modal-role-change">
              <span className={`users-modal-role-tag ${modalData.user.role}`}>
                {roleLabel(modalData.user.role)}
              </span>
              <span className="users-modal-arrow">→</span>
              <span className={`users-modal-role-tag ${modalData.action === "promote" ? "staff" : "resident"}`}>
                {modalData.action === "promote" ? "นิติบุคคล" : "ลูกบ้าน"}
              </span>
            </div>
            <div className="users-modal-actions">
              <button
                className="users-modal-btn cancel"
                onClick={() => setModalData(null)}
                disabled={updating}
              >
                ยกเลิก
              </button>
              <button
                className={`users-modal-btn confirm-${modalData.action}`}
                onClick={handleRoleChange}
                disabled={updating}
                id="confirm-role-change-btn"
              >
                {updating ? "กำลังดำเนินการ..." : "ยืนยัน"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notification ── */}
      {toast && (
        <div className={`users-toast ${toast.type}`}>
          {toast.type === "success" ? <IconCheck /> : <IconX />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
