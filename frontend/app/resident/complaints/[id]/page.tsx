"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Complaint {
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
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user_name: string;
  user_role: string;
}

const statusConfig: Record<string, { label: string; bgClass: string; textClass: string }> = {
  pending: { label: "รอดำเนินการ", bgClass: "bg-amber-100", textClass: "text-amber-700" },
  in_progress: { label: "กำลังดำเนินการ", bgClass: "bg-red-100", textClass: "text-red-600" },
  resolved: { label: "แก้ไขแล้ว", bgClass: "bg-blue-100", textClass: "text-blue-700" },
  approved: { label: "อนุมัติ", bgClass: "bg-green-100", textClass: "text-green-700" },
  rejected: { label: "ปฏิเสธ", bgClass: "bg-red-100", textClass: "text-red-600" },
  closed: { label: "ปิดเรื่อง", bgClass: "bg-gray-100", textClass: "text-gray-500" },
};

const channelLabels: Record<string, string> = {
  website: "เว็บไซต์",
  walk_in: "เดินเข้ามาแจ้ง",
  phone: "โทรศัพท์",
  line: "LINE",
  email: "อีเมล",
};

// Timeline ตามสถานะ
const statusTimeline = ["pending", "in_progress", "resolved", "closed"];
const statusTimelineLabels: Record<string, string> = {
  pending: "รับเรื่อง / รอดำเนินการ",
  in_progress: "กำลังดำเนินการ",
  resolved: "แก้ไขเสร็จสิ้น",
  closed: "ปิดเรื่อง",
};

function getTimelineState(stepStatus: string, currentStatus: string): "completed" | "active" | "rejected" | "upcoming" {
  if (currentStatus === "rejected") {
    return stepStatus === "pending" ? "rejected" : "upcoming";
  }
  const currentIdx = statusTimeline.indexOf(currentStatus);
  const stepIdx = statusTimeline.indexOf(stepStatus);
  if (stepIdx < currentIdx) return "completed";
  if (stepIdx === currentIdx) return "active";
  return "upcoming";
}

export default function ComplaintDetailPage() {
  const params = useParams();
  const complaintId = params.id as string;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // ดึงข้อมูลร้องเรียน
      const { data: complaintData } = await supabase
        .from("complaints")
        .select("*")
        .eq("complaint_id", complaintId)
        .single();

      if (complaintData) setComplaint(complaintData);

      // ดึง comments (ถ้ามี table)
      // หมายเหตุ: ถ้ายังไม่มี comments table จะ skip
      try {
        const { data: commentData } = await supabase
          .from("comments")
          .select("*")
          .eq("complaint_id", complaintId)
          .order("created_at", { ascending: true });

        if (commentData) setComments(commentData);
      } catch {
        // comments table อาจยังไม่มี
      }

      setLoading(false);
    };

    fetchData();
  }, [complaintId]);

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    setSending(true);

    try {
      const supabase = createClient();
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        setSending(false);
        return;
      }
      const user = JSON.parse(userStr);

      const { data: userData } = await supabase
        .from("users")
        .select("first_name, last_name, role")
        .eq("id", user.id)
        .single();

      const { data: insertedComment, error } = await supabase
        .from("comments")
        .insert({
          complaint_id: parseInt(complaintId),
          user_id: user.id,
          content: newComment,
          user_name: userData ? `${userData.first_name} ${userData.last_name}` : "ผู้ใช้",
          user_role: userData?.role || "resident",
        })
        .select()
        .single();

      if (!error && insertedComment) {
        setComments([...comments, insertedComment]);
        setNewComment("");
      }
    } catch {
      // comment insert อาจ fail ถ้ายังไม่มี table
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-3 border-gray-200 border-t-[#d4a574] rounded-full animate-spin" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16 px-6">
        <h3 className="text-base font-semibold text-gray-700 mb-2">ไม่พบเรื่องร้องเรียน</h3>
        <p className="text-sm text-gray-400 mb-6">เรื่องร้องเรียนนี้อาจถูกลบหรือไม่มีอยู่ในระบบ</p>
        <Link
          href="/resident/complaints"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#d4a574] hover:bg-[#b8865a] text-white rounded-xl text-sm font-medium no-underline transition-colors"
        >
          กลับไปรายการร้องเรียน
        </Link>
      </div>
    );
  }

  const currentConfig = statusConfig[complaint.status] || statusConfig.pending;

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Back Link */}
      <Link
        href="/resident/complaints"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#d4a574] no-underline transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        กลับไปรายการร้องเรียน
      </Link>

      {/* Main Detail Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-5 border-b border-gray-100">
          <div>
            <p className="text-xs font-semibold text-[#d4a574] m-0 mb-1">
              {complaint.ticket_no || `#${complaint.complaint_id}`}
            </p>
            <h2 className="text-lg font-bold text-gray-800 m-0">{complaint.subject}</h2>
          </div>
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium shrink-0 ${currentConfig.bgClass} ${currentConfig.textClass}`}>
            {currentConfig.label}
          </span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6 py-5 bg-gray-50/50 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-400 m-0 mb-1">วันที่แจ้ง</p>
            <p className="text-sm font-medium text-gray-700 m-0">
              {new Date(complaint.reported_date).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 m-0 mb-1">สถานที่</p>
            <p className="text-sm font-medium text-gray-700 m-0">
              {complaint.location_written || "-"}
              {complaint.soi ? ` (${complaint.soi})` : ""}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 m-0 mb-1">ช่องทางแจ้ง</p>
            <p className="text-sm font-medium text-gray-700 m-0">
              {complaint.intake_channel ? channelLabels[complaint.intake_channel] || complaint.intake_channel : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 m-0 mb-1">คำร้อง/หมายเหตุ</p>
            <p className="text-sm font-medium text-gray-700 m-0">{complaint.petition || "-"}</p>
          </div>
        </div>

        {/* Description */}
        <div className="px-6 py-5">
          <p className="text-xs text-gray-400 m-0 mb-2">รายละเอียด</p>
          <p className="text-sm text-gray-700 leading-relaxed m-0 whitespace-pre-wrap">{complaint.description}</p>
        </div>

        {/* Attachment */}
        {complaint.attachment_url && (
          <div className="px-6 pb-5">
            <p className="text-xs text-gray-400 m-0 mb-2">ไฟล์แนบ</p>
            <a
              href={complaint.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-sm text-[#d4a574] hover:bg-amber-100 no-underline transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
              ดูไฟล์แนบ
            </a>
          </div>
        )}
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 m-0 mb-5">
          <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          สถานะการดำเนินงาน
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-start gap-0 sm:gap-0">
          {complaint.status === "rejected" ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-red-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700 m-0">รับเรื่อง</p>
                  <p className="text-xs text-gray-400 m-0">
                    {new Date(complaint.reported_date).toLocaleDateString("th-TH", { month: "short", day: "numeric", year: "2-digit" })}
                  </p>
                </div>
              </div>
              <div className="hidden sm:block flex-1 h-px bg-red-200 mx-2" />
              <div className="sm:hidden w-px h-6 bg-red-200 ml-[7px]" />
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-red-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-600 m-0">ปฏิเสธเรื่อง</p>
                  <p className="text-xs text-gray-400 m-0">เรื่องถูกปฏิเสธ</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-start w-full">
              {statusTimeline.map((step, idx) => {
                const state = getTimelineState(step, complaint.status);
                const dotClasses = {
                  completed: "bg-green-500",
                  active: "bg-[#d4a574] ring-4 ring-amber-100",
                  rejected: "bg-red-500",
                  upcoming: "bg-gray-200",
                };
                const lineClasses = {
                  completed: "bg-green-300",
                  active: "bg-amber-200",
                  rejected: "bg-red-200",
                  upcoming: "bg-gray-200",
                };

                return (
                  <div key={step} className="flex sm:flex-col sm:items-center sm:flex-1 gap-3 sm:gap-2">
                    <div className="flex flex-col sm:flex-row items-center sm:w-full">
                      <div className={`w-4 h-4 rounded-full shrink-0 ${dotClasses[state]}`} />
                      {idx < statusTimeline.length - 1 && (
                        <>
                          <div className={`hidden sm:block flex-1 h-0.5 ${lineClasses[state]}`} />
                          <div className={`sm:hidden w-px h-8 ml-0 ${lineClasses[state]}`} />
                        </>
                      )}
                    </div>
                    <div className="sm:text-center sm:mt-1">
                      <p className={`text-xs font-medium m-0 ${state === "upcoming" ? "text-gray-400" : "text-gray-700"}`}>
                        {statusTimelineLabels[step]}
                      </p>
                      {step === "pending" && (
                        <p className="text-[11px] text-gray-400 m-0">
                          {new Date(complaint.reported_date).toLocaleDateString("th-TH", { month: "short", day: "numeric" })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Comments */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 m-0 mb-4">
          <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          ความคิดเห็น
        </h3>

        {comments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6 m-0">ยังไม่มีความคิดเห็น</p>
        ) : (
          <div className="space-y-4 mb-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0 ${
                  comment.user_role !== "resident" ? "bg-blue-500" : "bg-[#d4a574]"
                }`}>
                  {comment.user_name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-700">{comment.user_name}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                      {comment.user_role === "staff" ? "เจ้าหน้าที่" : comment.user_role === "admin" ? "แอดมิน" : "ลูกบ้าน"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 m-0 mb-1">{comment.content}</p>
                  <p className="text-xs text-gray-400 m-0">
                    {new Date(comment.created_at).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comment Input */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <input
            type="text"
            placeholder="เขียนความคิดเห็น..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-[#d4a574] focus:ring-2 focus:ring-amber-100"
            onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
            disabled={sending}
          />
          <button
            onClick={handleSendComment}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#d4a574] hover:bg-[#b8865a] text-white rounded-xl text-sm font-medium border-none cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={sending || !newComment.trim()}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            {sending ? "..." : "ส่ง"}
          </button>
        </div>
      </div>
    </div>
  );
}
