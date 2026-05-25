"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const intakeChannelOptions = [
  { value: "", label: "-- เลือกช่องทาง --" },
  { value: "website", label: "เว็บไซต์" },
  { value: "walk_in", label: "เดินเข้ามาแจ้ง" },
  { value: "phone", label: "โทรศัพท์" },
  { value: "line", label: "LINE" },
  { value: "email", label: "อีเมล" },
];

/* ===== Icons ===== */
const WarningIcon = () => (
  <svg className="w-7 h-7 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const PersonIcon = () => (
  <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const ListIcon = () => (
  <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const PaperclipIcon = () => (
  <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

export default function NewComplaintPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // ข้อมูลลูกบ้าน (read-only, ดึงจาก DB)
  const [userInfo, setUserInfo] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    house_no: "",
    phase: "",
    soi: "",
  });

  // ข้อมูลคำร้อง (กรอกใหม่)
  const [form, setForm] = useState({
    subject: "",
    description: "",
    location_written: "",
    intake_channel: "website",
    reported_date: new Date().toISOString().split("T")[0],
  });

  // ดึงข้อมูลลูกบ้านจาก Backend API
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setPageLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/complaints/user-info`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();
        if (json.success && json.data) {
          setUserInfo({
            first_name: json.data.first_name || "",
            last_name: json.data.last_name || "",
            phone_number: json.data.phone_number || "",
            house_no: json.data.house_no || "",
            phase: json.data.phase || "",
            soi: json.data.soi || "",
          });
        }
      } catch {
        // fallback
      }
      setPageLoading(false);
    };

    fetchUserInfo();
  }, []);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const executeSubmit = async () => {
    setShowConfirmModal(false);
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("กรุณาเข้าสู่ระบบก่อน");
        setLoading(false);
        return;
      }

      // ส่งคำร้องผ่าน Backend API (bypass RLS)
      const res = await fetch(`${API_URL}/complaints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: form.subject,
          description: form.description,
          location_written: form.location_written || null,
          intake_channel: form.intake_channel || null,
          reported_date: form.reported_date || new Date().toISOString(),
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.message || "เกิดข้อผิดพลาดในการบันทึก");
        setLoading(false);
        return;
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

  const inputClasses = "w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50/30 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all duration-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 disabled:opacity-50 disabled:cursor-not-allowed";
  const readOnlyClasses = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600 outline-none cursor-not-allowed";
  const labelClasses = "block text-sm font-medium text-gray-600 mb-1.5";

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-3 border-gray-200 border-t-[#d4a574] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Success Message */}
      {success && (
        <div className="mb-6 flex items-center gap-3 px-5 py-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm font-medium">
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          ส่งเรื่องร้องเรียนสำเร็จ! กำลังนำคุณไปยังรายการร้องเรียน...
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-medium">
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {error}
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-4 px-6 sm:px-8 py-6 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
            <WarningIcon />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-800 m-0">สร้างรายการร้องเรียนใหม่</h1>
            <p className="text-sm text-gray-500 mt-1 m-0">กรอกข้อมูลเพื่อบันทึกเรื่องร้องเรียน</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          {/* ===== Section 1: ข้อมูลผู้ร้องเรียน (READ-ONLY จาก DB) ===== */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <PersonIcon />
              <h2 className="text-sm font-semibold text-gray-700 m-0">1.ข้อมูลผู้ร้องเรียน</h2>
              <span className="text-xs text-gray-400 ml-auto">(ดึงจากระบบอัตโนมัติ)</span>
            </div>

            {/* Row 1: ชื่อจริง, นามสกุล, เบอร์โทร */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className={labelClasses}>ชื่อจริง</label>
                <input
                  type="text"
                  value={userInfo.first_name}
                  className={readOnlyClasses}
                  readOnly
                />
              </div>
              <div>
                <label className={labelClasses}>นามสกุล</label>
                <input
                  type="text"
                  value={userInfo.last_name}
                  className={readOnlyClasses}
                  readOnly
                />
              </div>
              <div>
                <label className={labelClasses}>เบอร์โทรศัพท์</label>
                <input
                  type="text"
                  value={userInfo.phone_number || "-"}
                  className={readOnlyClasses}
                  readOnly
                />
              </div>
            </div>

            {/* Row 2: บ้านเลขที่, เฟส, ซอย */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClasses}>บ้านเลขที่</label>
                <input
                  type="text"
                  value={userInfo.house_no || "-"}
                  className={readOnlyClasses}
                  readOnly
                />
              </div>
              <div>
                <label className={labelClasses}>เฟส</label>
                <input
                  type="text"
                  value={userInfo.phase || "-"}
                  className={readOnlyClasses}
                  readOnly
                />
              </div>
              <div>
                <label className={labelClasses}>ซอย</label>
                <input
                  type="text"
                  value={userInfo.soi || "-"}
                  className={readOnlyClasses}
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* ===== Section 2: ความประสงค์ / รายละเอียดปัญหา ===== */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <DocumentIcon />
              <h2 className="text-sm font-semibold text-gray-700 m-0">2.ความประสงค์ / รายละเอียดปัญหา</h2>
            </div>

            <div className="space-y-4">
              {/* Subject */}
              <div>
                <label className={labelClasses}>
                  หัวข้อเรื่องที่ร้องเรียน/ความประสงค์ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="เช่น น้ำรั่วซึม, ท่อระบายน้ำตัน"
                  className={inputClasses}
                  required
                  disabled={loading || success}
                />
              </div>

              {/* Description */}
              <div>
                <label className={labelClasses}>
                  รายละเอียดเพิ่มเติม <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="อธิบายรายละเอียดปัญหาที่พบ..."
                  rows={5}
                  className={`${inputClasses} resize-none`}
                  required
                  disabled={loading || success}
                />
              </div>

              {/* File Upload */}
              <div>
                <label className={labelClasses}>ไฟล์แนบ/รูปภาพประกอบคำร้อง</label>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed cursor-pointer transition-all duration-200 ${
                    file
                      ? "border-green-300 bg-green-50/50"
                      : "border-amber-200 bg-amber-50/20 hover:border-amber-400 hover:bg-amber-50/50"
                  }`}
                  onClick={() => !loading && !success && fileInputRef.current?.click()}
                >
                  <PaperclipIcon />
                  <span className="text-sm text-gray-500">
                    {file ? file.name : "แนบไฟล์เอกสาร/ รูปภาพ"}
                  </span>
                  {file && (
                    <button
                      type="button"
                      className="ml-auto p-1 rounded-full hover:bg-red-100 transition-colors bg-transparent border-none cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); removeFile(); }}
                    >
                      <svg className="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={loading || success}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* ===== Section 3: ข้อมูลเอกสารและการรับเรื่อง ===== */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <ListIcon />
              <h2 className="text-sm font-semibold text-gray-700 m-0">3.ข้อมูลเอกสารและการรับเรื่อง</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClasses}>สถานที่รับคำร้อง</label>
                <input
                  type="text"
                  name="location_written"
                  value={form.location_written}
                  onChange={handleChange}
                  placeholder="สำนักงาน"
                  className={inputClasses}
                  disabled={loading || success}
                />
              </div>
              <div>
                <label className={labelClasses}>วันที่</label>
                <input
                  type="date"
                  name="reported_date"
                  value={form.reported_date}
                  onChange={handleChange}
                  className={inputClasses}
                  disabled={loading || success}
                />
              </div>
              <div>
                <label className={labelClasses}>ช่องทางการรับเรื่อง</label>
                <select
                  name="intake_channel"
                  value={form.intake_channel}
                  onChange={handleChange}
                  className={`${inputClasses} appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22%20width%3d%2224%22%20height%3d%2224%22%20viewBox%3d%220%200%2024%2024%22%20fill%3d%22none%22%20stroke%3d%22%239ca3af%22%20stroke-width%3d%222%22%3e%3cpolyline%20points%3d%226%209%2012%2015%2018%209%22%3e%3c%2fpolyline%3e%3c%2fsvg%3e')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1rem]`}
                  disabled={loading || success}
                >
                  {intakeChannelOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Warning Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
            <div className="flex flex-col items-center text-center gap-2">
              <svg className="w-8 h-8 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-red-600 m-0">ข้อมูลในความจริงต้องตรวจสอบ</p>
                <p className="text-xs text-red-500 mt-1 m-0 leading-relaxed">
                  ถ้าพนักงานดำเนินการทุกอย่างตามระบบเป็นไปตามข้อตกลงนิติบุคคล
                  <br />
                  หากเกิดปัญหาจริงบังคับผลตามเกิดขึ้นได้ยืนยันตรวจสอบแต่แจ้งผู้เกี่ยว
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/resident/dashboard"
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 no-underline transition-colors"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#d4a574] hover:bg-[#b8865a] text-white text-sm font-medium border-none cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  กำลังบันทึก...
                </>
              ) : (
                "บันทึกคำร้อง"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 mx-auto bg-[#22c55e] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">ยืนยันการบันทึกข้อมูล</h3>
            <p className="text-sm text-gray-500 mb-8">คุณต้องการยืนยันการบันทึกข้อมูลนี้ใช่หรือไม่</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-6 py-3.5 border border-gray-200 rounded-2xl text-gray-700 font-bold hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={executeSubmit}
                className="px-6 py-3.5 bg-[#22c55e] text-white rounded-2xl font-bold hover:bg-[#16a34a] shadow-lg shadow-green-500/30 transition-all"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
