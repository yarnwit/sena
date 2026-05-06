"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import "./resident-layout.css";

/* ===== SVG Icons ===== */
const DashboardIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const ComplaintIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const NewComplaintIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="18" x2="12" y2="12" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </svg>
);

const ProfileIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
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
const navItems = [
  { href: "/resident/dashboard", label: "แดชบอร์ด", icon: DashboardIcon },
  { href: "/resident/complaints", label: "เรื่องร้องเรียน", icon: ComplaintIcon },
  { href: "/resident/complaints/new", label: "สร้างร้องเรียนใหม่", icon: NewComplaintIcon },
  { href: "/resident/profile", label: "โปรไฟล์", icon: ProfileIcon },
];

/* ===== Page Title Map ===== */
function getPageInfo(pathname: string) {
  if (pathname === "/resident/dashboard") return { title: "แดชบอร์ด", subtitle: "ภาพรวมข้อมูลของคุณ" };
  if (pathname === "/resident/complaints/new") return { title: "สร้างร้องเรียนใหม่", subtitle: "กรอกรายละเอียดเรื่องร้องเรียน" };
  if (pathname.startsWith("/resident/complaints/")) return { title: "รายละเอียดร้องเรียน", subtitle: "ข้อมูลและสถานะเรื่องร้องเรียน" };
  if (pathname === "/resident/complaints") return { title: "เรื่องร้องเรียน", subtitle: "รายการร้องเรียนทั้งหมดของคุณ" };
  if (pathname === "/resident/profile") return { title: "โปรไฟล์", subtitle: "จัดการข้อมูลส่วนตัว" };
  return { title: "หน้าหลัก", subtitle: "" };
}

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userInitial, setUserInitial] = useState("");
  const [loading, setLoading] = useState(true);

  const pageInfo = getPageInfo(pathname);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: userData } = await supabase
          .from("users")
          .select("first_name, last_name")
          .eq("id", user.id)
          .single();

        if (userData) {
          const fullName = `${userData.first_name} ${userData.last_name}`;
          setUserName(fullName);
          setUserInitial(userData.first_name.charAt(0).toUpperCase());
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const todayStr = new Date().toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="resident-layout">
      {/* Sidebar Overlay (mobile) */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Logo */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-divider" />
            <span className="sidebar-logo-sena">SENA</span>
            <h2 className="sidebar-logo-grand-home">GRAND HOME</h2>
            <span className="sidebar-logo-location">Rangsit - Tiwanon</span>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <span className="sidebar-role-badge">
              <span className="sidebar-role-dot" />
              ลูกบ้าน
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">เมนูหลัก</div>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/resident/complaints" &&
                pathname.startsWith("/resident/complaints") &&
                pathname !== "/resident/complaints/new");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user-info">
            <div className="sidebar-avatar">{userInitial || "?"}</div>
            <div className="sidebar-user-details">
              <div className="sidebar-user-name">
                {loading ? "กำลังโหลด..." : userName || "ผู้ใช้งาน"}
              </div>
              <div className="sidebar-user-role">Resident</div>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-button">
            <LogoutIcon />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Navbar */}
        <header className="top-navbar">
          <div className="navbar-left">
            <button
              className="hamburger-button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              <MenuIcon />
            </button>
            <div>
              <h1 className="page-title">{pageInfo.title}</h1>
              {pageInfo.subtitle && (
                <p className="page-subtitle">{pageInfo.subtitle}</p>
              )}
            </div>
          </div>
          <div className="navbar-right">
            <span className="navbar-date">
              <CalendarIcon />
              {todayStr}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="content-area">{children}</main>
      </div>
    </div>
  );
}
