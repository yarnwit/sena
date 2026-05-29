"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/* ===== Types ===== */
interface Complaint {
  complaint_id: number;
  ticket_no: string;
  subject: string;
  status: string;
  reported_date: string;
  approved?: boolean;
}

interface Stats {
  pending: number;
  resolved: number;
  approved: number;
  rejected: number;
}

/* ===== Status Config ===== */
const statusConfig: Record<string, { label: string; bgClass: string; textClass: string }> = {
  pending: { label: "รอดำเนินการ", bgClass: "bg-amber-100", textClass: "text-amber-700" },
  approved: { label: "อนุมัติรับเรื่อง", bgClass: "bg-green-100", textClass: "text-green-700" },
  in_meeting: { label: "เข้าที่ประชุม", bgClass: "bg-purple-100", textClass: "text-purple-700" },
  in_progress: { label: "กำลังดำเนินการ", bgClass: "bg-blue-100", textClass: "text-blue-700" },
  resolved: { label: "แก้ไขแล้ว", bgClass: "bg-green-100", textClass: "text-green-700" },
  rejected: { label: "ไม่อนุมัติ", bgClass: "bg-red-100", textClass: "text-red-700" },
  closed: { label: "ปิดเรื่อง", bgClass: "bg-gray-100", textClass: "text-gray-500" },
};

/* ===== Icon Components ===== */
const ClockIcon = () => (
  <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={`w-8 h-8 ${className || "text-blue-500"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ApprovedIcon = () => (
  <svg className="w-8 h-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const RejectedIcon = () => (
  <svg className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ pending: 0, resolved: 0, approved: 0, rejected: 0 });
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [houseNo, setHouseNo] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/complaints/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();
        if (json.success && json.data) {
          const complaints: Complaint[] = json.data;
          setRecentComplaints(complaints.slice(0, 5));
          setStats({
            pending: complaints.filter((c) => c.status === "pending" || c.status === "in_progress").length,
            resolved: complaints.filter((c) => c.status === "closed").length,
            approved: complaints.filter((c) => c.status === "resolved").length,
            rejected: complaints.filter((c) => c.status === "rejected").length,
          });
        }

        // Fetch user-info to get house_no
        const userRes = await fetch(`${API_URL}/complaints/user-info`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userJson = await userRes.json();
        if (userJson.success && userJson.data) {
          setHouseNo(userJson.data.house_no || "");
        }
      } catch {
        // fallback
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-3 border-gray-200 border-t-[#d4a574] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-[18px] md:text-2xl font-bold text-gray-900 m-0 tracking-tight">ภาพรวมเรื่องร้องเรียน</h1>
          <p className="text-sm text-gray-500 mt-1 m-0">สรุปสถานะการร้องเรียนของคุณทั้งหมด</p>
        </div>

      {/* Stats Cards - 2x2 Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: เรื่องที่รอดำเนินการ */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50">
              <ClockIcon />
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-bold text-gray-800 m-0 leading-none">{stats.pending}</p>
              <p className="text-sm text-gray-500 mt-1 m-0">เรื่องที่รอดำเนินการ</p>
            </div>
          </div>
        </div>

        {/* Card 2: เรื่องที่แก้ไขแล้ว */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50">
              <CheckCircleIcon className="text-blue-500" />
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-bold text-gray-800 m-0 leading-none">{stats.resolved}</p>
              <p className="text-sm text-gray-500 mt-1 m-0">เรื่องที่แก้ไขแล้ว</p>
            </div>
          </div>
        </div>

        {/* Card 3: คำร้องที่ได้รับการอนุมัติ */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50">
              <ApprovedIcon />
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-bold text-gray-800 m-0 leading-none">{stats.approved}</p>
              <p className="text-sm text-gray-500 mt-1 m-0">คำร้องที่ได้รับการอนุมัติ</p>
            </div>
          </div>
        </div>

        {/* Card 4: คำร้องที่ไม่ได้รับการอนุมัติ */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50">
              <RejectedIcon />
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-bold text-gray-800 m-0 leading-none">{stats.rejected}</p>
              <p className="text-sm text-gray-500 mt-1 m-0">คำร้องที่ไม่ได้รับการอนุมัติ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Complaints Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 m-0">ติดตามสถานะคำร้องล่าสุด</h2>
          <Link
            href="/resident/complaints"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#d4a574] no-underline transition-colors"
          >
            ดูทั้งหมด
            <ChevronRightIcon />
          </Link>
        </div>

        {recentComplaints.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 px-6">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-200">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-2">ยังไม่มีเรื่องร้องเรียน</h3>
            <p className="text-sm text-gray-400 mb-6">เริ่มสร้างเรื่องร้องเรียนเพื่อแจ้งปัญหาของคุณ</p>
            <Link
              href="/resident/complaints/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#d4a574] hover:bg-[#b8865a] text-white rounded-xl text-sm font-medium no-underline transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              สร้างคำร้องใหม่
            </Link>
          </div>
        ) : (
          /* Desktop Table */
          <>
            {/* Desktop view */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-3 font-medium">รหัสคำร้อง</th>
                    <th className="px-6 py-3 font-medium">หัวข้อ/รายละเอียด</th>
                    <th className="px-6 py-3 font-medium">บ้านเลขที่</th>
                    <th className="px-6 py-3 font-medium">วันที่ส่ง</th>
                    <th className="px-6 py-3 font-medium">สถานะ</th>
                    <th className="px-6 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentComplaints.map((complaint) => {
                    const config = statusConfig[complaint.status] || statusConfig.pending;
                    return (
                      <tr
                        key={complaint.complaint_id}
                        className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                        onClick={() => window.location.href = `/resident/complaints/${complaint.complaint_id}`}
                      >
                        <td className="px-6 py-4 font-medium text-gray-700">
                          {complaint.ticket_no || `REQ-${complaint.complaint_id}`}
                        </td>
                        <td className="px-6 py-4 text-gray-600 max-w-[200px] truncate">
                          {complaint.subject}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {houseNo || "-"}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(complaint.reported_date).toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                            year: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bgClass} ${config.textClass}`}
                          >
                            {config.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/resident/complaints/${complaint.complaint_id}`}
                            className="text-[#d4a574] hover:text-[#b8865a] text-xs font-medium no-underline transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            ดูรายละเอียด →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile card view */}
            <div className="sm:hidden divide-y divide-gray-50">
              {recentComplaints.map((complaint) => {
                const config = statusConfig[complaint.status] || statusConfig.pending;
                return (
                  <Link
                    key={complaint.complaint_id}
                    href={`/resident/complaints/${complaint.complaint_id}`}
                    className="block px-5 py-4 hover:bg-gray-50/50 no-underline transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#d4a574] m-0 mb-1">
                          {complaint.ticket_no || `REQ-${complaint.complaint_id}`}
                        </p>
                        <p className="text-sm font-medium text-gray-800 m-0 mb-1 truncate">
                          {complaint.subject}
                        </p>
                        <p className="text-xs text-gray-400 m-0">
                          {new Date(complaint.reported_date).toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                            year: "2-digit",
                          })}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${config.bgClass} ${config.textClass}`}
                      >
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
    </div>
  );
}
