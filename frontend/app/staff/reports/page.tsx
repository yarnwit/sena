"use client";

import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Complaint {
  complaint_id: number;
  status: string;
  reported_date: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-400",
  in_meeting: "bg-purple-500",
  in_progress: "bg-blue-500",
  resolved: "bg-green-500",
  rejected: "bg-red-500",
  closed: "bg-gray-400"
};

const statusLabels: Record<string, string> = {
  pending: "รอดำเนินการ",
  in_meeting: "เข้าที่ประชุม",
  in_progress: "รอดำเนินการแก้ไข",
  resolved: "แก้ไขเสร็จ",
  rejected: "ไม่อนุมัติ",
  closed: "ปิดเรื่อง"
};

export default function StaffReportsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState("all");

  useEffect(() => {
    fetchComplaints();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-3 border-gray-200 border-t-[#d4a574] rounded-full animate-spin" />
      </div>
    );
  }

  // Filter logic
  const filteredComplaints = complaints.filter(c => {
    if (monthFilter === "all") return true;
    const date = new Date(c.reported_date);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    return monthYear === monthFilter;
  });

  // Calculate Stats
  const total = filteredComplaints.length;
  const pending = filteredComplaints.filter(c => c.status === "pending").length;
  const inMeeting = filteredComplaints.filter(c => c.status === "in_meeting").length;
  const inProgress = filteredComplaints.filter(c => c.status === "in_progress").length;
  const resolved = filteredComplaints.filter(c => c.status === "resolved").length;
  const rejected = filteredComplaints.filter(c => c.status === "rejected").length;
  const closed = filteredComplaints.filter(c => c.status === "closed").length;

  const getPercent = (count: number) => total > 0 ? Math.round((count / total) * 100) : 0;

  // Extract unique months for filter
  const months = Array.from(new Set(complaints.map(c => {
    const d = new Date(c.reported_date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }))).sort().reverse();

  const formatMonth = (val: string) => {
    if (val === "all") return "ทั้งหมด";
    const [y, m] = val.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1);
    return date.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 m-0">รายงานและสถิติ (Analytics)</h1>
          <p className="text-sm text-gray-400 mt-1 m-0">ภาพรวมข้อมูลและการจัดการเรื่องร้องเรียน</p>
        </div>
        <div className="w-full sm:w-auto">
          <select 
            value={monthFilter} 
            onChange={(e) => setMonthFilter(e.target.value)}
            className="w-full sm:w-48 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:border-[#d4a574] focus:ring-2 focus:ring-amber-100 transition-all"
          >
            <option value="all">ทุกช่วงเวลา</option>
            {months.map(m => (
              <option key={m} value={m}>{formatMonth(m)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group hover:border-[#d4a574]/30 transition-colors">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-gray-50 rounded-full group-hover:bg-[#d4a574]/5 transition-colors" />
          <p className="text-sm font-medium text-gray-500 relative z-10">เรื่องร้องเรียนทั้งหมด</p>
          <div className="mt-2 flex items-baseline gap-2 relative z-10">
            <span className="text-3xl font-bold text-gray-800">{total}</span>
            <span className="text-xs text-gray-400">รายการ</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group hover:border-amber-400/30 transition-colors">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 rounded-full group-hover:bg-amber-100/50 transition-colors" />
          <p className="text-sm font-medium text-gray-500 relative z-10">รอคิว / เตรียมประชุม</p>
          <div className="mt-2 flex items-baseline gap-2 relative z-10">
            <span className="text-3xl font-bold text-amber-500">{pending + inMeeting}</span>
            <span className="text-xs text-gray-400">รายการ</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group hover:border-blue-400/30 transition-colors">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:bg-blue-100/50 transition-colors" />
          <p className="text-sm font-medium text-gray-500 relative z-10">กำลังรอการแก้ไข</p>
          <div className="mt-2 flex items-baseline gap-2 relative z-10">
            <span className="text-3xl font-bold text-blue-500">{inProgress}</span>
            <span className="text-xs text-gray-400">รายการ</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group hover:border-green-400/30 transition-colors">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-50 rounded-full group-hover:bg-green-100/50 transition-colors" />
          <p className="text-sm font-medium text-gray-500 relative z-10">แก้ไขเสร็จ / ปิดเรื่อง</p>
          <div className="mt-2 flex items-baseline gap-2 relative z-10">
            <span className="text-3xl font-bold text-green-500">{resolved + closed}</span>
            <span className="text-xs text-gray-400">รายการ</span>
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Status Breakdown (Bar Chart Concept using CSS) */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#d4a574]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
            สัดส่วนสถานะเรื่องร้องเรียน
          </h3>
          
          <div className="space-y-4">
            {[
              { status: 'pending', count: pending },
              { status: 'in_meeting', count: inMeeting },
              { status: 'in_progress', count: inProgress },
              { status: 'resolved', count: resolved },
              { status: 'rejected', count: rejected },
              { status: 'closed', count: closed },
            ].map(item => {
              const pct = getPercent(item.count);
              return (
                <div key={item.status} className="group">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-xs font-semibold text-gray-600">{statusLabels[item.status]}</span>
                    <span className="text-xs text-gray-500">{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full ${statusColors[item.status]} transition-all duration-1000 ease-out`} 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Funnel Concept */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#d4a574]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            ประสิทธิภาพการทำงาน (Funnel)
          </h3>
          
          <div className="flex-1 flex flex-col justify-center space-y-3 px-8">
            <div className="w-full relative">
              <div className="bg-gray-800 text-white py-3 rounded-xl text-center text-sm font-semibold shadow-md relative z-30 transform hover:scale-105 transition-transform">
                เรื่องเข้าทั้งหมด ({total})
              </div>
            </div>
            <div className="w-11/12 mx-auto relative">
              <div className="bg-[#d4a574] text-white py-3 rounded-xl text-center text-sm font-semibold shadow-md relative z-20 transform hover:scale-105 transition-transform">
                ถูกนำมาพิจารณา/ประชุม ({total - pending})
              </div>
            </div>
            <div className="w-5/6 mx-auto relative">
              <div className="bg-blue-600 text-white py-3 rounded-xl text-center text-sm font-semibold shadow-md relative z-10 transform hover:scale-105 transition-transform">
                ส่งช่างแก้ไข ({inProgress + resolved + closed})
              </div>
            </div>
            <div className="w-3/4 mx-auto relative">
              <div className="bg-green-500 text-white py-3 rounded-xl text-center text-sm font-semibold shadow-md relative z-0 transform hover:scale-105 transition-transform">
                แก้ไขเสร็จสิ้น ({resolved + closed})
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">อัตราความสำเร็จในการแก้ไข: <strong className="text-green-600 text-sm">{getPercent(resolved + closed)}%</strong></p>
          </div>
        </div>

      </div>
    </div>
  );
}
