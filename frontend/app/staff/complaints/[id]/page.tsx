"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import "./complaint-detail.css";

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

const statusLabels: Record<string, string> = {
  pending: "รอดำเนินการ",
  in_progress: "กำลังดำเนินการ",
  resolved: "แก้ไขแล้ว",
  rejected: "ปฏิเสธ",
  closed: "ปิดเรื่อง",
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

function getTimelineDotClass(stepStatus: string, currentStatus: string): string {
  if (currentStatus === "rejected") {
    return stepStatus === "pending" ? "rejected" : "";
  }
  const currentIdx = statusTimeline.indexOf(currentStatus);
  const stepIdx = statusTimeline.indexOf(stepStatus);
  if (stepIdx < currentIdx) return "completed";
  if (stepIdx === currentIdx) return "active";
  return "";
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function StaffComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const complaintId = params.id as string;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  // Status Update State
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setLoading(false);
          return;
        }

        // ดึงข้อมูลร้องเรียนผ่าน API
        const res = await fetch(`${API_URL}/complaints/staff/${complaintId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();
        if (json.success && json.data) {
          setComplaint(json.data);
          setSelectedStatus(json.data.status);
        }

        // ดึง comments โดยใช้ supabase client เหมือนเดิมเพราะไม่ได้มี API
        const supabase = createClient();
        const { data: commentData } = await supabase
          .from("comments")
          .select("*")
          .eq("complaint_id", complaintId)
          .order("created_at", { ascending: true });

        if (commentData) setComments(commentData);
      } catch (error) {
        console.error("Fetch complaint detail error:", error);
      }

      setLoading(false);
    };

    fetchData();
  }, [complaintId]);

  const handleUpdateStatus = async () => {
    if (!complaint || selectedStatus === complaint.status) return;
    setUpdatingStatus(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("กรุณาเข้าสู่ระบบใหม่");
        setUpdatingStatus(false);
        return;
      }

      const res = await fetch(`${API_URL}/complaints/staff/${complaint.complaint_id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: selectedStatus })
      });

      const json = await res.json();

      if (json.success) {
        setComplaint({ ...complaint, status: selectedStatus });
        alert("อัปเดตสถานะสำเร็จ");
        router.refresh();
      } else {
        alert("เกิดข้อผิดพลาดในการอัปเดตสถานะ: " + json.message);
      }
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setUpdatingStatus(false);
    }
  };

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
          user_role: userData?.role || "staff",
        })
        .select()
        .single();

      if (!error && insertedComment) {
        setComments([...comments, insertedComment]);
        setNewComment("");
      }
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="detail-page">
        <div className="empty-state">
          <h3 className="empty-title">ไม่พบเรื่องร้องเรียน</h3>
          <p className="empty-text">เรื่องร้องเรียนนี้อาจถูกลบหรือไม่มีอยู่ในระบบ</p>
          <Link href="/staff/complaints" className="empty-button">
            กลับไปรายการร้องเรียน
          </Link>
        </div>
      </div>
    );
  }

  // ตัวเลือกสถานะที่พนักงานสามารถเปลี่ยนได้ (ไม่รวม closed ซึ่งมักให้แอดมินหรือระบบออโต้ หรือปิดได้ถ้าเป็น policy)
  // อิงจาก README: staff เปลี่ยน pending -> in_progress, in_progress -> resolved, pending -> rejected, etc.
  const availableStatuses = [
    { value: "pending", label: "รอดำเนินการ" },
    { value: "in_progress", label: "กำลังดำเนินการ" },
    { value: "resolved", label: "แก้ไขแล้ว" },
    { value: "rejected", label: "ปฏิเสธ" }
  ];

  return (
    <div className="detail-page">
      {/* Back Link */}
      <Link href="/staff/complaints" className="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        กลับไปรายการร้องเรียน
      </Link>

      <div className="detail-layout-grid">
        {/* Main Column */}
        <div className="main-column">
          {/* Main Detail Card */}
          <div className="detail-card" style={{ marginBottom: "24px" }}>
            <div className="detail-card-header">
              <div className="detail-card-header-left">
                <div className="detail-ticket-no">{complaint.ticket_no || `#${complaint.complaint_id}`}</div>
                <h2>{complaint.subject}</h2>
              </div>
              {/* Status badge in header is synced with current state */}
              <span className={`status-badge ${complaint.status}`}>
                <span className="status-dot" />
                {statusLabels[complaint.status] || complaint.status}
              </span>
            </div>

            {/* Info Grid */}
            <div className="detail-info-grid">
              <div className="detail-info-item">
                <span className="detail-info-label">วันที่แจ้ง</span>
                <span className="detail-info-value">
                  {new Date(complaint.reported_date).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="detail-info-item">
                <span className="detail-info-label">สถานที่</span>
                <span className="detail-info-value">
                  {complaint.location_written || "-"}
                  {complaint.soi ? ` (${complaint.soi})` : ""}
                </span>
              </div>
              <div className="detail-info-item">
                <span className="detail-info-label">ช่องทางแจ้ง</span>
                <span className="detail-info-value">
                  {complaint.intake_channel ? channelLabels[complaint.intake_channel] || complaint.intake_channel : "-"}
                </span>
              </div>
              <div className="detail-info-item">
                <span className="detail-info-label">คำร้อง/หมายเหตุ</span>
                <span className="detail-info-value">{complaint.petition || "-"}</span>
              </div>
            </div>

            {/* Description */}
            <div className="detail-description">
              <div className="detail-description-label">รายละเอียด</div>
              <div className="detail-description-text">{complaint.description}</div>
            </div>

            {/* Attachment */}
            {complaint.attachment_url && (
              <div className="detail-attachment">
                <div className="detail-description-label">ไฟล์แนบ</div>
                <a
                  href={complaint.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="detail-attachment-link"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                  ดูไฟล์แนบ
                </a>
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="comments-card">
            <h3 className="comments-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              ความคิดเห็นและการติดต่อ
            </h3>

            {comments.length === 0 ? (
              <div className="no-comments">ยังไม่มีความคิดเห็น</div>
            ) : (
              <div className="comment-list">
                {comments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className={`comment-avatar ${comment.user_role}`}>
                      {comment.user_name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="comment-body">
                      <div className="comment-author">
                        {comment.user_name}
                        <span className="comment-role">
                          {comment.user_role === "staff" ? "เจ้าหน้าที่" : comment.user_role === "admin" ? "แอดมิน" : "ลูกบ้าน"}
                        </span>
                      </div>
                      <div className="comment-text">{comment.content}</div>
                      <div className="comment-time">
                        {new Date(comment.created_at).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="comment-input-wrapper">
              <input
                type="text"
                placeholder="ตอบกลับลูกบ้าน หรือบันทึกโน้ตภายใน..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="comment-input"
                onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
                disabled={sending}
              />
              <button
                onClick={handleSendComment}
                className="comment-send-button"
                disabled={sending || !newComment.trim()}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                {sending ? "กำลังส่ง..." : "ส่ง"}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="side-column">
          {/* Action Card for Staff */}
          <div className="action-card">
            <h3 className="action-card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              อัปเดตสถานะ
            </h3>
            <div className="status-select-wrapper">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="status-select"
                disabled={complaint.status === "closed"} // ถ้าปิดเรื่องแล้วอาจจะห้ามเปลี่ยน
              >
                {availableStatuses.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
                {complaint.status === "closed" && (
                  <option value="closed">ปิดเรื่อง (Closed)</option>
                )}
              </select>
              <button
                className="update-status-button"
                onClick={handleUpdateStatus}
                disabled={updatingStatus || selectedStatus === complaint.status || complaint.status === "closed"}
              >
                {updatingStatus ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
              </button>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="timeline-card">
            <h3 className="timeline-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              สถานะการดำเนินงาน
            </h3>
            <div className="timeline">
              {complaint.status === "rejected" ? (
                <>
                  <div className="timeline-item">
                    <div className="timeline-dot rejected" />
                    <div className="timeline-status">รับเรื่อง</div>
                    <div className="timeline-date">
                      {new Date(complaint.reported_date).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot rejected" />
                    <div className="timeline-status">ปฏิเสธเรื่อง</div>
                    <div className="timeline-date">เรื่องถูกปฏิเสธแล้ว</div>
                  </div>
                </>
              ) : (
                statusTimeline.map((step) => (
                  <div key={step} className="timeline-item">
                    <div className={`timeline-dot ${getTimelineDotClass(step, complaint.status)}`} />
                    <div className="timeline-status">{statusTimelineLabels[step]}</div>
                    {step === "pending" && (
                      <div className="timeline-date">
                        {new Date(complaint.reported_date).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
