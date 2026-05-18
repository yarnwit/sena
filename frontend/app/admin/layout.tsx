"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import "./admin-layout.css";

/* ===== SVG Icons ===== */
const DashboardIcon = () => (
  <svg className="admin-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const UsersIcon = () => (
  <svg className="admin-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ReportsIcon = () => (
  <svg className="admin-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const LogsIcon = () => (
  <svg className="admin-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

/* ===== Navigation Items ===== */
const mainNavItems = [
  { href: "/admin/dashboard", label: "ภาพรวมระบบ", icon: DashboardIcon },
  { href: "/admin/users", label: "จัดการผู้ใช้งาน", icon: UsersIcon },
  { href: "/admin/reports", label: "รายงานสรุป", icon: ReportsIcon },
];

const systemNavItems = [
  { href: "/admin/logs", label: "Audit Logs", icon: LogsIcon },
];

/* ===== Page Title Map ===== */
function getPageInfo(pathname: string) {
  if (pathname === "/admin/dashboard") return { title: "ภาพรวมระบบ", subtitle: "สรุปข้อมูลทั้งระบบสำหรับผู้ดูแล" };
  if (pathname === "/admin/users") return { title: "จัดการผู้ใช้งาน", subtitle: "เพิ่ม ลบ แก้ไขสิทธิ์ผู้ใช้ทุก Role" };
  if (pathname === "/admin/reports") return { title: "รายงานสรุป", subtitle: "สถิติและรายงานภาพรวมเรื่องร้องเรียน" };
  if (pathname === "/admin/logs") return { title: "Audit Logs", subtitle: "บันทึกการเปลี่ยนแปลงและกิจกรรมในระบบ" };
  return { title: "ผู้ดูแลระบบ", subtitle: "" };
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userInitial, setUserInitial] = useState("");
  const [loading, setLoading] = useState(true);

  const pageInfo = getPageInfo(pathname);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const fullName = user.full_name || `${user.first_name || ""} ${user.last_name || ""}`.trim();
        setUserName(fullName);
        setUserInitial(fullName ? fullName.charAt(0).toUpperCase() : "?");
      }
    } catch {
      // ignore parse error
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    // ลบข้อมูลจาก localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    // ลบ cookie
    document.cookie = "accessToken=; path=/; max-age=0";
    document.cookie = "user=; path=/; max-age=0";
    router.push("/login");
    router.refresh();
  };

  const todayStr = new Date().toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  /** ตรวจสอบว่า nav item นี้ active หรือไม่ */
  function isNavActive(href: string) {
    return pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href + "/"));
  }

  return (
    <div className="admin-layout">
      {/* Sidebar Overlay (mobile) */}
      <div
        className={`admin-sidebar-overlay ${sidebarOpen ? "visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Logo */}
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo">
            <div className="admin-sidebar-logo-divider" />
            <span className="admin-sidebar-logo-sena">SENA</span>
            <h2 className="admin-sidebar-logo-grand-home">GRAND HOME</h2>
            <span className="admin-sidebar-logo-location">Rangsit - Tiwanon</span>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <span className="admin-role-badge">
              <span className="admin-role-dot" />
              ผู้ดูแลระบบ
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="admin-sidebar-nav">
          {/* Main Menu */}
          <div className="admin-nav-section-label">เมนูหลัก</div>
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-item ${isNavActive(item.href) ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon />
              {item.label}
            </Link>
          ))}

          {/* System Menu */}
          <div className="admin-nav-section-label">ระบบ</div>
          {systemNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-item ${isNavActive(item.href) ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user-info">
            <div className="admin-sidebar-avatar">{userInitial || "?"}</div>
            <div className="admin-sidebar-user-details">
              <div className="admin-sidebar-user-name">
                {loading ? "กำลังโหลด..." : userName || "ผู้ใช้งาน"}
              </div>
              <div className="admin-sidebar-user-role">Administrator</div>
            </div>
          </div>
          <button onClick={handleLogout} className="admin-logout-button">
            <LogoutIcon />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main-content">
        {/* Top Navbar */}
        <header className="admin-top-navbar">
          <div className="admin-navbar-left">
            <button
              className="admin-hamburger-button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              <MenuIcon />
            </button>
            <div>
              <h1 className="admin-page-title">{pageInfo.title}</h1>
              {pageInfo.subtitle && (
               <p className="admin-page-subtitle">{pageInfo.subtitle}</p>
              )}
            </div>
          </div>
          <div className="admin-navbar-right">
            <span className="admin-navbar-date">
              <CalendarIcon />
              {todayStr}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content-area">{children}</main>
      </div>
    </div>
  );
}
