"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import api from "@/lib/api";

/* ===== Types ===== */
interface Complaint {
  complaint_id: number;
  ticket_no: string;
  subject: string;
  status: string;
  reported_date: string;
  location_written: string | null;
}

interface Stats {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  rejected: number;
}

/* ===== Helpers ===== */
const statusLabels: Record<string, string> = {
  pending: "รอดำเนินการ",
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

/* ===== Icon Components ===== */
const InboxIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ActivityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const AlertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const ListIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const ZapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

/* ===== Page Component ===== */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function StaffDashboardPage() {
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, in_progress: 0, resolved: 0, rejected: 0 });
  const [urgentComplaints, setUrgentComplaints] = useState<Complaint[]>([]);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await api.get('/complaints/all');
        const json = res.data;

        if (json.success && json.data) {
          const complaints = json.data;

          // คำนวณ Stats
          setStats({
            total: complaints.length,
            pending: complaints.filter((c: Complaint) => c.status === "pending").length,
            in_progress: complaints.filter((c: Complaint) => c.status === "in_progress").length,
            resolved: complaints.filter((c: Complaint) => c.status === "resolved" || c.status === "closed").length,
            rejected: complaints.filter((c: Complaint) => c.status === "rejected").length,
          });

          // เรื่องเร่งด่วน = pending ที่นานเกิน 3 วัน + pending ใหม่ทั้งหมด
          const urgent = complaints
            .filter((c: Complaint) => c.status === "pending")
            .sort((a: Complaint, b: Complaint) => new Date(a.reported_date).getTime() - new Date(b.reported_date).getTime())
            .slice(0, 6);
          setUrgentComplaints(urgent);

          // เรื่องล่าสุดทั้งหมด (5 รายการ)
          setRecentComplaints(complaints.slice(0, 5));
        }
      } catch (error) {
        console.error("Fetch dashboard data error:", error);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="mb-1">
        <h1 className="text-[18px] md:text-2xl font-bold text-gray-900 m-0 tracking-tight">ภาพรวมงาน</h1>
        <p className="text-sm text-gray-500 mt-1 m-0">สรุปงานที่ต้องรับผิดชอบ</p>
      </div>

      {/* ===== Stats Cards ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {/* รวมทั้งหมด */}
        <div className="bg-white rounded-xl p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-black/5 flex items-start gap-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)]">
          <div className="w-11 h-11 rounded-xl bg-[#3b5bff]/10 text-[#3b5bff] flex items-center justify-center shrink-0">
            <InboxIcon />
          </div>
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-1">ร้องเรียนทั้งหมด</div>
            <div className="text-[26px] font-bold text-[#1a1a2e] leading-none sm:text-[22px] md:text-[26px]">{stats.total}<span className="text-[13px] font-normal text-gray-400 ml-1">เรื่อง</span></div>
          </div>
        </div>

        {/* รอดำเนินการ */}
        <div className="bg-white rounded-xl p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-black/5 flex items-start gap-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)]">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <ClockIcon />
          </div>
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-1">รอดำเนินการ</div>
            <div className="text-[26px] font-bold text-[#1a1a2e] leading-none sm:text-[22px] md:text-[26px]">{stats.pending}<span className="text-[13px] font-normal text-gray-400 ml-1">เรื่อง</span></div>
          </div>
        </div>

        {/* กำลังดำเนินการ */}
        <div className="bg-white rounded-xl p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-black/5 flex items-start gap-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)]">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <ActivityIcon />
          </div>
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-1">กำลังดำเนินการ</div>
            <div className="text-[26px] font-bold text-[#1a1a2e] leading-none sm:text-[22px] md:text-[26px]">{stats.in_progress}<span className="text-[13px] font-normal text-gray-400 ml-1">เรื่อง</span></div>
          </div>
        </div>

        {/* แก้ไขแล้ว */}
        <div className="bg-white rounded-xl p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-black/5 flex items-start gap-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)]">
          <div className="w-11 h-11 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-1">แก้ไขแล้ว / ปิด</div>
            <div className="text-[26px] font-bold text-[#1a1a2e] leading-none sm:text-[22px] md:text-[26px]">{stats.resolved}<span className="text-[13px] font-normal text-gray-400 ml-1">เรื่อง</span></div>
          </div>
        </div>

        {/* ปฏิเสธ */}
        <div className="bg-white rounded-xl p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-black/5 flex items-start gap-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)]">
          <div className="w-11 h-11 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-1">ปฏิเสธ</div>
            <div className="text-[26px] font-bold text-[#1a1a2e] leading-none sm:text-[22px] md:text-[26px]">{stats.rejected}<span className="text-[13px] font-normal text-gray-400 ml-1">เรื่อง</span></div>
          </div>
        </div>
      </div>

      {/* ===== Quick Actions ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5">
        <Link href="/staff/complaints?status=pending" className="bg-white rounded-xl py-5.5 px-5 border border-black/5 shadow-[0_1px_6px_rgba(0,0,0,0.04)] flex flex-col items-center gap-2.5 text-center transition-all duration-200 hover:border-amber-500/30 hover:shadow-[0_6px_20px_rgba(245,158,11,0.1)] hover:-translate-y-0.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <ZapIcon />
          </div>
          <div className="text-[13px] font-semibold text-gray-700">เรื่องรอรับ</div>
          <div className="text-[11px] text-gray-400 -mt-1.5">{stats.pending} เรื่องรอดำเนินการ</div>
        </Link>

        <Link href="/staff/complaints?status=in_progress" className="bg-white rounded-xl py-5.5 px-5 border border-black/5 shadow-[0_1px_6px_rgba(0,0,0,0.04)] flex flex-col items-center gap-2.5 text-center transition-all duration-200 hover:border-amber-500/30 hover:shadow-[0_6px_20px_rgba(245,158,11,0.1)] hover:-translate-y-0.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <ActivityIcon />
          </div>
          <div className="text-[13px] font-semibold text-gray-700">กำลังดำเนินการ</div>
          <div className="text-[11px] text-gray-400 -mt-1.5">{stats.in_progress} เรื่องอยู่ระหว่างแก้ไข</div>
        </Link>

        <Link href="/staff/complaints" className="bg-white rounded-xl py-5.5 px-5 border border-black/5 shadow-[0_1px_6px_rgba(0,0,0,0.04)] flex flex-col items-center gap-2.5 text-center transition-all duration-200 hover:border-amber-500/30 hover:shadow-[0_6px_20px_rgba(245,158,11,0.1)] hover:-translate-y-0.5">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center">
            <ListIcon />
          </div>
          <div className="text-[13px] font-semibold text-gray-700">ดูทั้งหมด</div>
          <div className="text-[11px] text-gray-400 -mt-1.5">เรื่องร้องเรียนทุกสถานะ</div>
        </Link>
      </div>

      {/* ===== Two-Column: เรื่องเร่งด่วน + ล่าสุด ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ซ้าย: เรื่องที่รอดำเนินการ (เรียงตามเก่าสุด) */}
        <div className="bg-white rounded-xl border border-black/5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="flex items-center justify-between pt-4.5 px-5.5 pb-3.5 border-b border-[#f3f3f3]">
            <h2 className="text-[15px] font-semibold text-[#1a1a2e] flex items-center gap-2 m-0">
              <span className="opacity-70"><AlertIcon /></span>
              เรื่องที่รอดำเนินการ
            </h2>
            <Link href="/staff/complaints?status=pending" className="text-xs text-amber-500 font-medium transition-colors hover:text-amber-600 hover:underline">
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="py-2 px-0">
            {urgentComplaints.length === 0 ? (
              <div className="text-center py-9 px-5">
                <p className="text-[13px] text-[#bbb]">ไม่มีเรื่องที่รอดำเนินการ 🎉</p>
              </div>
            ) : (
              urgentComplaints.map((c) => {
                const days = getDaysAgo(c.reported_date);
                const isOld = days >= 3;
                return (
                  <Link
                    key={c.complaint_id}
                    href={`/staff/complaints/${c.complaint_id}`}
                    className="flex items-center gap-3.5 py-3.5 px-5.5 border-b border-[#f8f8f8] last:border-0 transition-colors hover:bg-[#fdfaf0] text-inherit no-underline"
                  >
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isOld ? "bg-red-500 animate-[pulse-urgency_1.2s_ease-in-out_infinite]" : "bg-amber-500 animate-[pulse-urgency_1.8s_ease-in-out_infinite]"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-amber-500 font-semibold mb-0.5 tracking-wide">{c.ticket_no || `#${c.complaint_id}`}</div>
                      <div className="text-sm font-medium text-[#1a1a2e] whitespace-nowrap overflow-hidden text-ellipsis mb-1">{c.subject}</div>
                      <div className="text-[11px] text-[#aaa]">
                        {c.location_written || "ไม่ระบุสถานที่"}
                      </div>
                    </div>
                    <span className={`shrink-0 text-[11px] font-semibold py-1 px-2 rounded-md ${isOld ? "text-red-500 bg-red-100" : "text-gray-500 bg-gray-100"}`}>
                      {formatDaysAgo(days)}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* ขวา: เรื่องล่าสุดทั้งหมด */}
        <div className="bg-white rounded-xl border border-black/5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="flex items-center justify-between pt-4.5 px-5.5 pb-3.5 border-b border-[#f3f3f3]">
            <h2 className="text-[15px] font-semibold text-[#1a1a2e] flex items-center gap-2 m-0">
              <span className="opacity-70"><ClockIcon /></span>
              เรื่องร้องเรียนล่าสุด
            </h2>
            <Link href="/staff/complaints" className="text-xs text-amber-500 font-medium transition-colors hover:text-amber-600 hover:underline">
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="py-2 px-0">
            {recentComplaints.length === 0 ? (
              <div className="text-center py-9 px-5">
                <p className="text-[13px] text-[#bbb]">ยังไม่มีเรื่องร้องเรียน</p>
              </div>
            ) : (
              recentComplaints.map((c) => {
                // กำหนด icon type ตาม status
                let iconClass = "bg-amber-100 text-amber-600";
                let icon = <AlertIcon />;
                if (c.status === "resolved" || c.status === "closed") {
                  iconClass = "bg-violet-100 text-violet-600";
                  icon = <CheckCircleIcon />;
                } else if (c.status === "in_progress") {
                  iconClass = "bg-emerald-100 text-emerald-600";
                  icon = <ActivityIcon />;
                } else if (c.status === "rejected") {
                  iconClass = "bg-red-100 text-red-600";
                  icon = (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  );
                }

                return (
                  <Link
                    key={c.complaint_id}
                    href={`/staff/complaints/${c.complaint_id}`}
                    className="flex items-start gap-3.5 py-3.5 px-5.5 border-b border-[#f8f8f8] last:border-0 no-underline"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-px ${iconClass}`}>{icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] text-gray-700 leading-relaxed">
                        <span className="font-semibold text-amber-500">{c.ticket_no || `#${c.complaint_id}`}</span>
                        {"  "}
                        <strong className="text-[#1a1a2e] font-semibold">{c.subject}</strong>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap ${c.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          c.status === 'in_progress' ? 'bg-emerald-100 text-emerald-800' :
                            c.status === 'resolved' ? 'bg-violet-100 text-violet-800' :
                              c.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-600'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'pending' ? 'bg-amber-500' :
                            c.status === 'in_progress' ? 'bg-emerald-500' :
                              c.status === 'resolved' ? 'bg-violet-500' :
                                c.status === 'rejected' ? 'bg-red-500' :
                                  'bg-gray-500'
                            }`} />
                          {statusLabels[c.status] || c.status}
                        </span>
                        <span className="text-[11px] text-[#bbb] mt-0.5">
                          {new Date(c.reported_date).toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
