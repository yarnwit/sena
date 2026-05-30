"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import StatusTimeline from "@/components/complaints/StatusTimeline";
import api from "@/lib/api";

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

interface TimelineEvent {
  id: string | number;
  type: 'comment' | 'system_log';
  content?: string;
  action?: string;
  details?: any;
  created_at: string;
  user_name: string;
  user_role: string;
  user_id: string;
}

/* ===== Config Maps ===== */
const statusConfig: Record<string, { label: string; bgClass: string; textClass: string }> = {
  pending:      { label: "รอดำเนินการ",     bgClass: "bg-amber-100",   textClass: "text-amber-700" },
  approved:     { label: "อนุมัติรับเรื่อง", bgClass: "bg-green-100", textClass: "text-green-700" },
  in_meeting:   { label: "เข้าที่ประชุม",    bgClass: "bg-purple-100",  textClass: "text-purple-700" },
  in_progress:  { label: "กำลังดำเนินการ",  bgClass: "bg-blue-100",    textClass: "text-blue-700" },
  resolved:     { label: "แก้ไขแล้ว",       bgClass: "bg-green-100",   textClass: "text-green-700" },
  rejected:     { label: "ไม่อนุมัติ",       bgClass: "bg-red-100",     textClass: "text-red-700" },
  closed:       { label: "ปิดเรื่อง",        bgClass: "bg-gray-100",    textClass: "text-gray-500" },
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

const availableStatuses = [
  { value: "pending", label: "รอดำเนินการ" },
  { value: "approved", label: "อนุมัติรับเรื่อง" },
  { value: "in_meeting", label: "เข้าที่ประชุม" },
  { value: "in_progress", label: "กำลังดำเนินการ" },
  { value: "resolved", label: "แก้ไขแล้ว" },
  { value: "rejected", label: "ไม่อนุมัติ" },
];

export default function StaffComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const complaintId = params.id as string;

  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [comments, setComments] = useState<TimelineEvent[]>([]);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Status Update State
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [petition, setPetition] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = "http-only-cookie";
        if (!token) { setLoading(false); return; }

        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const u = JSON.parse(userStr);
            setUserRole(u.role || "");
          } catch {}
        }

        const res = await api.get(`/complaints/staff/${complaintId}`);
        const json = res.data;
        if (json.success && json.data) {
          setComplaint(json.data);
          setSelectedStatus(json.data.status);
          setPetition(json.data.petition || "");
        }

        let fetchedComments: TimelineEvent[] = [];
        
        try {
          const timelineRes = await api.get(`/complaints/${complaintId}/comments`);
          if (timelineRes.data?.success) {
            fetchedComments = timelineRes.data.data;
          }
        } catch (err) {
          console.error("Failed to fetch timeline:", err);
        }
        
        setComments(fetchedComments);
      } catch {
        // error
      }
      setLoading(false);
    };
    fetchData();
  }, [complaintId]);

  const handleUpdateStatusAndComment = async () => {
    const statusChanged = selectedStatus !== complaint?.status || petition !== (complaint?.petition || "");
    const commentFilled = newComment.trim().length > 0;

    if (!statusChanged && !commentFilled) return;

    setUpdatingStatus(true);
    try {
      const token = "http-only-cookie";
      if (!token) { alert("กรุณาเข้าสู่ระบบใหม่"); setUpdatingStatus(false); return; }

      let hasError = false;

      // 1. Update Status
      if (statusChanged && complaint) {
        const res = await api.patch(`/complaints/staff/${complaint.complaint_id}/status`, {
          status: selectedStatus,
          petition,
        });
        if (res.data.success) {
          setComplaint({ ...complaint, status: selectedStatus, petition: petition });
        } else {
          hasError = true;
          alert("เกิดข้อผิดพลาดในการอัปเดตสถานะ: " + res.data.message);
        }
      }

      // 2. Insert Comment
      if (commentFilled && !hasError) {
        const supabase = createClient();
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          const { data: userData } = await supabase
            .from("users").select("first_name, last_name, role").eq("id", user.id).single();

          const { data: insertedComment, error } = await supabase
            .from("comments")
            .insert({
              complaint_id: parseInt(complaintId),
              user_id: user.id,
              content: newComment,
            })
            .select().single();

          if (!error && insertedComment) {
            setComments([...comments, {
              id: `comment_${insertedComment.comment_id}`,
              type: 'comment',
              content: insertedComment.content,
              created_at: insertedComment.created_at,
              user_id: user.id,
              user_name: userData ? `${userData.first_name} ${userData.last_name}` : "ผู้ใช้",
              user_role: userData?.role || "staff",
            }]);
            setNewComment("");
          }
        }
      }

      if (!hasError) {
        alert("อัปเดตข้อมูลสำเร็จ");
        router.refresh();
      }
    } catch (error: any) {
      alert("เกิดข้อผิดพลาดในการบันทึก: " + (error.response?.data?.message || error.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์"));
    } finally {
      setUpdatingStatus(false);
    }
  };

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
        <Link href="/staff/complaints" className="inline-flex items-center px-6 py-2 bg-[#d4a574] text-white rounded-lg text-sm font-medium no-underline">
          กลับไปรายการร้องเรียน
        </Link>
      </div>
    );
  }

  const cfg = statusConfig[complaint.status] || { label: "ไม่ทราบสถานะ", bgClass: "bg-gray-500", textClass: "text-white" };
  const d = new Date(complaint.reported_date);
  const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const fmtDate = `${d.getDate()} ${thaiMonths[d.getMonth()]} ${((d.getFullYear() + 543) % 100).toString()}`;
  const isImage = complaint.attachment_url && /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(complaint.attachment_url);

  const formatSystemLog = (event: TimelineEvent) => {
    if (event.action === 'CREATE_COMPLAINT' || event.action === 'CREATE_COMPLAINT_BY_STAFF' || event.content === '[ระบบ] สร้างเรื่องร้องเรียนเข้าระบบ') {
      return 'สร้างเรื่องร้องเรียนเข้าระบบ';
    }
    if (event.action === 'UPDATE_STATUS') {
      return `เปลี่ยนสถานะเป็น "${statusConfig[event.details?.to]?.label || event.details?.to}"`;
    }
    if (event.action === 'UPDATE_COMPLAINT' || event.action === 'UPDATE_COMPLAINT_BY_STAFF') {
      const fieldLabels: Record<string, string> = {
        subject: 'หัวข้อเรื่อง',
        description: 'รายละเอียด',
        location_written: 'สถานที่',
        intake_channel: 'ช่องทาง',
        attachment_url: 'ไฟล์แนบ',
        petition: 'ความเห็นคณะกรรมการ'
      };
      
      if (event.details?.to && event.details?.from) {
        // Compare to find actual changes
        const changedKeys = Object.keys(event.details.to).filter(k => {
          return JSON.stringify(event.details.to[k]) !== JSON.stringify(event.details.from[k]);
        });
        
        if (changedKeys.length > 0) {
          const keys = changedKeys.map(k => fieldLabels[k] || k);
          return `แก้ไขรายละเอียดคำร้อง (${keys.join(', ')})`;
        } else {
          return 'อัปเดตข้อมูลคำร้อง (ไม่มีการเปลี่ยนแปลงรายละเอียด)';
        }
      } else if (event.details?.to) {
        // Fallback if 'from' doesn't exist
        const keys = Object.keys(event.details.to).map(k => fieldLabels[k] || k);
        return `แก้ไขรายละเอียดคำร้อง (${keys.join(', ')})`;
      }
      return 'แก้ไขรายละเอียดคำร้อง';
    }
    
    if (event.content && event.content.startsWith('[ระบบ]')) {
      return event.content.replace('[ระบบ] ', '');
    }
    
    return event.action || 'อัปเดตข้อมูล';
  };

  return (
    <div className="max-w-4xl mx-auto mb-10 space-y-6">
      {/* Main Detail Card */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Link href="/staff/complaints" className="p-1.5 -ml-1.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer" title="กลับไปหน้ารายการ">
              <BackArrowIcon />
            </Link>
            <DocumentIcon />
            <span className="text-sm font-bold text-gray-800">รายละเอียดเรื่องร้องเรียน</span>
          </div>
          <Link
            href={complaint.status !== 'closed' ? `/staff/complaints/${complaint.complaint_id}/edit` : '#'}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold no-underline transition-all ${
              complaint.status === 'closed'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 hover:border-amber-300'
            }`}
            title={complaint.status === 'closed' ? 'ไม่สามารถแก้ไขเรื่องที่ปิดแล้ว' : 'แก้ไขข้อมูลเรื่องร้องเรียน'}
            aria-disabled={complaint.status === 'closed'}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            แก้ไข
          </Link>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Title & Status */}
          <div className="mb-8">
            <h1 className="text-xl font-bold text-gray-900 mb-3">{complaint.subject}</h1>
            <span className={`inline-flex px-4 py-1 rounded-full text-[11px] font-medium tracking-wide ${cfg.bgClass} ${cfg.textClass}`}>
              {cfg.label}
            </span>
          </div>

          {/* Info Grid */}
          <div className="bg-[#f8f9fa] rounded-2xl p-6 md:p-8 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-y-6 sm:gap-y-8 gap-x-4">
              <div className="col-span-1">
                <p className="text-xs font-bold text-gray-700 mb-2">ชื่อจริง</p>
                <p className="text-sm text-gray-500">{complaint.first_name || "-"}</p>
              </div>
              <div className="col-span-1">
                <p className="text-xs font-bold text-gray-700 mb-2">นามสกุล</p>
                <p className="text-sm text-gray-500">{complaint.last_name || "-"}</p>
              </div>
              <div className="col-span-1">
                <p className="text-xs font-bold text-gray-700 mb-2">บ้านเลขที่</p>
                <p className="text-sm text-gray-500">{complaint.house_no || "-"}</p>
              </div>
              <div className="col-span-1">
                <p className="text-xs font-bold text-gray-700 mb-2">เฟส</p>
                <p className="text-sm text-gray-500">{complaint.phase || "1"}</p>
              </div>
              <div className="col-span-1">
                <p className="text-xs font-bold text-gray-700 mb-2">ซอย</p>
                <p className="text-sm text-gray-500">{complaint.soi || "-"}</p>
              </div>

              <div className="col-span-1 sm:col-span-2">
                <p className="text-xs font-bold text-gray-700 mb-2">ช่องทางการร้องเรียน</p>
                <p className="text-sm text-gray-500">
                  {complaint.intake_channel ? (channelLabels[complaint.intake_channel] || complaint.intake_channel) : "-"}
                </p>
              </div>
              <div className="col-span-1">
                <p className="text-xs font-bold text-gray-700 mb-2">วันที่แจ้ง</p>
                <p className="text-sm text-gray-500">{fmtDate}</p>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <p className="text-xs font-bold text-gray-700 mb-2">เบอร์โทรศัพท์</p>
                <p className="text-sm text-gray-500">{complaint.phone_number || "-"}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 mb-3">รายละเอียดปัญหา</h3>
            <p className="text-xs leading-relaxed text-gray-600 whitespace-pre-wrap">{complaint.description || "-"}</p>
          </div>

          {/* Attachment */}
          <div className="mb-10">
            <h3 className="text-sm font-bold text-gray-900 mb-1">ไฟล์แนบ</h3>
            <p className="text-xs text-gray-500 mb-4">ภาพประกอบปัญหา</p>
            {complaint.attachment_url && !imageError ? (
              isImage ? (
                <div className="w-full max-w-[400px] aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <img src={complaint.attachment_url} alt="ภาพประกอบปัญหา" className="w-full h-full object-cover" onError={() => setImageError(true)} />
                </div>
              ) : (
                <a href={complaint.attachment_url} target="_blank" rel="noopener noreferrer" className="inline-block text-xs text-blue-600 hover:underline">ดูไฟล์แนบ</a>
              )
            ) : (
              <div className="w-full max-w-[400px] aspect-video bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
                <p className="text-xs text-gray-400">ไม่มีรูปภาพประกอบ</p>
              </div>
            )}
          </div>

          {/* Review Section */}
          <div className="bg-[#f8f9fa] rounded-2xl p-6 md:p-8 mb-8">
            <h3 className="text-sm font-bold text-gray-900 mb-2">ส่วนพิจารณาคำร้อง</h3>
            <p className="text-xs text-gray-500 mb-6">การพิจารณาผลดำเนินการ หรือ การอนุมัติตามระเบียบนิติบุคคล</p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
              <button
                type="button"
                onClick={() => {
                  if (complaint.status !== 'closed') {
                    setSelectedStatus('approved');
                  }
                }}
                className={`flex items-center justify-center gap-3 px-6 py-2.5 bg-white border ${['approved', 'in_meeting', 'in_progress', 'resolved'].includes(selectedStatus) ? 'border-green-400 shadow-sm ring-2 ring-green-100' : 'border-gray-200 hover:border-gray-300'} rounded-xl cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto`}
                disabled={complaint.status === 'closed'}
              >
                <CheckCircleIcon active={['approved', 'in_meeting', 'in_progress', 'resolved'].includes(selectedStatus)} />
                <span className="text-xs font-bold text-gray-700">อนุมัติ</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (complaint.status !== 'closed') {
                    setSelectedStatus('rejected');
                  }
                }}
                className={`flex items-center justify-center gap-3 px-6 py-2.5 bg-white border ${selectedStatus === 'rejected' ? 'border-red-400 shadow-sm ring-2 ring-red-100' : 'border-gray-200 hover:border-gray-300'} rounded-xl cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto`}
                disabled={complaint.status === 'closed'}
              >
                <XCircleIcon active={selectedStatus === 'rejected'} />
                <span className="text-xs font-bold text-gray-700">ไม่อนุมัติ</span>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-xs text-gray-500 mb-2">ผู้รับคำร้อง(เจ้าหน้าที่นิติบุคคล)</p>
              <p className="text-xs font-bold text-gray-800">
                {complaint.reviewer_name || (complaint.status !== 'pending' ? "เจ้าหน้าที่รับเรื่อง" : "-")}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-3">ความเห็นคณะกรรมการ (เหตุผลประกอบการพิจารณา)</p>
              <div className="bg-white border border-gray-200 rounded-2xl p-4 min-h-[140px] relative focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100 transition-all">
                <div className="absolute top-4 left-4"><ChatBubbleIcon /></div>
                <textarea
                  value={petition}
                  onChange={(e) => setPetition(e.target.value)}
                  placeholder="กรอกความเห็นคณะกรรมการ หรือเหตุผลประกอบการพิจารณา..."
                  className="w-full min-h-[100px] pl-10 pt-1 text-xs leading-relaxed text-gray-600 outline-none border-none resize-y bg-transparent"
                  disabled={complaint.status === "closed"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Action Card - Unified Status & Progress Update */}
      <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6 md:p-8 mt-8">
        <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          อัปเดตสถานะและความคืบหน้า
        </h3>
        <div className="pl-2 mb-8">
          <StatusTimeline 
            currentStatus={selectedStatus}
            isInteractive={true}
            onStatusChange={(newStatus) => setSelectedStatus(newStatus)}
            disabled={complaint.status === "closed" && userRole !== "admin"}
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-700 mb-2">บันทึกความคืบหน้า หรือ ตอบกลับลูกบ้าน (ถ้ามี)</label>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="พิมพ์อัปเดตความคืบหน้าให้ลูกบ้านทราบ..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-[#d4a574] focus:ring-2 focus:ring-amber-100 min-h-[100px] resize-y"
            disabled={complaint.status === "closed" && userRole !== "admin"}
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            onClick={handleUpdateStatusAndComment}
            disabled={updatingStatus || (selectedStatus === complaint.status && petition === (complaint.petition || "") && newComment.trim() === "") || (complaint.status === "closed" && userRole !== "admin")}
            className="px-8 py-3.5 rounded-xl bg-[#d4a574] hover:bg-[#b8865a] text-white text-sm font-bold border-none cursor-pointer transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto text-center"
          >
            {updatingStatus ? "กำลังบันทึก..." : "อัปเดตข้อมูล"}
          </button>
        </div>
      </div>

      {/* Comments History Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mt-8">
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          ประวัติการดำเนินการ
        </h3>

        {comments.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-400">ยังไม่มีประวัติความคืบหน้า</div>
        ) : (
          <div className="space-y-4 mb-6">
            {comments.map((event) => {
              if (event.type === 'system_log') {
                return (
                  <div key={event.id} className="flex flex-col items-center justify-center my-6 relative">
                    <div className="absolute w-full h-px bg-gray-100 top-1/2 -translate-y-1/2 -z-10"></div>
                    <div className="bg-white px-4 py-1.5 rounded-full border border-gray-100 shadow-sm flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span className="text-xs text-gray-500 font-medium">
                        {event.user_name} <span className="font-normal text-gray-400">({event.user_role === 'staff' ? 'เจ้าหน้าที่' : event.user_role === 'admin' ? 'แอดมิน' : 'ลูกบ้าน'})</span>
                        <span className="font-normal text-gray-500"> ได้ทำการ{formatSystemLog(event)}</span>
                      </span>
                      <span className="text-[10px] text-gray-400 ml-1">
                        {new Date(event.created_at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <div key={event.id} className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0 ${
                    event.user_role === 'resident' ? 'bg-gradient-to-br from-blue-500 to-blue-400' :
                    event.user_role === 'admin' ? 'bg-gradient-to-br from-red-500 to-red-400' :
                    'bg-gradient-to-br from-amber-500 to-amber-400'
                  }`}>
                    {event.user_name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                    <div className="text-xs font-semibold text-gray-800 mb-1">
                      {event.user_name}
                      <span className="font-normal text-gray-400 ml-2">
                        {event.user_role === "staff" ? "เจ้าหน้าที่" : event.user_role === "admin" ? "แอดมิน" : "ลูกบ้าน"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{event.content}</div>
                    <div className="text-[11px] text-gray-400 mt-1">
                      {new Date(event.created_at).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
