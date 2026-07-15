"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import api from "@/lib/api";

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
  approved: { label: "อนุมัติรับเรื่อง", bgClass: "bg-green-100", textClass: "text-green-700" },
  in_meeting: { label: "เข้าที่ประชุม", bgClass: "bg-purple-100", textClass: "text-purple-700" },
  in_progress: { label: "กำลังดำเนินการ", bgClass: "bg-blue-100", textClass: "text-blue-700" },
  resolved: { label: "แก้ไขแล้ว", bgClass: "bg-green-100", textClass: "text-green-700" },
  rejected: { label: "ไม่อนุมัติ", bgClass: "bg-red-100", textClass: "text-red-700" },
  closed: { label: "ปิดเรื่อง", bgClass: "bg-gray-100", textClass: "text-gray-500" },
};

function StaffPendingContent() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const setQuickDate = (amount: number, unit: 'days' | 'months') => {
    const end = new Date();
    const start = new Date();
    if (unit === 'days') {
      start.setDate(end.getDate() - amount);
    } else {
      start.setMonth(end.getMonth() - amount);
    }
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  };
  
  // Bulk update states
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints/all');

      if (res.data?.success && res.data?.data) {
        // Only load pending
        const pendingComplaints = res.data.data.filter((c: Complaint) => c.status === 'pending');
        setComplaints(pendingComplaints);
      }
    } catch {
      // fallback
    }
    setLoading(false);
  };

  const refreshComplaints = async () => {
    try {
      const res = await api.get(`/complaints/all`);
        if (res.data.success && res.data.data) {
          const pendingComplaints = res.data.data.filter((c: Complaint) => c.status === 'pending');
          setComplaints(pendingComplaints);
        }
    } catch {}
  };

  // Filter based on search & date
  const filtered = complaints.filter((c) => {
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

    return matchSearch && matchDate;
  });

  // Bulk selection logic
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filtered.map(c => c.complaint_id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkUpdate = async (newStatus: string) => {
    if (selectedIds.length === 0) return;
    const actionName = statusConfig[newStatus]?.label || newStatus;
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะเปลี่ยนสถานะ ${selectedIds.length} รายการที่เลือกเป็น "${actionName}"?`)) return;

    setIsBulkUpdating(true);
    try {
      const res = await api.patch('/complaints/staff/bulk-status', {
        complaintIds: selectedIds,
        status: newStatus
      });
      
      if (res.data.success) {
        alert(res.data.message || 'อัปเดตสถานะสำเร็จ');
        setSelectedIds([]);
        await refreshComplaints();
      } else {
        alert("เกิดข้อผิดพลาด: " + res.data.message);
      }
    } catch (error: any) {
      alert("เกิดข้อผิดพลาดในการบันทึก: " + (error.response?.data?.message || error.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์"));
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-3 border-gray-200 border-t-[#d4a574] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .print-section { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          .print-section table { border-collapse: collapse; width: 100%; }
          .print-section th, .print-section td { border: 1px solid #ddd; padding: 8px; text-align: left; color: #000; }
          .print-section th { background-color: #f2f2f2; -webkit-print-color-adjust: exact; }
        }
      `}} />

      <div className="space-y-6 animate-in fade-in duration-500 print-section">
        
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 m-0">รอตรวจสอบ</h1>
            <p className="text-sm text-gray-400 mt-1 m-0 no-print">พิจารณาเรื่องร้องเรียนใหม่ที่เพิ่งถูกส่งเข้ามาในระบบ</p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 no-print">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[200px] max-w-lg">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          </svg>
                          <input
                            type="text"
                            placeholder="ค้นหาเรื่องร้องเรียน..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-[#d4a574] focus:ring-2 focus:ring-amber-100"
                          />
            </div>

          {/* Date Filter Dropdown */}
          <div className="relative w-full sm:w-auto shrink-0 z-40">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${
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
              <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 animate-in fade-in slide-in-from-top-2">
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
                  
                  <div className="pt-3 mt-1 border-t border-gray-100 grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setQuickDate(7, 'days')} className="w-full px-2 py-2 text-xs bg-white hover:bg-amber-50 text-gray-600 hover:text-amber-600 font-medium rounded-xl border border-gray-200 hover:border-amber-200 transition-all cursor-pointer text-center">ย้อนหลัง 1 สัปดาห์</button>
                    <button type="button" onClick={() => setQuickDate(14, 'days')} className="w-full px-2 py-2 text-xs bg-white hover:bg-amber-50 text-gray-600 hover:text-amber-600 font-medium rounded-xl border border-gray-200 hover:border-amber-200 transition-all cursor-pointer text-center">ย้อนหลัง 2 สัปดาห์</button>
                    <button type="button" onClick={() => setQuickDate(21, 'days')} className="w-full px-2 py-2 text-xs bg-white hover:bg-amber-50 text-gray-600 hover:text-amber-600 font-medium rounded-xl border border-gray-200 hover:border-amber-200 transition-all cursor-pointer text-center">ย้อนหลัง 3 สัปดาห์</button>
                    <button type="button" onClick={() => setQuickDate(1, 'months')} className="w-full px-2 py-2 text-xs bg-white hover:bg-amber-50 text-gray-600 hover:text-amber-600 font-medium rounded-xl border border-gray-200 hover:border-amber-200 transition-all cursor-pointer text-center">ย้อนหลัง 1 เดือน</button>
                    <button type="button" onClick={() => setQuickDate(3, 'months')} className="w-full px-2 py-2 text-xs bg-white hover:bg-amber-50 text-gray-600 hover:text-amber-600 font-medium rounded-xl border border-gray-200 hover:border-amber-200 transition-all cursor-pointer text-center">ย้อนหลัง 3 เดือน</button>
                    <button type="button" onClick={() => setQuickDate(6, 'months')} className="w-full px-2 py-2 text-xs bg-white hover:bg-amber-50 text-gray-600 hover:text-amber-600 font-medium rounded-xl border border-gray-200 hover:border-amber-200 transition-all cursor-pointer text-center">ย้อนหลัง 6 เดือน</button>
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>

          <button
            onClick={handlePrint}
            className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            พิมพ์รายการ
          </button>
        </div>

        {/* Content Table */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16 px-6 no-print">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-200">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-2">ไม่มีรายการ</h3>
            <p className="text-sm text-gray-400 mb-6">ขณะนี้ไม่มีเรื่องร้องเรียนใหม่ที่รอตรวจสอบ</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-amber-50/50 px-6 py-4 border-b border-amber-100 flex items-center justify-between no-print">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-900 m-0">รายการเรื่องร้องเรียนใหม่</p>
                  <p className="text-xs text-amber-600 m-0 mt-0.5">พิจารณารับเรื่อง หรือ ปัดตก</p>
                </div>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
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
                    const isSelected = selectedIds.includes(c.complaint_id);
                    return (
                      <tr
                        key={c.complaint_id}
                        className="hover:bg-amber-50/30 transition-colors cursor-pointer"
                        onClick={() => window.location.href = `/staff/complaints/${c.complaint_id}`}
                      >
                        
                        <td className="px-6 py-4 font-semibold text-[#d4a574] text-sm">
                          {c.ticket_no || `#${c.complaint_id}`}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-700 max-w-[300px]">
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
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig[c.status]?.bgClass || "bg-gray-100"} ${statusConfig[c.status]?.textClass || "text-gray-500"}`}>
                            {statusConfig[c.status]?.label || "ไม่ระบุ"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
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
            <div className="sm:hidden divide-y divide-gray-100 no-print">
              {filtered.map((c) => {
                const isSelected = selectedIds.includes(c.complaint_id);
                return (
                  <Link
                    key={c.complaint_id}
                    href={`/staff/complaints/${c.complaint_id}`}
                    className="block bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 no-underline hover:border-amber-200 transition-colors"
                  >
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-[#d4a574]">
                          {c.ticket_no || `#${c.complaint_id}`}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(c.reported_date).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-gray-800 mt-1 mb-1 truncate">
                        {c.subject}
                      </h4>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-700 font-semibold text-xs shrink-0">
                          🏠 {c.house_no || "-"}
                        </span>
                        <span className="text-xs text-gray-500 truncate">
                          {c.first_name && c.last_name ? `${c.first_name} ${c.last_name}` : "-"}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Right Sidebar Slide-over (Bulk Action) */}
        <div className="no-print">
          {false && (
            <div className="fixed inset-0 z-50 flex justify-end">
              <div 
                className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => setSelectedIds([])}
              />
              
              <div className="relative w-full max-w-sm sm:max-w-md h-full bg-white/95 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.1)] flex flex-col animate-in slide-in-from-right duration-300 border-l border-white/50">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 m-0">พิจารณาเรื่องร้องเรียน</h3>
                    <p className="text-xs text-gray-500 m-0 mt-1">เลือกไว้ทั้งหมด <span className="font-bold text-[#d4a574]">{selectedIds.length}</span> รายการ</p>
                  </div>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                  {filtered.filter(c => selectedIds.includes(c.complaint_id)).map(c => (
                    <div key={c.complaint_id} className="bg-gray-50/80 rounded-xl p-3 border border-gray-100 flex items-start gap-3 transition-colors hover:border-[#d4a574]/30">
                      <div className="w-8 h-8 rounded-full bg-[#d4a574]/10 text-[#d4a574] flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#d4a574] truncate m-0">{c.ticket_no || `#${c.complaint_id}`}</p>
                        <p className="text-sm font-medium text-gray-700 truncate m-0 mt-0.5">{c.subject}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 border-t border-gray-100 bg-white shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">ดำเนินการ ({selectedIds.length} รายการ)</p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBulkUpdate('rejected')}
                      disabled={isBulkUpdating}
                      className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                      ไม่อนุมัติ
                    </button>
                    <button
                      onClick={() => handleBulkUpdate('approved')}
                      disabled={isBulkUpdating}
                      className="flex-[2] py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-green-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      อนุมัติรับเรื่อง
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </>
  );
}

export default function StaffPendingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-3 border-gray-200 border-t-[#d4a574] rounded-full animate-spin" />
      </div>
    }>
      <StaffPendingContent />
    </Suspense>
  );
}
