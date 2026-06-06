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
  petition: string | null;
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

function StaffMaintenanceContent() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Bulk update states
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  
  // Repair Notes Modal State
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [repairNote, setRepairNote] = useState("");
  const [repairCost, setRepairCost] = useState("");

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
        // ONLY fetch in_progress
        const maintenanceComplaints = json.data.filter((c: Complaint) => c.status === 'in_progress');
        setComplaints(maintenanceComplaints);
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
        // ONLY fetch in_progress
        const maintenanceComplaints = res.data.data.filter((c: Complaint) => c.status === 'in_progress');
        setComplaints(maintenanceComplaints);
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

  const submitResolve = async () => {
    if (selectedIds.length === 0) return;
    
    setIsBulkUpdating(true);
    try {
      let combinedNote = repairNote.trim();
      if (repairCost.trim()) {
        combinedNote += combinedNote ? `\nค่าใช้จ่าย: ${repairCost}` : `ค่าใช้จ่าย: ${repairCost}`;
      }

      const res = await api.patch('/complaints/staff/bulk-status', {
        complaintIds: selectedIds,
        status: 'resolved',
        petition: combinedNote || undefined
      });
      
      if (res.data.success) {
        alert(res.data.message || 'อัปเดตสถานะสำเร็จ');
        setSelectedIds([]);
        setShowNoteModal(false);
        setRepairNote("");
        setRepairCost("");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-3 border-gray-200 border-t-[#d4a574] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Page Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 m-0">ติดตามการแก้ไขปัญหา</h1>
          <p className="text-sm text-gray-400 mt-1 m-0">รายการที่อยู่ในสถานะกำลังดำเนินการ และรอการแก้ไข</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
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
      </div>

      {/* Content Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16 px-6">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-200">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-700 mb-2">ไม่มีรายการ</h3>
          <p className="text-sm text-gray-400 mb-6">ขณะนี้ไม่มีเรื่องร้องเรียนที่อยู่ในสถานะรอดำเนินการแก้ไข</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wider bg-gray-50/50">
                  <th className="px-6 py-3.5 font-medium">เลขที่</th>
                  <th className="px-6 py-3.5 font-medium">หัวข้อ</th>
                  <th className="px-6 py-3.5 font-medium">สถานที่</th>
                  <th className="px-6 py-3.5 font-medium">ผู้ร้องเรียน</th>
                  <th className="px-6 py-3.5 font-medium">สถานะ</th>
                  <th className="px-6 py-3.5 font-medium">วันที่แจ้ง</th>
                  <th className="px-6 py-3.5 font-medium text-right">เอกสาร</th>
                  <th className="px-6 py-3.5 font-medium w-12 text-center">
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
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {c.house_no || "-"}
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
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Link
                          href={`/staff/maintenance/print?id=${c.complaint_id}`}
                          target="_blank"
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-gray-50 hover:bg-[#d4a574]/10 text-gray-500 hover:text-[#d4a574] transition-colors"
                          title="พิมพ์เอกสารมอบหมายงาน"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 6 2 18 2 18 9" />
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                            <rect x="6" y="14" width="12" height="8" />
                          </svg>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
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
          <div className="sm:hidden divide-y divide-gray-100">
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
                  <div className="flex flex-col items-end justify-between gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-gray-300 text-[#d4a574] focus:ring-[#d4a574] cursor-pointer mb-2"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(c.complaint_id)}
                    />
                    <Link
                      href={`/staff/maintenance/print?id=${c.complaint_id}`}
                      target="_blank"
                      className="inline-flex items-center justify-center p-2 rounded-lg bg-gray-50 hover:bg-[#d4a574]/10 text-gray-500 hover:text-[#d4a574] transition-colors"
                      title="พิมพ์เอกสารมอบหมายงาน"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 6 2 18 2 18 9" />
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                        <rect x="6" y="14" width="12" height="8" />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Right Sidebar Slide-over (Bulk Action) */}
      {selectedIds.length > 0 && !showNoteModal && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setSelectedIds([])}
          />
          
          <div className="relative w-full max-w-sm sm:max-w-md h-full bg-white/95 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.1)] flex flex-col animate-in slide-in-from-right duration-300 border-l border-white/50">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800 m-0">อัปเดตสถานะงาน</h3>
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

            <div className="p-6 border-t border-gray-100 bg-white shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
              <button
                onClick={() => setShowNoteModal(true)}
                className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                บันทึกการแก้ไข
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Repair Notes Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 m-0">บันทึกหลังปฏิบัติงาน</h3>
              <button onClick={() => setShowNoteModal(false)} className="text-gray-400 hover:text-gray-600 bg-transparent border-none">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">รายละเอียดการแก้ไข <span className="text-gray-400 font-normal">(ไม่บังคับ)</span></label>
                <textarea
                  value={repairNote}
                  onChange={(e) => setRepairNote(e.target.value)}
                  placeholder="เช่น ทำความสะอาดพื้นที่, ตรวจสอบแล้วปกติ..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-[#d4a574] focus:ring-2 focus:ring-amber-100 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">ค่าใช้จ่าย <span className="text-gray-400 font-normal">(ไม่บังคับ)</span></label>
                <input
                  type="text"
                  value={repairCost}
                  onChange={(e) => setRepairCost(e.target.value)}
                  placeholder="เช่น 150 บาท"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-[#d4a574] focus:ring-2 focus:ring-amber-100"
                />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowNoteModal(false)}
                className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 bg-white transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={submitResolve}
                disabled={isBulkUpdating}
                className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 shadow-lg shadow-green-500/30 transition-all disabled:opacity-50"
              >
                {isBulkUpdating ? "กำลังบันทึก..." : "ยืนยันปิดงาน"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StaffMaintenancePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-3 border-gray-200 border-t-[#d4a574] rounded-full animate-spin" />
      </div>
    }>
      <StaffMaintenanceContent />
    </Suspense>
  );
}
