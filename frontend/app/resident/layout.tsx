"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

/* ===== SVG Icons ===== */
const OverviewIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const CreateComplaintIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="18" x2="12" y2="12" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </svg>
);

const HistoryIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const AnnouncementIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const MenuIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

/* ===== Navigation Items (Figma-matched) ===== */
const navItems = [
  { href: "/resident/dashboard", label: "ภาพรวม", icon: OverviewIcon },
  { href: "/resident/complaints/new", label: "สร้างคำร้อง", icon: CreateComplaintIcon },
  { href: "/resident/complaints", label: "ประวัติคำร้องของฉัน", icon: HistoryIcon },
  { href: "/resident/announcements", label: "ประกาศ/ข่าวสาร", icon: AnnouncementIcon },
];

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const fullName = user.full_name || `${user.first_name || ""} ${user.last_name || ""}`.trim();
        setUserName(fullName);
        setHouseNo(user.house_no || user.address || "88/1 หมู่ 1 ซอย 1");
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

  return (
    <div className="flex min-h-screen bg-[#f3f3f3]">
      {/* Sidebar Overlay (mobile) */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-[240px] bg-[#fdf5ed] border-r border-[#e8ddd1]
          flex flex-col z-50
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-[1px] bg-[#b8865a]/40 mb-1" />
            <span className="text-[10px] tracking-[4px] text-[#8b6f50] uppercase font-serif">SENA</span>
            <h2 className="text-[18px] font-bold tracking-[2px] text-[#5a4333] font-serif m-0 leading-tight">GRAND HOME</h2>
            <span className="text-[8px] tracking-[1.5px] text-[#a08b76] font-serif mt-0.5">Rangsit - Tiwanon</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/resident/dashboard" && pathname === "/resident") ||
              (item.href === "/resident/complaints" &&
                pathname.startsWith("/resident/complaints") &&
                pathname !== "/resident/complaints/new");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-sm font-medium
                  transition-all duration-200 no-underline
                  ${isActive
                    ? "bg-[#d4a574] text-white shadow-md shadow-[#d4a574]/25"
                    : "text-[#6b5e52] hover:bg-[#eddcc9] hover:text-[#5a4333]"
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer - Logout */}
        <div className="px-3 pb-4 pt-2 border-t border-[#e8ddd1]">
          <button
            onClick={handleLogout}
            className="
              flex items-center gap-3 w-full px-4 py-3 rounded-xl
              text-sm font-medium text-[#c0392b] hover:bg-red-50
              transition-all duration-200 cursor-pointer
              bg-transparent border-none
            "
          >
            <LogoutIcon />
            ลงชื่อออก
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-[240px] flex flex-col min-h-screen min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors lg:hidden cursor-pointer"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              <MenuIcon />
            </button>

            {/* Logo in header (visible on mobile only) */}
            <div className="flex flex-col lg:hidden">
              <span className="text-[9px] tracking-[3px] text-[#8b6f50] uppercase font-serif">SENA</span>
              <span className="text-xs font-bold tracking-[1px] text-[#5a4333] font-serif leading-tight">GRAND HOME</span>
            </div>
          </div>

          {/* Right - User info */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-700 m-0">
                สวัสดีคุณ {loading ? "..." : userName || "ผู้ใช้งาน"}
              </p>
              <p className="text-xs text-gray-400 m-0">
                บ้านเลขที่ {houseNo || "---"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-100">
              <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 min-w-0 w-full p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
