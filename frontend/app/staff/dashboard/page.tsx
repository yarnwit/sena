"use client";

import { useDashboard } from "@/hooks/useDashboard";
import Link from "next/link";

/* ===== Helpers ===== */
const statusLabels: Record<string, string> = {
  pending: "รอดำเนินการ",
  approved: "อนุมัติรับเรื่อง",
  in_meeting: "เข้าที่ประชุม",
  in_progress: "กำลังดำเนินการ",
  resolved: "แก้ไขแล้ว",
  rejected: "ปฏิเสธ",
  closed: "ปิดเรื่อง",
};

/** คำนวณอายุของเรื่องร้องเรียน */
function getDaysAgo(dateStr: string): number {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function formatDaysAgo(days: number): string {
  if (days === 0) return "วันนี้";
  if (days === 1) return "เมื่อวาน";
  return `${days} วันที่แล้ว`;
}

/* ===== Icon Components (Outline / Formal Style like Resident) ===== */
const ApprovedIcon = () => (
  <svg className="w-8 h-8 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="m9 15 2 2 4-4" />
  </svg>
);

const InMeetingIcon = () => (
  <svg className="w-8 h-8 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const InboxIcon = () => (
  <svg className="w-8 h-8 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={`w-8 h-8 ${className || "text-gray-500"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ActivityIcon = () => (
  <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={`w-8 h-8 ${className || "text-green-500"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const CrossIcon = () => (
  <svg className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

/* ===== Page Component ===== */
export default function StaffDashboardPage() {
  const { stats, urgentComplaints, recentComplaints, isLoading, error } = useDashboard('staff');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-[18px] md:text-2xl font-bold text-gray-900 m-0 tracking-tight">ภาพรวมงาน</h1>
        <p className="text-sm text-gray-500 mt-1 m-0">สรุปงานที่ต้องรับผิดชอบ</p>
      </div>

      {/* ===== Stats Cards ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* รวมทั้งหมด */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50">
              <InboxIcon />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800 m-0 leading-none">{stats.total}</p>
              <p className="text-sm text-gray-500 mt-1 m-0">เรื่องร้องเรียนทั้งหมด</p>
            </div>
          </div>
        </div>

        {/* รอดำเนินการ */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50">
              <ClockIcon className="text-gray-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800 m-0 leading-none">{stats.pending}</p>
              <p className="text-sm text-gray-500 mt-1 m-0">รอดำเนินการ</p>
            </div>
          </div>
        </div>

        {/* อนุมัติรับเรื่อง */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-teal-50">
              <ApprovedIcon />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800 m-0 leading-none">{stats.approved}</p>
              <p className="text-sm text-gray-500 mt-1 m-0">อนุมัติรับเรื่อง</p>
            </div>
          </div>
        </div>

        {/* เข้าที่ประชุม */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-50">
              <InMeetingIcon />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800 m-0 leading-none">{stats.in_meeting}</p>
              <p className="text-sm text-gray-500 mt-1 m-0">เข้าที่ประชุม</p>
            </div>
          </div>
        </div>

        {/* กำลังดำเนินการ */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50">
              <ActivityIcon />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800 m-0 leading-none">{stats.in_progress}</p>
              <p className="text-sm text-gray-500 mt-1 m-0">กำลังดำเนินการ</p>
            </div>
          </div>
        </div>

        {/* แก้ไขแล้ว / ปิด */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50">
              <CheckCircleIcon />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800 m-0 leading-none">{stats.resolved}</p>
              <p className="text-sm text-gray-500 mt-1 m-0">แก้ไขแล้ว / ปิด</p>
            </div>
          </div>
        </div>

        {/* ปฏิเสธ */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50">
              <CrossIcon />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800 m-0 leading-none">{stats.rejected}</p>
              <p className="text-sm text-gray-500 mt-1 m-0">ปฏิเสธ</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Single Clean Table for Recent/Urgent Complaints ===== */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 m-0">เรื่องร้องเรียนล่าสุด</h2>
          <Link
            href="/staff/complaints"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-amber-600 no-underline transition-colors"
          >
            ดูทั้งหมด
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>

        <div className="overflow-x-auto">
          {recentComplaints.length === 0 && urgentComplaints.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-200">
                <InboxIcon />
              </div>
              <h3 className="text-base font-semibold text-gray-700 mb-2">ยังไม่มีเรื่องร้องเรียน</h3>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-50/50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-4 font-medium">รหัสคำร้อง</th>
                  <th className="px-6 py-4 font-medium">หัวข้อ/รายละเอียด</th>
                  <th className="px-6 py-4 font-medium">สถานที่</th>
                  <th className="px-6 py-4 font-medium">วันที่รับแจ้ง</th>
                  <th className="px-6 py-4 font-medium">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* Merge urgent and recent, removing duplicates */}
                {Array.from(new Map([...urgentComplaints, ...recentComplaints].map(item => [item.complaint_id, item])).values())
                  .slice(0, 8)
                  .map((c) => {
                  const days = getDaysAgo(c.reported_date);
                  const isUrgent = c.status === "pending" && days >= 3;
                  
                  // Badge styling
                  let bgClass = "bg-gray-100";
                  let textClass = "text-gray-600";
                  let dotClass = "bg-gray-500";
                  
                  if (c.status === "pending") {
                    bgClass = "bg-amber-100";
                    textClass = "text-amber-800";
                    dotClass = "bg-amber-500";
                  } else if (c.status === "approved") {
                    bgClass = "bg-teal-100";
                    textClass = "text-teal-800";
                    dotClass = "bg-teal-500";
                  } else if (c.status === "in_meeting") {
                    bgClass = "bg-purple-100";
                    textClass = "text-purple-800";
                    dotClass = "bg-purple-500";
                  } else if (c.status === "in_progress") {
                    bgClass = "bg-blue-100";
                    textClass = "text-blue-800";
                    dotClass = "bg-blue-500";
                  } else if (c.status === "resolved" || c.status === "closed") {
                    bgClass = "bg-green-100";
                    textClass = "text-green-800";
                    dotClass = "bg-green-500";
                  } else if (c.status === "rejected") {
                    bgClass = "bg-red-100";
                    textClass = "text-red-800";
                    dotClass = "bg-red-500";
                  }

                  return (
                    <tr
                      key={c.complaint_id}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                      onClick={() => window.location.href = `/staff/complaints/${c.complaint_id}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {isUrgent && (
                            <span className="flex w-2 h-2 rounded-full bg-red-500 animate-pulse" title="เรื่องด่วน" />
                          )}
                          <span className="font-semibold text-amber-600 group-hover:text-amber-700 transition-colors">
                            {c.ticket_no || `#${c.complaint_id}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800 max-w-[280px] truncate">
                          {c.subject}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 max-w-[150px] truncate">
                        {c.location_written || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(c.reported_date).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "2-digit",
                        })}
                        {days > 0 && c.status === "pending" && (
                          <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${isUrgent ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                            {formatDaysAgo(days)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${bgClass} ${textClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                          {statusLabels[c.status] || c.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
