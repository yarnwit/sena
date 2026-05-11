"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import "./new-complaint.css";

// สร้าง ticket number อัตโนมัติ
function generateTicketNo() {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TK${y}${m}${d}-${rand}`;
}

const intakeChannelOptions = [
  { value: "", label: "-- เลือกช่องทาง --" },
  { value: "website", label: "เว็บไซต์" },
  { value: "walk_in", label: "เดินเข้ามาแจ้ง" },
  { value: "phone", label: "โทรศัพท์" },
  { value: "line", label: "LINE" },
  { value: "email", label: "อีเมล" },
];

export default function NewComplaintPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    subject: "",
    description: "",
    location_written: "",
    soi: "",
    intake_channel: "website",
    petition: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const userStr = localStorage.getItem("user");
      
      if (!userStr) {
        setError("กรุณาเข้าสู่ระบบก่อน");
        setLoading(false);
        return;
      }
      const user = JSON.parse(userStr);

      // ดึง resident_id
      const { data: residentData } = await supabase
        .from("resident")
        .select("resident_id")
        .eq("user_id", user.id)
        .single();

      if (!residentData) {
        setError("ไม่พบข้อมูลลูกบ้าน กรุณาติดต่อผู้ดูแลระบบ");
        setLoading(false);
        return;
      }

      let attachmentUrl = "";

      // อัปโหลดไฟล์ (ถ้ามี)
      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("attachments")
          .upload(fileName, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          // ไม่ block — ยังสร้าง complaint ได้แม้อัปโหลดไม่สำเร็จ
        } else if (uploadData) {
          const { data: urlData } = supabase.storage
            .from("attachments")
            .getPublicUrl(uploadData.path);
          attachmentUrl = urlData.publicUrl;
        }
      }

      const ticketNo = generateTicketNo();

      // สร้าง complaint ใน database
      const { data: complaintData, error: insertError } = await supabase
        .from("complaints")
        .insert({
          resident_id: residentData.resident_id,
          ticket_no: ticketNo,
          subject: form.subject,
          description: form.description,
          status: "pending",
          reported_date: new Date().toISOString(),
          location_written: form.location_written || null,
          soi: form.soi || null,
          intake_channel: form.intake_channel || null,
          petition: form.petition || null,
          attachment_url: attachmentUrl || null,
        })
        .select("complaint_id")
        .single();

      if (insertError) {
        setError(`เกิดข้อผิดพลาด: ${insertError.message}`);
        setLoading(false);
        return;
      }

      // บันทึก write_complaint (junction table)
      if (complaintData) {
        await supabase.from("write_complaint").insert({
          user_id: user.id,
          complaint_id: complaintData.complaint_id,
        });
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/resident/complaints");
      }, 2000);
    } catch (err) {
      setError("เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-complaint-page">
      {success && (
        <div className="success-message">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          ส่งเรื่องร้องเรียนสำเร็จ! กำลังนำคุณไปยังรายการร้องเรียน...
        </div>
      )}

      {error && (
        <div className="error-message">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {error}
        </div>
      )}

      <div className="form-card">
        <div className="form-card-header">
          <h2 className="form-card-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b5bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            กรอกรายละเอียดร้องเรียน
          </h2>
          <p className="form-card-description">
            กรุณากรอกข้อมูลให้ครบถ้วน เพื่อให้เจ้าหน้าที่ดำเนินการได้อย่างรวดเร็ว
          </p>
        </div>

        <form onSubmit={handleSubmit} className="complaint-form">
          {/* Subject */}
          <div className="form-field">
            <label className="form-field-label">
              หัวข้อเรื่องร้องเรียน <span className="required">*</span>
            </label>
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="เช่น น้ำรั่วซึม, ท่อระบายน้ำตัน, ไฟส่องสว่างเสีย"
              className="form-field-input"
              required
              disabled={loading || success}
            />
          </div>

          {/* Description */}
          <div className="form-field">
            <label className="form-field-label">
              รายละเอียด <span className="required">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="อธิบายรายละเอียดปัญหาที่พบ..."
              className="form-field-input form-field-textarea"
              required
              disabled={loading || success}
            />
          </div>

          {/* Location + Soi */}
          <div className="form-row">
            <div className="form-field">
              <label className="form-field-label">สถานที่</label>
              <input
                type="text"
                name="location_written"
                value={form.location_written}
                onChange={handleChange}
                placeholder="เช่น อาคาร A ชั้น 3"
                className="form-field-input"
                disabled={loading || success}
              />
            </div>
            <div className="form-field">
              <label className="form-field-label">ซอย</label>
              <input
                type="text"
                name="soi"
                value={form.soi}
                onChange={handleChange}
                placeholder="เช่น ซอย 5"
                className="form-field-input"
                disabled={loading || success}
              />
            </div>
          </div>

          {/* Intake Channel + Petition */}
          <div className="form-row">
            <div className="form-field">
              <label className="form-field-label">ช่องทางแจ้ง</label>
              <select
                name="intake_channel"
                value={form.intake_channel}
                onChange={handleChange}
                className="form-field-input form-field-select"
                disabled={loading || success}
              >
                {intakeChannelOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="form-field-label">คำร้อง/หมายเหตุ</label>
              <input
                type="text"
                name="petition"
                value={form.petition}
                onChange={handleChange}
                placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                className="form-field-input"
                disabled={loading || success}
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="form-field">
            <label className="form-field-label">แนบรูปภาพ/เอกสาร</label>
            <div
              className={`file-upload-area ${file ? "has-file" : ""}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <svg className="file-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <div className="file-upload-text">
                {file ? "เปลี่ยนไฟล์" : "คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่"}
              </div>
              <div className="file-upload-hint">รองรับ JPG, PNG, PDF (ขนาดไม่เกิน 5MB)</div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="file-upload-input"
                disabled={loading || success}
              />
            </div>
            {file && (
              <div className="file-selected">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span className="file-selected-name">{file.name}</span>
                <button type="button" className="file-remove-btn" onClick={removeFile}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="form-actions">
            <Link href="/resident/complaints" className="form-cancel-button">
              ยกเลิก
            </Link>
            <button
              type="submit"
              className="form-submit-button"
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <svg className="loading-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  กำลังส่ง...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  ส่งเรื่องร้องเรียน
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
