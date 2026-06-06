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

function StaffMeetingsContent() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Bulk update states
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = "http-only-cookie";
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/complaints/all`, { credentials: "include",
        headers: { },
      });

      const json = await res.json();
      if (json.success && json.data) {
        // Only load in_meeting
        const meetingComplaints = json.data.filter((c: Complaint) => c.status === 'in_meeting');
        setComplaints(meetingComplaints);
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
          const meetingComplaints = res.data.data.filter((c: Complaint) => c.status === 'in_meeting');
          setComplaints(meetingComplaints);
        }
    } catch {}
  };

  // Filter based on search
  const filtered = complaints.filter((c) => {
    const matchSearch =
      search === "" ||
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      (c.ticket_no && c.ticket_no.toLowerCase().includes(search.toLowerCase())) ||
      (c.location_written && c.location_written.toLowerCase().includes(search.toLowerCase()));

    return matchSearch;
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 m-0">นำเรื่องเข้าที่ประชุม</h1>
            <p className="text-sm text-gray-400 mt-1 m-0 no-print">จัดการวาระการประชุมและสรุปผลหลังการประชุม</p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 no-print">
          <div className="relative w-full max-w-md">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="ค้นหาวาระการประชุม..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-[#d4a574] focus:ring-2 focus:ring-amber-100"
            />
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            พิมพ์วาระการประชุม
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
            <p className="text-sm text-gray-400 mb-6">ขณะนี้ไม่มีเรื่องร้องเรียนที่รอเข้าที่ประชุม</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-purple-50/50 px-6 py-4 border-b border-purple-100 flex items-center justify-between no-print">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-purple-900 m-0">วาระการประชุมปัจจุบัน</p>
                  <p className="text-xs text-purple-600 m-0 mt-0.5">กรุณาเลือกรายการด้านล่างเพื่ออัปเดตมติที่ประชุม</p>
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
                    <th className="px-6 py-3.5 font-medium w-12 text-center no-print">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-[#d4a574] focus:ring-[#d4a574] cursor-pointer"
                        checked={filtered.length > 0 && selectedIds.length === filtered.length}
                        onChange={handleSelectAll}
                      />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((c) => {
                    const isSelected = selectedIds.includes(c.complaint_id);
                    return (
                      <tr
                        key={c.complaint_id}
                        className={`transition-colors cursor-pointer ${isSelected ? 'bg-amber-50/50' : 'hover:bg-gray-50'}`}
                        onClick={() => handleToggleSelect(c.complaint_id)}
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
                        <td className="px-6 py-4 text-center no-print" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-gray-300 text-[#d4a574] focus:ring-[#d4a574] cursor-pointer"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(c.complaint_id)}
                          />
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
                  <div
                    key={c.complaint_id}
                    className={`p-4 flex items-start gap-3 transition-colors cursor-pointer ${
                      isSelected ? "bg-amber-50/50" : "bg-white hover:bg-gray-50"
                    }`}
                    onClick={() => handleToggleSelect(c.complaint_id)}
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
                    <div className="flex flex-col items-end gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-gray-300 text-[#d4a574] focus:ring-[#d4a574] cursor-pointer"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(c.complaint_id)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Right Sidebar Slide-over (Bulk Action) */}
        <div className="no-print">
          {selectedIds.length > 0 && (
            <div className="fixed inset-0 z-50 flex justify-end">
              <div 
                className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => setSelectedIds([])}
              />
              
              <div className="relative w-full max-w-sm sm:max-w-md h-full bg-white/95 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.1)] flex flex-col animate-in slide-in-from-right duration-300 border-l border-white/50">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 m-0">อัปเดตมติที่ประชุม</h3>
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
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#d4a574] truncate m-0">{c.ticket_no || `#${c.complaint_id}`}</p>
                        <p className="text-sm font-medium text-gray-700 truncate m-0 mt-0.5">{c.subject}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 border-t border-gray-100 bg-white space-y-3 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">มติที่ประชุม ({selectedIds.length} รายการ)</p>
                  
                  <button
                    onClick={() => handleBulkUpdate('in_progress')}
                    disabled={isBulkUpdating}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:-translate-y-0.5 cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    มติ: อนุมัติให้ดำเนินการ
                  </button>

                  <button
                    onClick={() => handleBulkUpdate('rejected')}
                    disabled={isBulkUpdating}
                    className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:-translate-y-0.5 cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    มติ: ไม่อนุมัติ
                  </button>

                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </>
  );
}

export default function StaffMeetingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-3 border-gray-200 border-t-[#d4a574] rounded-full animate-spin" />
      </div>
    }>
      <StaffMeetingsContent />
    </Suspense>
  );
}
