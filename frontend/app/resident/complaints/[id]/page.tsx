"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import StatusTimeline from "@/components/complaints/StatusTimeline";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/* ===== Types ===== */
interface ComplaintDetail {
  complaint_id: number;
  ticket_no: string;
  subject: string;
  status: string;
  phase: string | null;
  description: string;
  reported_date: string;
  location_written: string | null;
  attachment_url: string | null;
  soi: string | null;
  intake_channel: string | null;
  petition: string | null;
  first_name?: string;
  last_name?: string;
  house_no?: string;
  phone_number?: string;
  resident_type?: string;
  reviewer_name?: string | null;
}

/* ===== Config Maps ===== */
const statusConfig: Record<string, { label: string; bgClass: string; textClass: string }> = {
  pending:      { label: "รอดำเนินการ",     bgClass: "bg-red-600",    textClass: "text-white" },
  in_progress:  { label: "กำลังดำเนินการ",  bgClass: "bg-blue-600",   textClass: "text-white" },
  resolved:     { label: "อนุมัติ/แก้ไขแล้ว", bgClass: "bg-green-600",  textClass: "text-white" },
  rejected:     { label: "ไม่อนุมัติ",       bgClass: "bg-gray-600",   textClass: "text-white" },
  closed:       { label: "ปิดเรื่อง",        bgClass: "bg-gray-400",   textClass: "text-white" },
};

const channelLabels: Record<string, string> = {
  website:  "เว็บไซต์",
  walk_in:  "เดินเข้ามาแจ้ง",
  phone:    "โทรศัพท์",
  line:     "LINE",
  email:    "อีเมล",
  group_village: "กลุ่มไลน์หมู่บ้าน"
};

/* ===== SVG Icons ===== */
const BackArrowIcon = () => (
  <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-6 h-6 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const CheckCircleIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-6 h-6 ${active ? 'text-green-500' : 'text-gray-300'}`} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" fill={active ? "#86efac" : "none"} stroke={active ? "none" : "currentColor"} />
    <path d="M9 12l2 2 4-4" stroke={active ? "white" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const XCircleIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-6 h-6 ${active ? 'text-red-500' : 'text-gray-300'}`} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" fill={active ? "#fca5a5" : "none"} stroke={active ? "none" : "currentColor"} />
    <path d="M15 9l-6 6M9 9l6 6" stroke={active ? "white" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChatBubbleIcon = () => (
  <svg className="w-6 h-6 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <circle cx="9" cy="10" r="1" fill="currentColor" />
    <circle cx="15" cy="10" r="1" fill="currentColor" />
  </svg>
);

export default function ComplaintDetailPage() {
  const params = useParams();
  const complaintId = params.id as string;

  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let didSet = false;

    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          const res = await fetch(`${API_URL}/complaints/${complaintId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              setComplaint(json.data);
              didSet = true;
            }
          }
        }
      } catch {
        // Fallback handled below
      }

      if (!didSet) {
        try {
          const { createClient } = await import("@/lib/supabase/client");
          const supabase = createClient();

          const { data } = await supabase
            .from("complaints")
            .select("*")
            .eq("complaint_id", complaintId)
            .single();

          if (data) {
            setComplaint(data);
          }
        } catch {
          // fallback failed
        }
      }

      setLoading(false);
    };

    fetchDetail();
  }, [complaintId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#d4a574] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm text-center py-16 px-6 max-w-2xl mx-auto mt-10">
        <h3 className="text-lg font-bold text-gray-800 mb-2">ไม่พบเรื่องร้องเรียน</h3>
        <p className="text-sm text-gray-500 mb-6">เรื่องร้องเรียนนี้อาจถูกลบหรือไม่มีอยู่ในระบบ</p>
        <Link
          href="/resident/complaints"
          className="inline-flex items-center px-6 py-2 bg-[#d4a574] text-white rounded-lg text-sm font-medium no-underline"
        >
          กลับไปรายการร้องเรียน
        </Link>
      </div>
    );
  }

  const cfg = statusConfig[complaint.status] || { label: "ไม่ทราบสถานะ", bgClass: "bg-gray-500", textClass: "text-white" };
  
  // Format Date to match Figma: "21 เม.ย. 26" (assuming Buddhist era logic, though standard Date gives AD)
  const d = new Date(complaint.reported_date);
  const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const fmtDate = `${d.getDate()} ${thaiMonths[d.getMonth()]} ${((d.getFullYear() + 543) % 100).toString()}`;

  const isImage = complaint.attachment_url && /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(complaint.attachment_url);

  return (
    <div className="max-w-4xl mx-auto mb-10 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      
      {/* ═══════════ 1. Header ═══════════ */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Link href="/resident/complaints" className="p-1.5 -ml-1.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer" title="กลับไปหน้ารายการ">
            <BackArrowIcon />
          </Link>
          <DocumentIcon />
          <span className="text-sm font-bold text-gray-800">รายละเอียดเรื่องร้องเรียน</span>
        </div>
        {complaint.status === 'pending' && (
          <Link
            href={`/resident/complaints/${complaintId}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors no-underline"
          >
            <EditIcon />
            แก้ไขข้อมูล
          </Link>
        )}
      </div>

      {/* ═══════════ Content Container ═══════════ */}
      <div className="p-6 md:p-8">
        
        {/* Title & Status */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900 mb-3">{complaint.subject}</h1>
          <span className={`inline-flex px-4 py-1 rounded-full text-[11px] font-medium tracking-wide ${cfg.bgClass} ${cfg.textClass}`}>
            {cfg.label}
          </span>
        </div>

        {/* Info Grid (Gray Card) */}
        <div className="bg-[#f8f9fa] rounded-2xl p-6 md:p-8 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-y-8 gap-x-4">
            {/* Row 1 */}
            <div className="col-span-1 md:col-span-1">
              <p className="text-xs font-bold text-gray-700 mb-2">ชื่อจริง</p>
              <p className="text-sm text-gray-500">{complaint.first_name || "-"}</p>
            </div>
            <div className="col-span-1 md:col-span-1">
              <p className="text-xs font-bold text-gray-700 mb-2">นามสกุล</p>
              <p className="text-sm text-gray-500">{complaint.last_name || "-"}</p>
            </div>
            <div className="col-span-1 md:col-span-1">
              <p className="text-xs font-bold text-gray-700 mb-2">บ้านเลขที่</p>
              <p className="text-sm text-gray-500">{complaint.house_no || "-"}</p>
            </div>
            <div className="col-span-1 md:col-span-1">
              <p className="text-xs font-bold text-gray-700 mb-2">เฟส</p>
              <p className="text-sm text-gray-500">{complaint.phase || "1"}</p>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p className="text-xs font-bold text-gray-700 mb-2">ซอย</p>
              <p className="text-sm text-gray-500">{complaint.soi || "-"}</p>
            </div>

            {/* Row 2 */}
            <div className="col-span-2 md:col-span-2">
              <p className="text-xs font-bold text-gray-700 mb-2">ช่องทางการร้องเรียน</p>
              <p className="text-sm text-gray-500">
                {complaint.intake_channel ? (channelLabels[complaint.intake_channel] || complaint.intake_channel) : "-"}
              </p>
            </div>
            <div className="col-span-1 md:col-span-1">
              <p className="text-xs font-bold text-gray-700 mb-2">วันที่แจ้ง</p>
              <p className="text-sm text-gray-500">{fmtDate}</p>
            </div>
            <div className="col-span-1 md:col-span-2">
              <p className="text-xs font-bold text-gray-700 mb-2">เบอร์โทรศัพท์</p>
              <p className="text-sm text-gray-500">{complaint.phone_number || "-"}</p>
            </div>
          </div>
        </div>

        {/* Problem Description */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-900 mb-3">รายละเอียดปัญหา</h3>
          <p className="text-xs leading-relaxed text-gray-600 whitespace-pre-wrap">
            {complaint.description || "-"}
          </p>
        </div>

        {/* Attachment */}
        <div className="mb-10">
          <h3 className="text-sm font-bold text-gray-900 mb-1">ไฟล์แนบ</h3>
          <p className="text-xs text-gray-500 mb-4">ภาพประกอบปัญหา</p>
          
          {complaint.attachment_url && !imageError ? (
            isImage ? (
              <div className="w-full max-w-[400px] aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <img 
                  src={complaint.attachment_url} 
                  alt="ภาพประกอบปัญหา" 
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <a 
                href={complaint.attachment_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block text-xs text-blue-600 hover:underline"
              >
                ดูไฟล์แนบ
              </a>
            )
          ) : (
            <div className="w-full max-w-[400px] aspect-video bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
              <p className="text-xs text-gray-400">ไม่มีรูปภาพประกอบ</p>
            </div>
          )}
        </div>

        {/* Review Section (Gray Card) */}
        <div className="bg-[#f8f9fa] rounded-2xl p-6 md:p-8">
          <h3 className="text-sm font-bold text-gray-900 mb-2">ส่วนพิจารณาคำร้อง</h3>
          <p className="text-xs text-gray-500 mb-6">การพิจารณาผลดำเนินการ หรือ การอนุมัติตามระเบียบนิติบุคคล</p>

          {/* Approve / Reject Badges */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className={`flex items-center gap-3 px-6 py-2.5 bg-white border ${complaint.status === 'approved' || complaint.status === 'resolved' ? 'border-green-400 shadow-sm' : 'border-gray-200'} rounded-xl`}>
              <CheckCircleIcon active={complaint.status === 'approved' || complaint.status === 'resolved'} />
              <span className="text-xs font-bold text-gray-700">อนุมัติ</span>
            </div>
            
            <div className={`flex items-center gap-3 px-6 py-2.5 bg-white border ${complaint.status === 'rejected' ? 'border-red-400 shadow-sm' : 'border-gray-200'} rounded-xl`}>
              <XCircleIcon active={complaint.status === 'rejected'} />
              <span className="text-xs font-bold text-gray-700">ไม่อนุมัติ</span>
            </div>
          </div>

          {/* Reviewer Name */}
          <div className="mb-6">
            <p className="text-xs text-gray-500 mb-2">ผู้รับคำร้อง(เจ้าหน้าที่นิติบุคคล)</p>
            <p className="text-xs font-bold text-gray-800">
              {complaint.reviewer_name || (complaint.status !== 'pending' ? "เจ้าหน้าที่รับเรื่อง" : "-")}
            </p>
          </div>

          {/* Committee Comment */}
          <div>
            <p className="text-xs text-gray-500 mb-3">ความเห็นคณะกรรมการ (เหตุผลประกอบการพิจารณา)</p>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 min-h-[140px] relative">
              {/* Chat Icon placeholder in the corner */}
              <div className="absolute top-4 left-4">
                <ChatBubbleIcon />
              </div>
              <div className="pl-10 text-xs leading-relaxed text-gray-600 whitespace-pre-wrap pt-1">
                {complaint.petition || ""}
              </div>
            </div>
          </div>

        </div>

        {/* Resident Progress Timeline */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 mt-8">
          <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#d4a574]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            ความคืบหน้า
          </h3>
          <div className="pl-2">
            <StatusTimeline 
              currentStatus={complaint.status}
              isInteractive={false}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
