"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";

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
  action: "changeRole" | "delete";
  targetRole?: string;
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
  <svg className="w-[22px] h-[22px] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconUserCheck = () => (
  <svg className="w-[22px] h-[22px] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <polyline points="17 11 19 13 23 9" />
  </svg>
);
const IconHome = () => (
  <svg className="w-[22px] h-[22px] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const IconShield = () => (
  <svg className="w-[22px] h-[22px] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  <svg className="w-12 h-12 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

function roleLabel(role: string) {
  return { resident: "ลูกบ้าน", staff: "นิติบุคคล", admin: "แอดมิน" }[role] ?? role;
}

/* ===== Skeleton Loader ===== */
function Skeleton({ w, h }: { w?: string; h?: string }) {
  return <div className="rounded-lg bg-[linear-gradient(90deg,#f3f4f6_25%,#e5e7eb_50%,#f3f4f6_75%)] bg-[length:200%_100%] animate-[dash-shimmer_1.4s_ease_infinite]" style={{ width: w ?? "100%", height: h ?? "16px" }} />;
}

/* ===== Constants ===== */
const ITEMS_PER_PAGE = 10;

/* ===== Main Page Component ===== */
function AdminUsersContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const modeParam = searchParams.get("mode");

  // Search & Filter
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState(roleParam || "all");

  useEffect(() => {
    if (roleParam) {
      setFilterRole(roleParam);
    } else {
      setFilterRole("all");
    }
  }, [roleParam]);

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
      const res = await api.get('/admin/users');
      if (res.data?.success && res.data?.data) {
        setUsers(res.data.data);
      } else {
        setUsers(res.data ?? []);
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

  /* ── Modal Confirm Action ── */
  async function handleConfirmAction() {
    if (!modalData) return;
    setUpdating(true);

    const { user, action, targetRole } = modalData;

    try {
      if (action === "changeRole" && targetRole) {
        const res = await api.patch(`/admin/users/${user.user_id}`, { role: targetRole });

        if (res.data?.success || res.status === 200) {
          await fetchUsers();
          showToast(`เปลี่ยนสิทธิ์ ${user.first_name} ${user.last_name} สำเร็จ`, "success");
        } else {
          showToast(res.data?.message || "เกิดข้อผิดพลาดในการเปลี่ยนสิทธิ์", "error");
        }
      } else if (action === "delete") {
        const res = await api.delete(`/admin/users/${user.user_id}`);

        if (res.data?.success || res.status === 200 || res.status === 204) {
          showToast(`ลบบัญชี ${user.first_name} ${user.last_name} สำเร็จ`, "success");
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          showToast(res.data?.message || "เกิดข้อผิดพลาดในการลบบัญชี", "error");
        }
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้", "error");
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
    <div className="grid gap-5">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 m-0">
            {modeParam === "roles" ? "ปรับสิทธิ์ผู้ใช้งาน" : modeParam === "delete" ? "ลบบัญชีผู้ใช้งาน" : "จัดการบัญชีผู้ใช้งาน"}
          </h2>
          <p className="text-sm text-gray-500 mt-1 mb-0">
            {modeParam === "roles" ? "เปลี่ยนสิทธิ์การเข้าใช้งานของแต่ละบัญชี" : modeParam === "delete" ? "ลบบัญชีผู้ใช้งานออกจากระบบ" : "ค้นหาและจัดการบัญชีผู้ใช้งานทั้งหมดในระบบ"}
          </p>
          <p className="mt-1 m-0 text-[13px] text-gray-400">
            {lastUpdated
              ? `อัปเดตล่าสุด ${lastUpdated.toLocaleTimeString("th-TH")}`
              : "กำลังโหลดข้อมูล..."}
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <button onClick={reload} disabled={loading} className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-[13px] font-medium cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-60 disabled:cursor-not-allowed">
            <IconRefresh /> รีเฟรช
          </button>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 px-5.5 flex items-center gap-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-black/5 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)]">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center shrink-0"><IconUsers /></div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-400 font-medium">ผู้ใช้ทั้งหมด</div>
            {loading ? <Skeleton w="50px" h="26px" /> : <div className="text-[26px] font-bold text-gray-900 leading-[1.2] my-0.5">{stats.total}</div>}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 px-5.5 flex items-center gap-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-black/5 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)]">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center shrink-0"><IconHome /></div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-400 font-medium">ลูกบ้าน (Resident)</div>
            {loading ? <Skeleton w="50px" h="26px" /> : <div className="text-[26px] font-bold text-gray-900 leading-[1.2] my-0.5">{stats.residents}</div>}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 px-5.5 flex items-center gap-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-black/5 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)]">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-400 flex items-center justify-center shrink-0"><IconUserCheck /></div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-400 font-medium">นิติบุคคล (Staff)</div>
            {loading ? <Skeleton w="50px" h="26px" /> : <div className="text-[26px] font-bold text-gray-900 leading-[1.2] my-0.5">{stats.staff}</div>}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 px-5.5 flex items-center gap-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-black/5 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)]">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-400 flex items-center justify-center shrink-0"><IconShield /></div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-400 font-medium">แอดมิน (Admin)</div>
            {loading ? <Skeleton w="50px" h="26px" /> : <div className="text-[26px] font-bold text-gray-900 leading-[1.2] my-0.5">{stats.admins}</div>}
          </div>
        </div>
      </div>

      {/* ── Search & Filter Toolbar ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] md:max-w-[360px]">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none">
            <IconSearch />
          </div>
          <input
            type="text"
            className="w-full py-2.5 px-3.5 pl-10 border border-gray-200 rounded-lg text-[13px] text-gray-700 bg-white outline-none transition-all duration-200 focus:border-violet-400 focus:shadow-[0_0_0_3px_rgba(167,139,250,0.15)] placeholder:text-gray-400"
            placeholder="ค้นหาชื่อ, นามสกุล หรือ username..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="user-search-input"
          />
        </div>
        <select
          className="py-2.5 px-3.5 border border-gray-200 rounded-lg text-[13px] text-gray-700 bg-white cursor-pointer outline-none min-w-[140px] transition-colors duration-200 focus:border-violet-400 focus:shadow-[0_0_0_3px_rgba(167,139,250,0.15)]"
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          id="user-role-filter"
        >
          <option value="all">ทุก Role</option>
          <option value="resident">ลูกบ้าน</option>
          <option value="staff">นิติบุคคล</option>
          <option value="admin">แอดมิน</option>
        </select>
        <span className="text-xs text-gray-400 md:ml-auto whitespace-nowrap text-center md:text-left">
          แสดง {paginatedUsers.length} จาก {filteredUsers.length} รายการ
        </span>
      </div>

      {/* ── Users Table ── */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 flex flex-col gap-3.5">
              {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} h="52px" />)}
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-[60px] px-5 text-sm text-gray-400 gap-2.5">
              <IconEmptyUser />
              {search || filterRole !== "all"
                ? "ไม่พบผู้ใช้ที่ตรงกับเงื่อนไขการค้นหา"
                : "ยังไม่มีข้อมูลผู้ใช้ในระบบ"}
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-[13px]" id="users-management-table">
              <thead className="hidden md:table-header-group">
                <tr>
                  <th className="px-4.5 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-50 border-b border-gray-100 whitespace-nowrap">ผู้ใช้งาน</th>
                  <th className="px-4.5 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-50 border-b border-gray-100 whitespace-nowrap">Username</th>
                  <th className="px-4.5 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-50 border-b border-gray-100 whitespace-nowrap">สิทธิ์ (Role)</th>
                  {modeParam && (
                  <th className="px-4.5 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-50 border-b border-gray-100 whitespace-nowrap">จัดการสิทธิ์</th>
                  )}
                </tr>
              </thead>
              <tbody className="block md:table-row-group w-full">
                {paginatedUsers.map(user => (
                  <tr key={user.user_id} className="block md:table-row w-full p-4 md:p-0 border-b border-gray-100 md:border-b md:border-gray-50 transition-colors duration-150 hover:bg-[#fafaff]">
                    {/* ── User Info ── */}
                    <td className="block md:table-cell w-full md:w-auto py-1 md:py-4 px-0 md:px-4.5 text-left text-gray-700 align-middle" data-label="ผู้ใช้งาน">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0 ${
                          user.role === 'resident' ? 'bg-gradient-to-br from-emerald-500 to-emerald-400' :
                          user.role === 'staff' ? 'bg-gradient-to-br from-indigo-500 to-indigo-400' :
                          'bg-gradient-to-br from-violet-600 to-violet-400'
                        }`}>
                          {user.first_name?.charAt(0).toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* ── Username ── */}
                    <td className="block md:table-cell w-full md:w-auto py-1 md:py-4 px-0 md:px-4.5 text-left text-gray-700 align-middle before:content-[attr(data-label)] before:block before:text-[11px] before:font-semibold before:text-gray-400 before:uppercase before:tracking-wide before:mb-1 md:before:hidden" data-label="Username">
                      <span className="text-[13px] text-gray-500">
                        @{user.username}
                      </span>
                    </td>

                    {/* ── Role Badge ── */}
                    <td className="block md:table-cell w-full md:w-auto py-1 md:py-4 px-0 md:px-4.5 text-left text-gray-700 align-middle before:content-[attr(data-label)] before:block before:text-[11px] before:font-semibold before:text-gray-400 before:uppercase before:tracking-wide before:mb-1 md:before:hidden" data-label="สิทธิ์">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        user.role === 'resident' ? 'bg-emerald-100 text-emerald-800' :
                        user.role === 'staff' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-pink-100 text-pink-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          user.role === 'resident' ? 'bg-emerald-500' :
                          user.role === 'staff' ? 'bg-indigo-500' :
                          'bg-violet-600'
                        }`} />
                        {roleLabel(user.role)}
                      </span>
                    </td>

                    {/* ── Actions (only on mode pages) ── */}
                    {modeParam && (
                    <td className="block md:table-cell w-full md:w-auto py-1 md:py-4 px-0 md:px-4.5 text-left text-gray-700 align-middle before:content-[attr(data-label)] before:block before:text-[11px] before:font-semibold before:text-gray-400 before:uppercase before:tracking-wide before:mb-1 md:before:hidden" data-label="จัดการ">
                      <div className="flex gap-2 items-center mt-2 md:mt-0">
                        {modeParam === "roles" && (
                          <select
                            className="py-1.5 px-2.5 border border-gray-200 rounded-lg text-xs text-gray-700 bg-white outline-none cursor-pointer hover:border-gray-300 focus:border-violet-400 focus:shadow-[0_0_0_3px_rgba(167,139,250,0.15)] transition-all duration-200"
                            value={user.role}
                            onChange={(e) => {
                              if (e.target.value !== user.role) {
                                setModalData({ user, action: "changeRole", targetRole: e.target.value });
                              }
                            }}
                          >
                            <option value="resident">ลูกบ้าน</option>
                            <option value="staff">นิติบุคคล</option>
                            <option value="admin">แอดมิน</option>
                          </select>
                        )}
                        
                        {modeParam === "delete" && (
                          <button
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 bg-red-50 text-red-600 cursor-pointer transition-all duration-200 whitespace-nowrap hover:bg-red-100 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => setModalData({ user, action: "delete" })}
                            title="ลบบัญชีผู้ใช้"
                          >
                            <span className="w-3.5 h-3.5"><IconX /></span>
                            ลบ
                          </button>
                        )}
                      </div>
                    </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Pagination ── */}
        {!loading && filteredUsers.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-center gap-1.5 py-4 px-4.5 border-t border-gray-100">
            <button
              className="flex items-center justify-center min-w-[36px] h-9 px-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-[13px] font-medium cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="หน้าก่อนหน้า"
            >
              <span className="w-4 h-4"><IconChevronLeft /></span>
            </button>
            {pageNumbers.map(n => (
              <button
                key={n}
                className={`flex items-center justify-center min-w-[36px] h-9 px-2.5 rounded-lg border text-[13px] font-medium cursor-pointer transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${n === currentPage ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-transparent' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'}`}
                onClick={() => setCurrentPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              className="flex items-center justify-center min-w-[36px] h-9 px-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-[13px] font-medium cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="หน้าถัดไป"
            >
              <span className="w-4 h-4"><IconChevronRight /></span>
            </button>
          </div>
        )}
      </div>

      {/* ── Confirmation Modal ── */}
      {modalData && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-[4px] flex items-center justify-center z-[200] animate-[users-fade-in_0.2s_ease]" onClick={() => !updating && setModalData(null)}>
          <div className="bg-white rounded-[20px] p-8 max-w-[420px] w-[90%] shadow-[0_20px_60px_rgba(0,0,0,0.2)] animate-[users-modal-pop_0.25s_cubic-bezier(0.34,1.56,0.64,1)]" onClick={e => e.stopPropagation()}>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${modalData.action === "changeRole" ? "bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-500" : "bg-gradient-to-br from-red-50 to-red-100 text-red-600"}`}>
              <span className="w-6 h-6">
                {modalData.action === "changeRole" ? <IconUsers /> : <IconX />}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center m-0 mb-2">
              {modalData.action === "changeRole" ? "ยืนยันการเปลี่ยนสิทธิ์" : "ยืนยันการลบบัญชี"}
            </h3>
            <p className="text-sm text-gray-500 text-center leading-relaxed m-0 mb-6">
              {modalData.action === "changeRole" ? "คุณต้องการเปลี่ยนสิทธิ์ของ" : "คุณต้องการลบบัญชีของ"}{" "}
              <span className="font-semibold text-gray-900">
                {modalData.user.first_name} {modalData.user.last_name}
              </span>{" "}
              ใช่หรือไม่?
              {modalData.action === "delete" && <span className="block mt-2 text-red-500 font-medium">การดำเนินการนี้ไม่สามารถย้อนกลับได้ ข้อมูลทั้งหมดจะถูกลบถาวร</span>}
            </p>
            
            {modalData.action === "changeRole" && modalData.targetRole && (
              <div className="flex items-center justify-center gap-3 p-3.5 bg-gray-50 rounded-xl mb-6">
                <span className="px-3.5 py-1.5 rounded-full text-[13px] font-semibold bg-gray-200 text-gray-800">
                  {roleLabel(modalData.user.role)}
                </span>
                <span className="text-base text-gray-400">→</span>
                <span className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold ${
                  modalData.targetRole === "admin" ? "bg-pink-100 text-pink-800" :
                  modalData.targetRole === "staff" ? "bg-indigo-100 text-indigo-800" :
                  "bg-emerald-100 text-emerald-800"
                }`}>
                  {roleLabel(modalData.targetRole)}
                </span>
              </div>
            )}

            <div className="flex gap-2.5">
              <button
                className="flex-1 py-3 px-4 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 border-none bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => setModalData(null)}
                disabled={updating}
              >
                ยกเลิก
              </button>
              <button
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 border-none text-white disabled:opacity-60 disabled:cursor-not-allowed ${modalData.action === "changeRole" ? "bg-gradient-to-br from-indigo-500 to-violet-600 hover:shadow-[0_4px_16px_rgba(99,102,241,0.3)]" : "bg-red-600 hover:bg-red-700 hover:shadow-[0_4px_16px_rgba(220,38,38,0.3)]"}`}
                onClick={handleConfirmAction}
                disabled={updating}
              >
                {updating ? "กำลังดำเนินการ..." : (modalData.action === "changeRole" ? "ยืนยัน" : "ลบบัญชีถาวร")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notification ── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-2.5 px-5.5 py-3.5 rounded-xl text-sm font-medium z-[300] shadow-[0_10px_30px_rgba(0,0,0,0.15)] animate-[users-toast-in_0.3s_cubic-bezier(0.34,1.56,0.64,1)] ${toast.type === "success" ? "bg-emerald-800 text-emerald-100" : "bg-red-800 text-red-100"}`}>
          <span className="w-[18px] h-[18px] shrink-0">
            {toast.type === "success" ? <IconCheck /> : <IconX />}
          </span>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</div>}>
      <AdminUsersContent />
    </Suspense>
  );
}
