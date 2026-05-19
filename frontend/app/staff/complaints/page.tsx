"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Complaint {
  complaint_id: number;
  ticket_no: string;
  subject: string;
  status: string;
  reported_date: string;
  description: string;
  location_written: string | null;
  soi: string | null;
  house_no: string;
  first_name: string;
  last_name: string;
}

const statusConfig: Record<string, { label: string; bgClass: string; textClass: string }> = {
  pending: { label: "รอดำเนินการ", bgClass: "bg-amber-100", textClass: "text-amber-700" },
  in_progress: { label: "กำลังดำเนินการ", bgClass: "bg-red-100", textClass: "text-red-600" },
  resolved: { label: "แก้ไขแล้ว", bgClass: "bg-blue-100", textClass: "text-blue-700" },
  approved: { label: "อนุมัติ", bgClass: "bg-green-100", textClass: "text-green-700" },
  rejected: { label: "ไม่อนุมัติ", bgClass: "bg-red-100", textClass: "text-red-600" },
  closed: { label: "ปิดเรื่อง", bgClass: "bg-gray-100", textClass: "text-gray-500" },
};

const filterOptions = [
  { key: "all", label: "ทั้งหมด" },
  { key: "pending", label: "รอดำเนินการ" },
  { key: "in_progress", label: "กำลังดำเนินการ" },
  { key: "resolved", label: "แก้ไขแล้ว" },
  { key: "rejected", label: "ปฏิเสธ" },
  { key: "closed", label: "ปิดเรื่อง" },
];

function StaffComplaintsContent() {
  const searchParams = useSearchParams();
  const defaultStatus = searchParams.get("status") || "all";

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(defaultStatus);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/complaints/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();
        if (json.success && json.data) {
          setComplaints(json.data);
        }
      } catch {
        // fallback
      }
      setLoading(false);
    };

    fetchComplaints();
  }, []);

  // Update filter when URL param changes (e.g. clicking quick action from dashboard)
  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam && filterOptions.some(opt => opt.key === statusParam)) {
      setFilter(statusParam);
    }
  }, [searchParams]);

  // Filter + Search + Date Range
  const filtered = complaints.filter((c) => {
    const matchFilter = filter === "all" || c.status === filter;
    const matchSearch =
      search === "" ||
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      (c.ticket_no && c.ticket_no.toLowerCase().includes(search.toLowerCase())) ||
      (c.location_written && c.location_written.toLowerCase().includes(search.toLowerCase()));

    let matchDate = true;
    if (startDate || endDate) {
      const rDate = new Date(c.reported_date);
      rDate.setHours(0, 0, 0, 0);

      if (startDate) {
        const sDate = new Date(startDate);
        sDate.setHours(0, 0, 0, 0);
        if (rDate < sDate) matchDate = false;
      }
      if (endDate) {
        const eDate = new Date(endDate);
        eDate.setHours(0, 0, 0, 0);
        if (rDate > eDate) matchDate = false;
      }
    }

    return matchFilter && matchSearch && matchDate;
  });

  // Count per filter
  const countByStatus = (status: string) =>
    status === "all"
      ? complaints.length
      : complaints.filter((c) => c.status === status).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-3 border-gray-200 border-t-[#d4a574] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 m-0">จัดการเรื่องร้องเรียน</h1>
        <p className="text-sm text-gray-400 mt-1 m-0">รายการร้องเรียนทั้งหมดในระบบ</p>
      </div>

      {/* Top Bar: Search + Date Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="ค้นหาเรื่องร้องเรียน, เลขที่, หรือสถานที่..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-[#d4a574] focus:ring-2 focus:ring-amber-100"
            />
          </div>

          {/* Date Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${
                (startDate || endDate) 
                  ? "bg-amber-50 border-amber-200 text-amber-700" 
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              ตัวกรองเพิ่มเติม
              {(startDate || endDate) && (
                <span className="flex w-2 h-2 rounded-full bg-amber-500 ml-1"></span>
              )}
            </button>

            {/* Dropdown Menu */}
            {isFilterOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-gray-800 m-0">กรองตามวันที่</h4>
                  {(startDate || endDate) && (
                    <button 
                      onClick={() => { setStartDate(""); setEndDate(""); setIsFilterOpen(false); }}
                      className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer bg-transparent border-none p-0"
                    >
                      ล้างตัวกรอง
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">วันที่เริ่มต้น</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 outline-none focus:border-[#d4a574] focus:ring-1 focus:ring-[#d4a574] focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">วันที่สิ้นสุด</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 outline-none focus:border-[#d4a574] focus:ring-1 focus:ring-[#d4a574] focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <Link
          href="/staff/complaints/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#d4a574] hover:bg-[#b8865a] text-white rounded-xl text-sm font-medium no-underline transition-colors shrink-0"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          สร้างคำร้องใหม่
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filterOptions.map((option) => (
          <button
            key={option.key}
            className={`
              inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border transition-all whitespace-nowrap cursor-pointer
              ${filter === option.key
                ? "bg-[#5a4333] border-[#5a4333] text-white"
                : "bg-white border-gray-200 text-gray-500 hover:border-[#d4a574] hover:text-[#d4a574]"
              }
            `}
            onClick={() => setFilter(option.key)}
          >
            {option.label}
            <span
              className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold ${
                filter === option.key
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {countByStatus(option.key)}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16 px-6">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-200">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-700 mb-2">ไม่พบเรื่องร้องเรียน</h3>
          <p className="text-sm text-gray-400 mb-6">
            {search || filter !== "all" ? "ลองเปลี่ยนคำค้นหาหรือตัวกรอง" : "ไม่มีเรื่องร้องเรียนในระบบ"}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wider bg-gray-50/50">
                  <th className="px-6 py-3.5 font-medium">เลขที่</th>
                  <th className="px-6 py-3.5 font-medium">หัวข้อ</th>
                  <th className="px-6 py-3.5 font-medium">บ้านเลขที่</th>
                  <th className="px-6 py-3.5 font-medium">ชื่อลูกบ้าน</th>
                  <th className="px-6 py-3.5 font-medium">สถานะ</th>
                  <th className="px-6 py-3.5 font-medium">วันที่แจ้ง</th>
                  <th className="px-6 py-3.5 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((c) => {
                  const config = statusConfig[c.status] || statusConfig.pending;
                  return (
                    <tr
                      key={c.complaint_id}
                      className="hover:bg-amber-50/30 transition-colors cursor-pointer"
                      onClick={() => window.location.href = `/staff/complaints/${c.complaint_id}`}
                    >
                      <td className="px-6 py-4 font-semibold text-[#d4a574] text-sm">
                        {c.ticket_no || `#${c.complaint_id}`}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700 max-w-[240px] truncate">
                        {c.subject}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-semibold text-xs">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                          </svg>
                          {c.house_no || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 text-sm">
                        {c.first_name && c.last_name ? `${c.first_name} ${c.last_name}` : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bgClass} ${config.textClass}`}>
                          {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(c.reported_date).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/staff/complaints/${c.complaint_id}`}
                          className="text-[#d4a574] hover:text-[#b8865a] text-xs font-medium no-underline transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          จัดการ →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="sm:hidden space-y-3">
            {filtered.map((c) => {
              const config = statusConfig[c.status] || statusConfig.pending;
              return (
                <Link
                  key={c.complaint_id}
                  href={`/staff/complaints/${c.complaint_id}`}
                  className="block bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 no-underline hover:border-amber-200 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#d4a574] m-0 mb-1">
                        {c.ticket_no || `#${c.complaint_id}`}
                      </p>
                      <p className="text-sm font-medium text-gray-800 m-0 mb-1 truncate">
                        {c.subject}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="inline-flex items-center gap-1 text-xs text-amber-700 font-semibold">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                          {c.house_no || "-"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {c.first_name && c.last_name ? `${c.first_name} ${c.last_name}` : ""}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 m-0 mt-1">
                        {new Date(c.reported_date).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${config.bgClass} ${config.textClass}`}>
                      {config.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function StaffComplaintsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-3 border-gray-200 border-t-[#d4a574] rounded-full animate-spin" />
      </div>
    }>
      <StaffComplaintsContent />
    </Suspense>
  );
}
