"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* ===== Helpers ===== */
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

function getToken() {
  try { return localStorage.getItem("accessToken") ?? ""; } catch { return ""; }
}
function authHeaders() {
  return { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
}

/* ===== SVG Icons ===== */
const IconArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "resident",
    house_no: "",
    phase: "",
    soi: "",
    phone_number: "",
    resident_type: "owner",
  });

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const doCreate = async () => {
      const res = await fetch(`${API}/admin/users`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(formData),
      });
      return res;
    };

    try {
      let res = await doCreate();

      // If token expired, try to refresh and retry
      if (res.status === 401) {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const refreshRes = await fetch(`${API}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });
          const refreshData = await refreshRes.json();
          if (refreshRes.ok && refreshData.data?.accessToken) {
            localStorage.setItem("accessToken", refreshData.data.accessToken);
            if (refreshData.data.refreshToken) {
              localStorage.setItem("refreshToken", refreshData.data.refreshToken);
            }
            // Retry with new token
            res = await doCreate();
          }
        }
      }

      const data = await res.json();

      if (res.ok && data.success !== false) {
        showToast("สร้างบัญชีผู้ใช้สำเร็จ", "success");
        setTimeout(() => {
          router.push("/admin/users");
        }, 1500);
      } else {
        showToast(data.message || "เกิดข้อผิดพลาดในการสร้างบัญชี", "error");
        setLoading(false);
      }
    } catch (err) {
      showToast("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้", "error");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto grid gap-6">
      {/* ── Page Header ── */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/users"
          className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <IconArrowLeft />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-gray-900 m-0">เพิ่มบัญชีผู้ใช้งานใหม่</h2>
          <p className="text-sm text-gray-500 mt-1 mb-0">สร้างบัญชีผู้ใช้ใหม่สำหรับลูกบ้าน นิติบุคคล หรือแอดมิน</p>
        </div>
      </div>

      {/* ── Form Card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
            {/* ข้อมูลบัญชีผู้ใช้ */}
            <div className="md:col-span-2 pb-2 mb-2 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-800 m-0">ข้อมูลบัญชี</h3>
            </div>

            <div className="grid gap-1.5">
              <label className="text-[13px] font-medium text-gray-700">ชื่อผู้ใช้งาน (Username) <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="username" 
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="เช่น somchai123"
                className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50/50 text-[14px] text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" 
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-[13px] font-medium text-gray-700">รหัสผ่าน <span className="text-red-500">*</span></label>
              <input 
                type="password" 
                name="password" 
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="ตั้งรหัสผ่าน 6 ตัวอักษรขึ้นไป"
                minLength={6}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50/50 text-[14px] text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" 
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-[13px] font-medium text-gray-700">สิทธิ์การใช้งาน (Role) <span className="text-red-500">*</span></label>
              <select 
                name="role" 
                value={formData.role}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50/50 text-[14px] text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
              >
                <option value="resident">ลูกบ้าน</option>
                <option value="staff">นิติบุคคล</option>
                <option value="admin">แอดมิน</option>
              </select>
            </div>

            {/* ข้อมูลส่วนตัว */}
            <div className="md:col-span-2 pb-2 mb-2 mt-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-800 m-0">ข้อมูลส่วนตัว</h3>
            </div>

            <div className="grid gap-1.5">
              <label className="text-[13px] font-medium text-gray-700">ชื่อจริง <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="first_name" 
                required
                value={formData.first_name}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50/50 text-[14px] text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" 
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-[13px] font-medium text-gray-700">นามสกุล <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="last_name" 
                required
                value={formData.last_name}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50/50 text-[14px] text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" 
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-[13px] font-medium text-gray-700">เบอร์โทรศัพท์</label>
              <input 
                type="tel" 
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50/50 text-[14px] text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" 
              />
            </div>

            {/* ข้อมูลลูกบ้าน (ถ้าเป็น resident) */}
            {formData.role === "resident" && (
              <>
                <div className="md:col-span-2 pb-2 mb-2 mt-4 border-b border-gray-100">
                  <h3 className="text-base font-semibold text-gray-800 m-0">ข้อมูลที่พักอาศัย</h3>
                </div>

                <div className="grid gap-1.5">
                  <label className="text-[13px] font-medium text-gray-700">บ้านเลขที่ <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="house_no" 
                    required={formData.role === "resident"}
                    value={formData.house_no}
                    onChange={handleChange}
                    placeholder="เช่น 123/45"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50/50 text-[14px] text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" 
                  />
                </div>

                <div className="grid gap-1.5">
                  <label className="text-[13px] font-medium text-gray-700">เฟส (Phase)</label>
                  <input 
                    type="text" 
                    name="phase" 
                    value={formData.phase}
                    onChange={handleChange}
                    placeholder="เช่น เฟส 1"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50/50 text-[14px] text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" 
                  />
                </div>

                <div className="grid gap-1.5">
                  <label className="text-[13px] font-medium text-gray-700">ซอย (Soi)</label>
                  <input 
                    type="text" 
                    name="soi" 
                    value={formData.soi}
                    onChange={handleChange}
                    placeholder="เช่น ซอย 2"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50/50 text-[14px] text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" 
                  />
                </div>

                <div className="grid gap-1.5">
                  <label className="text-[13px] font-medium text-gray-700">สถานะผู้พักอาศัย</label>
                  <select 
                    name="resident_type" 
                    value={formData.resident_type}
                    onChange={handleChange}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50/50 text-[14px] text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                  >
                    <option value="owner">เจ้าของบ้าน</option>
                    <option value="tenant">ผู้เช่า</option>
                    <option value="relative">ผู้อยู่อาศัย / ญาติ</option>
                  </select>
                </div>
              </>
            )}
          </div>

          <div className="mt-10 flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
            <Link
              href="/admin/users"
              className="px-6 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-medium border-none text-white bg-gradient-to-r from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "กำลังบันทึก..." : "ยืนยันการสร้างบัญชี"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Toast Notification ── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-2.5 px-5.5 py-3.5 rounded-xl text-sm font-medium z-[300] shadow-[0_10px_30px_rgba(0,0,0,0.15)] animate-[users-toast-in_0.3s_cubic-bezier(0.34,1.56,0.64,1)] ${toast.type === "success" ? "bg-emerald-800 text-emerald-100" : "bg-red-800 text-red-100"}`}>
          <span className="shrink-0">
            {toast.type === "success" ? <IconCheck /> : <IconX />}
          </span>
          {toast.message}
        </div>
      )}
    </div>
  );
}
