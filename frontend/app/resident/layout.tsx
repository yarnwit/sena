"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

/* ===== SVG Icons ===== */
const OverviewIcon = () => (
  <svg className="w-[24px] h-[24px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const CreateComplaintIcon = () => (
  <svg className="w-[24px] h-[24px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="18" x2="12" y2="12" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </svg>
);

const HistoryIcon = () => (
  <svg className="w-[24px] h-[24px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ProfileIcon = () => (
  <svg className="w-[24px] h-[24px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-[24px] h-[24px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  { href: "/resident/profile", label: "โปรไฟล์", icon: ProfileIcon },
];

function getPageInfo(pathname: string) {
  if (pathname === "/resident/dashboard") return { icon: OverviewIcon, title: "ภาพรวม" };
  if (pathname === "/resident/complaints/new") return { icon: CreateComplaintIcon, title: "สร้างคำร้อง" };
  if (pathname.startsWith("/resident/complaints/") && pathname !== "/resident/complaints/new") return { icon: HistoryIcon, parent: "ประวัติคำร้องของฉัน", title: "รายละเอียดคำร้อง" };
  if (pathname === "/resident/complaints") return { icon: HistoryIcon, title: "ประวัติคำร้องของฉัน" };
  if (pathname === "/resident/profile") return { icon: ProfileIcon, title: "โปรไฟล์" };
  return { icon: OverviewIcon, title: "ลูกบ้าน" };
}

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [loading, setLoading] = useState(true);

  const pageInfo = getPageInfo(pathname);

  useEffect(() => {
    const loadUser = () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          const fullName = user.full_name || `${user.first_name || ""} ${user.last_name || ""}`.trim();
          setUserName(fullName);
          
          let address = "";
          if (user.house_no) address += user.house_no;
          if (user.phase) address += ` เฟส ${user.phase}`;
          if (user.soi) address += ` ซอย ${user.soi}`;
          
          setHouseNo(address.trim() || user.address || "---");
        }
      } catch {
        // ignore parse error
      }
      setLoading(false);
    };

    loadUser();
    window.addEventListener("user-updated", loadUser);
    return () => window.removeEventListener("user-updated", loadUser);
  }, []);

  const handleLogout = () => {
    // ลบข้อมูลจาก localStorage
    
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
          fixed top-0 left-0 h-screen w-[270px] bg-gradient-to-b from-[#161D19]/90 to-[#38BC0B] text-white border-none
          flex flex-col z-50
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="pt-7 px-6 pb-5 border-b border-white/10">
          <div className="flex flex-col items-center text-center">
            <div className="w-[120px] h-[1px] bg-white/40 mb-1" />
            <span className="font-['Times_New_Roman',_'Georgia',_serif] text-[11px] font-normal tracking-[5px] text-white/90 uppercase">SENA</span>
            <h2 className="font-['Times_New_Roman',_'Georgia',_serif] text-xl font-bold tracking-[3px] text-white m-0 leading-[1.3]">GRAND HOME</h2>
            <span className="font-['Times_New_Roman',_'Georgia',_serif] text-[9px] tracking-[2px] text-white/60 mt-0.5">Rangsit - Tiwanon</span>
          </div>
          <div className="flex justify-center mt-3.5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#38BC0B]/20 border border-[#38BC0B]/35 rounded-full text-[11px] text-green-200 tracking-[0.5px]">
              <span className="w-1.5 h-1.5 bg-[#4ade80] rounded-full animate-pulse" />
              ลูกบ้าน
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/15 scrollbar-track-transparent">
          <div className="text-sm font-semibold uppercase tracking-[1.5px] text-white/35 px-3 py-2">เมนูหลัก</div>
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
                  group flex items-center gap-3 px-4 py-4 rounded-lg text-base font-medium transition-all duration-200 mb-2 relative no-underline
                  ${isActive
                    ? "active bg-[#38BC0B]/20 text-white font-semibold before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-5 before:bg-[#4ade80] before:rounded-r-[3px]"
                    : "text-white/85 hover:bg-white/5 hover:text-white"
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
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-[13px] text-white/60 cursor-pointer transition-all duration-200 hover:bg-red-500/10 hover:border-red-500/25 hover:text-red-400"
          >
            <LogoutIcon />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-[270px] flex flex-col min-h-screen min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-5 md:py-6 min-h-[88px] bg-white border-b border-gray-200">
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
            
            <div className="hidden lg:block ml-2">
              {pageInfo.parent ? (
                <nav className="flex items-center gap-4 text-lg md:text-xl font-medium text-gray-500 m-0">
                  <span className="flex items-center gap-3 hover:text-gray-800 transition-colors cursor-pointer">
                    {pageInfo.icon && <pageInfo.icon />}
                    {pageInfo.parent}
                  </span>
                  <svg className="w-6 h-6 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  <span className="text-[#38BC0B] font-bold">{pageInfo.title}</span>
                </nav>
              ) : (
                <nav className="flex items-center gap-4 text-lg md:text-xl font-medium text-gray-500 m-0">
                  <span className="flex items-center gap-3 text-[#38BC0B] font-bold">
                    {pageInfo.icon && <pageInfo.icon />}
                    {pageInfo.title}
                  </span>
                </nav>
              )}
            </div>
          </div>

          {/* Right - User info */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-lg font-bold text-gray-700 m-0">
                สวัสดีคุณ {loading ? "..." : userName || "ผู้ใช้งาน"}
              </p>
              <p className="text-base text-gray-400 m-0">
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
