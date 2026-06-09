"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

/* ===== SVG Icons ===== */
const DashboardIcon = () => (
  <svg className="w-[24px] h-[24px] shrink-0 opacity-80 group-[.active]:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const ComplaintIcon = () => (
  <svg className="w-[24px] h-[24px] shrink-0 opacity-80 group-[.active]:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const ProfileIcon = () => (
  <svg className="w-[24px] h-[24px] shrink-0 opacity-80 group-[.active]:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const MeetingIcon = () => (
  <svg className="w-[24px] h-[24px] shrink-0 opacity-80 group-[.active]:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CreateComplaintIcon = () => (
  <svg className="w-[24px] h-[24px] shrink-0 opacity-80 group-[.active]:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="18" x2="12" y2="12" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </svg>
);

/* ===== Navigation Items ===== */
const navItems = [
  { href: "/staff/dashboard", label: "ภาพรวมงาน", icon: DashboardIcon },
  { href: "/staff/complaints/new", label: "สร้างคำร้อง", icon: CreateComplaintIcon },
  {
    label: "จัดการร้องเรียน",
    icon: ComplaintIcon,
    subItems: [
      { href: "/staff/complaints", label: "เรื่องร้องเรียนทั้งหมด" },
      { href: "/staff/pending", label: "รอตรวจสอบ" },
      { href: "/staff/approvals", label: "รอเข้าที่ประชุม" },
      { href: "/staff/meetings", label: "นำเรื่องเข้าที่ประชุม" },
      { href: "/staff/maintenance", label: "ติดตามการแก้ไขปัญหา" }
    ]
  },
  { href: "/staff/profile", label: "โปรไฟล์", icon: ProfileIcon },
];

/* ===== Page Title Map ===== */
function getPageInfo(pathname: string) {
  if (pathname === "/staff/dashboard") return { icon: DashboardIcon, title: "ภาพรวมงาน", subtitle: "สรุปงานที่ต้องรับผิดชอบ" };
  if (pathname === "/staff/complaints/new") return { icon: CreateComplaintIcon, title: "สร้างเรื่องร้องเรียน", subtitle: "บันทึกเรื่องร้องเรียนใหม่เข้าระบบ" };
  if (pathname.startsWith("/staff/complaints/")) return { icon: ComplaintIcon, title: "รายละเอียดการร้องเรียน", subtitle: "ข้อมูลเรื่องร้องเรียนและการอัปเดตสถานะ" };
  if (pathname === "/staff/complaints") return { icon: ComplaintIcon, parent: "จัดการร้องเรียน", title: "เรื่องร้องเรียนทั้งหมด", subtitle: "จัดการและติดตามเรื่องร้องเรียนจากลูกบ้านทั้งหมด" };
  if (pathname === "/staff/pending") return { icon: ComplaintIcon, parent: "จัดการร้องเรียน", title: "รอตรวจสอบ", subtitle: "เรื่องร้องเรียนใหม่ที่รอการตรวจสอบเบื้องต้น" };
  if (pathname === "/staff/approvals") return { icon: ComplaintIcon, parent: "จัดการร้องเรียน", title: "รอเข้าที่ประชุม", subtitle: "เรื่องร้องเรียนที่รอการตรวจสอบเพื่อเข้าที่ประชุม" };
  if (pathname === "/staff/meetings") return { icon: ComplaintIcon, parent: "จัดการร้องเรียน", title: "นำเรื่องเข้าที่ประชุม", subtitle: "จัดการเรื่องที่ต้องนำเข้าที่ประชุมหรืออยู่ระหว่างการประชุม" };
  if (pathname === "/staff/maintenance") return { icon: ComplaintIcon, parent: "จัดการร้องเรียน", title: "ติดตามการแก้ไขปัญหา", subtitle: "จัดการปัญหาที่ต้องติดตามหรือรอการแก้ไขจากช่าง" };
  if (pathname === "/staff/reports") return { icon: DashboardIcon, title: "รายงานและสถิติ", subtitle: "ข้อมูลภาพรวมผลการดำเนินงาน" };
  if (pathname === "/staff/profile") return { icon: ProfileIcon, title: "โปรไฟล์เจ้าหน้าที่", subtitle: "จัดการข้อมูลส่วนตัวของนิติบุคคล" };
  return { icon: DashboardIcon, title: "เจ้าหน้าที่นิติบุคคล", subtitle: "" };
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
    const loadUser = () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        const userStr = sessionStorage.getItem("user");

        if (!token || !userStr) {
          router.replace("/login");
          return;
        }

        const user = JSON.parse(userStr);
        const fullName = user.full_name || `${user.first_name || ""} ${user.last_name || ""}`.trim();
        setUserName(fullName);
        setUserInitial(fullName ? fullName.charAt(0).toUpperCase() : "?");
      } catch {
        router.replace("/login");
        return;
      }
      setLoading(false);
    };

    loadUser();
    window.addEventListener("user-updated", loadUser);
    return () => window.removeEventListener("user-updated", loadUser);
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
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
    <div className="flex min-h-screen bg-[#f3f3f3]">
      {/* Sidebar Overlay (mobile) */}
      <div
        className={`fixed inset-0 bg-black/50 z-[99] transition-opacity duration-300 md:hidden ${sidebarOpen ? "opacity-100 block" : "opacity-0 hidden"}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 w-[270px] h-screen bg-gradient-to-b from-[#161D19]/90 to-[#007AFF] text-white flex flex-col z-[100] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Logo */}
        <div className="pt-7 px-6 pb-5 border-b border-white/10">
          <div className="flex flex-col items-center text-center">
            <div className="w-[120px] h-[1px] bg-white/40 mb-1" />
            <span className="font-['Times_New_Roman',_'Georgia',_serif] text-[11px] font-normal tracking-[5px] text-white/90 uppercase">SENA</span>
            <h2 className="font-['Times_New_Roman',_'Georgia',_serif] text-xl font-bold tracking-[3px] text-white m-0 leading-[1.3]">GRAND HOME</h2>
            <span className="font-['Times_New_Roman',_'Georgia',_serif] text-[9px] tracking-[2px] text-white/60 mt-0.5">Rangsit - Tiwanon</span>
          </div>
          <div className="flex justify-center mt-3.5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#007AFF]/20 border border-[#007AFF]/35 rounded-full text-[11px] text-blue-200 tracking-[0.5px]">
              <span className="w-1.5 h-1.5 bg-[#007AFF] rounded-full animate-pulse" />
              เจ้าหน้าที่นิติบุคคล
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/15 scrollbar-track-transparent">
          <div className="text-sm font-semibold uppercase tracking-[1.5px] text-white/35 px-3 py-2">เมนูหลัก</div>
          {navItems.map((item, idx) => {
            if (item.subItems) {
              const isMenuOpen = openMenus[item.label];
              const isChildActive = item.subItems.some(sub => pathname === sub.href || (sub.href === "/staff/complaints" && pathname.startsWith("/staff/complaints/")));

              return (
                <div key={idx} className="mb-0.5 group">
                  <button
                    className={`w-full text-left flex items-center justify-between border-none bg-transparent cursor-pointer px-4 py-4 rounded-lg text-base font-normal transition-all duration-200 relative ${isChildActive && !isMenuOpen ? "bg-white/5 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"}`}
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

                  <div className={`pl-5 overflow-hidden transition-all duration-300 ${isMenuOpen ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                    {item.subItems.map((sub, sIdx) => {
                      const isActive = pathname === sub.href || (sub.href === "/staff/complaints" && pathname.startsWith("/staff/complaints/"));
                      return (
                        <Link
                          key={sIdx}
                          href={sub.href}
                          className={`flex items-center gap-2.5 px-4 py-3.5 rounded-lg text-[15px] transition-all duration-200 mb-0.5 no-underline ${isActive ? "text-white bg-white/10 font-medium" : "text-white/55 hover:text-white/85 hover:bg-white/5"}`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <span className={`w-1 h-1 rounded-full shrink-0 ${isActive ? "bg-current opacity-100 shadow-[0_0_4px_currentColor]" : "bg-current opacity-50"}`}></span>
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
                className={`group flex items-center gap-3 px-4 py-4 rounded-lg text-base font-normal transition-all duration-200 mb-0.5 relative no-underline ${isActive ? "active bg-[#007AFF]/20 text-white font-medium before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-5 before:bg-[#409cff] before:rounded-r-[3px]" : "text-white/65 hover:bg-white/5 hover:text-white"}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-[13px] text-white/60 cursor-pointer transition-all duration-200 hover:bg-red-500/10 hover:border-red-500/25 hover:text-red-400">
            <LogoutIcon />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-[270px] flex flex-col min-h-screen min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-8 py-5 md:py-6 min-h-[88px] bg-white/85 backdrop-blur-md border-b border-black/5">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden flex items-center justify-center w-10 h-10 bg-transparent border border-[#e0e0e0] rounded-lg cursor-pointer text-[#333] transition-colors duration-200 hover:bg-[#f3f3f3]"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              <MenuIcon />
            </button>
            <div>
              {pageInfo.parent ? (
                <nav className="flex items-center gap-4 text-lg md:text-xl font-medium text-gray-500 m-0">
                  <span className="flex items-center gap-3 hover:text-gray-800 transition-colors cursor-pointer">
                    {pageInfo.icon && <pageInfo.icon />}
                    {pageInfo.parent}
                  </span>
                  <svg className="w-6 h-6 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  <span className="text-[#007AFF] font-bold">{pageInfo.title}</span>
                </nav>
              ) : (
                <nav className="flex items-center gap-4 text-lg md:text-xl font-medium text-gray-500 m-0">
                  <span className="flex items-center gap-3 text-[#007AFF] font-bold">
                    {pageInfo.icon && <pageInfo.icon />}
                    {pageInfo.title}
                  </span>
                </nav>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:flex items-center gap-2.5 text-base md:text-lg font-medium text-gray-600">
              <CalendarIcon />
              {todayStr}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 min-w-0 w-full p-5 md:p-7 md:px-8">{children}</main>
      </div>
    </div>
  );
}
