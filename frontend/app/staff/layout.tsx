"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import "./staff-layout.css";

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

const MeetingIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CreateComplaintIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="18" x2="12" y2="12" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </svg>
);

/* ===== Navigation Items ===== */
const navItems = [
  { href: "/staff/dashboard", label: "ภาพรวมงาน", icon: DashboardIcon },
  { href: "/staff/complaints/new", label: "สร้างเรื่องร้องเรียน", icon: CreateComplaintIcon },
  { 
    label: "จัดการร้องเรียน", 
    icon: ComplaintIcon,
    subItems: [
      { href: "/staff/complaints", label: "เรื่องร้องเรียนทั้งหมด" },
      { href: "/staff/approvals", label: "รอเข้าที่ประชุม" },
      { href: "/staff/meetings", label: "นำเรื่องเข้าที่ประชุม" },
      { href: "/staff/maintenance", label: "ติดตามการแก้ไขปัญหา" }
    ]
  },
  { href: "/staff/profile", label: "โปรไฟล์", icon: ProfileIcon },
];

/* ===== Page Title Map ===== */
function getPageInfo(pathname: string) {
  if (pathname === "/staff/dashboard") return { title: "ภาพรวมงาน", subtitle: "สรุปงานที่ต้องรับผิดชอบ" };
  if (pathname === "/staff/complaints/new") return { title: "สร้างเรื่องร้องเรียน", subtitle: "บันทึกเรื่องร้องเรียนใหม่เข้าระบบ" };
  if (pathname.startsWith("/staff/complaints/")) return { title: "รายละเอียดการร้องเรียน", subtitle: "ข้อมูลเรื่องร้องเรียนและการอัปเดตสถานะ" };
  if (pathname === "/staff/complaints") return { title: "จัดการร้องเรียน", subtitle: "รายการเรื่องร้องเรียนทั้งหมดจากลูกบ้าน" };
  if (pathname === "/staff/approvals") return { title: "รอเข้าที่ประชุม", subtitle: "เลือกเรื่องร้องเรียนที่ได้รับอนุมัติเพื่อนำเรื่องเข้าวาระการประชุม" };
  if (pathname === "/staff/meetings") return { title: "นำเรื่องเข้าที่ประชุม", subtitle: "จัดการวาระการประชุมและสรุปผลหลังการประชุม" };
  if (pathname === "/staff/maintenance") return { title: "ติดตามการแก้ไขปัญหา", subtitle: "จัดการรายการปฏิบัติงานที่ต้องแก้ไข" };
  if (pathname === "/staff/reports") return { title: "รายงานและสถิติ", subtitle: "ข้อมูลภาพรวมผลการดำเนินงาน" };
  if (pathname === "/staff/profile") return { title: "โปรไฟล์เจ้าหน้าที่", subtitle: "จัดการข้อมูลส่วนตัวของนิติบุคคล" };
  return { title: "เจ้าหน้าที่นิติบุคคล", subtitle: "" };
}

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userInitial, setUserInitial] = useState("");
  const [loading, setLoading] = useState(true);
  
  // State for accordion menu
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    "จัดการร้องเรียน": pathname.startsWith("/staff/complaints") || 
                       pathname.startsWith("/staff/approvals") ||
                       pathname.startsWith("/staff/meetings") ||
                       pathname.startsWith("/staff/maintenance") ||
                       pathname.startsWith("/staff/reports")
  });

  const pageInfo = getPageInfo(pathname);

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

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

  return (
    <div className="staff-layout">
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
              เจ้าหน้าที่นิติบุคคล
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">เมนูหลัก</div>
          {navItems.map((item, idx) => {
            if (item.subItems) {
              const isMenuOpen = openMenus[item.label];
              const isChildActive = item.subItems.some(sub => pathname === sub.href || (sub.href === "/staff/complaints" && pathname.startsWith("/staff/complaints/")));
              
              return (
                <div key={idx} className="nav-item-group">
                  <button
                    className={`nav-item w-full text-left flex items-center justify-between border-none bg-transparent cursor-pointer font-inherit ${isChildActive && !isMenuOpen ? "active-parent" : ""}`}
                    onClick={() => toggleMenu(item.label)}
                  >
                    <div className="flex items-center gap-[12px]">
                      <item.icon />
                      <span>{item.label}</span>
                    </div>
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`} 
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  
                  <div className={`nav-subitems overflow-hidden transition-all duration-300 ${isMenuOpen ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                    {item.subItems.map((sub, sIdx) => {
                      const isActive = pathname === sub.href || (sub.href === "/staff/complaints" && pathname.startsWith("/staff/complaints/"));
                      return (
                        <Link
                          key={sIdx}
                          href={sub.href}
                          className={`nav-subitem ${isActive ? "active" : ""}`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <span className="nav-subitem-dot"></span>
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            }

            const isActive =
              pathname === item.href ||
              (item.href === "/staff/complaints" &&
                pathname.startsWith("/staff/complaints"));

            return (
              <Link
                key={item.href || idx}
                href={item.href || "#"}
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
              <div className="sidebar-user-role">Staff</div>
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
