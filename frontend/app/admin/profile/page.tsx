"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface UserProfile {
  first_name: string;
  last_name: string;
  username: string;
  role: string;
}

export default function AdminProfilePage() {
  const [user, setUser] = useState<UserProfile>({ first_name: "", last_name: "", username: "", role: "admin" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Password change
  const [passwords, setPasswords] = useState({ new_password: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/users/profile");
        if (data.success) {
          setUser({
            first_name: data.data.first_name || "",
            last_name: data.data.last_name || "",
            username: data.data.username || "",
            role: data.data.role || "admin"
          });
        }
      } catch (err) {
        console.error("Fetch profile error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    setError("");

    try {
      const { data } = await api.patch("/users/profile", {
        first_name: user.first_name,
        last_name: user.last_name,
      });

      if (data.success) {
        setSuccess("บันทึกข้อมูลสำเร็จ!");
        
        // Update local storage so headers can reflect it without reloading
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const authUser = JSON.parse(userStr);
          authUser.full_name = `${user.first_name} ${user.last_name}`.trim();
          localStorage.setItem("user", JSON.stringify(authUser));
          window.dispatchEvent(new Event("user-updated"));
        }
        
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (passwords.new_password !== passwords.confirm) {
      setPwError("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }
    if (passwords.new_password.length < 6) {
      setPwError("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setPwSaving(true);
    try {
      const { data } = await api.post("/auth/change-password", {
        newPassword: passwords.new_password,
      });

      if (data.success) {
        setPwSuccess("เปลี่ยนรหัสผ่านสำเร็จ!");
        setPasswords({ new_password: "", confirm: "" });
        setTimeout(() => setPwSuccess(""), 3000);
      }
    } catch (err: any) {
      setPwError(err.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  const initials = user.first_name ? user.first_name.charAt(0).toUpperCase() : "A";

  return (
    <div className="max-w-[720px] flex flex-col gap-6">
      {/* ===== Header Card ===== */}
      <div className="bg-gradient-to-br from-[#161D19] to-[#B31B1B] rounded-2xl p-8 text-white flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden text-center sm:text-left">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-16 right-[70px] w-[120px] h-[120px] bg-white/5 rounded-full" />
        
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#B31B1B] to-[#ff6b6b] flex items-center justify-center text-[32px] font-bold text-white shrink-0 border-4 border-white/20 z-10">
          {initials}
        </div>
        <div className="z-10 flex-1">
          <div className="text-[22px] font-semibold mb-1">
            {user.first_name} {user.last_name}
          </div>
          <div className="text-[13px] text-white/50 mb-2">@{user.username}</div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#B31B1B]/20 border border-[#B31B1B]/30 rounded-full text-xs text-red-200">
            <span className="w-1.5 h-1.5 bg-[#ff6b6b] rounded-full animate-[pulse-dot_2s_ease-in-out_infinite]" />
            ผู้ดูแลระบบ (Admin)
          </div>
        </div>
      </div>

      {/* ===== Personal Info Form ===== */}
      <div className="bg-white rounded-xl p-6 sm:p-8 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-black/5">
        <h3 className="text-base font-semibold text-gray-900 m-0 mb-5 pb-3.5 border-b border-gray-100 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          ข้อมูลส่วนตัว
        </h3>

        {success && (
          <div className="flex items-center gap-2.5 p-3 px-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm mb-4 animate-[slideIn_0.3s_ease]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {success}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2.5 p-3 px-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-4 animate-[slideIn_0.3s_ease]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4.5">
          {/* Username (read-only) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-gray-900">ชื่อผู้ใช้งาน (Username)</label>
            <input
              type="text"
              value={user.username}
              className="w-full py-3 px-4 border border-gray-200 rounded-xl text-sm text-gray-800 bg-gray-50 cursor-not-allowed"
              disabled
            />
            <span className="text-[11px] text-gray-400 mt-px">ไม่สามารถเปลี่ยนชื่อผู้ใช้งานได้</span>
          </div>

          {/* First / Last name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-gray-900">ชื่อจริง</label>
              <input
                type="text"
                value={user.first_name}
                onChange={(e) => setUser({ ...user, first_name: e.target.value })}
                className="w-full py-3 px-4 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white outline-none transition-all duration-200 focus:border-red-600 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                disabled={saving}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-gray-900">นามสกุล</label>
              <input
                type="text"
                value={user.last_name}
                onChange={(e) => setUser({ ...user, last_name: e.target.value })}
                className="w-full py-3 px-4 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white outline-none transition-all duration-200 focus:border-red-600 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                disabled={saving}
                required
              />
            </div>
          </div>

          {/* Role (read-only info) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-gray-900">ระดับสิทธิ์</label>
            <input
              type="text"
              value="ผู้ดูแลระบบ (Admin)"
              className="w-full py-3 px-4 border border-gray-200 rounded-xl text-sm text-gray-800 bg-gray-50 cursor-not-allowed"
              disabled
            />
            <span className="text-[11px] text-gray-400 mt-px">สิทธิ์สูงสูดในระบบ ไม่สามารถเปลี่ยนได้</span>
          </div>

          <button type="submit" className="self-end sm:self-end w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-7 bg-red-600 text-white rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 hover:not(:disabled):bg-red-700 hover:not(:disabled):shadow-[0_4px_16px_rgba(220,38,38,0.35)] disabled:opacity-60 disabled:cursor-not-allowed mt-2" disabled={saving}>
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                บันทึกข้อมูล
              </>
            )}
          </button>
        </form>
      </div>

      {/* ===== Change Password ===== */}
      <div className="bg-white rounded-xl p-6 sm:p-8 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-black/5 mt-0">
        <h3 className="text-base font-semibold text-gray-900 m-0 mb-5 pb-3.5 border-b border-gray-100 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          เปลี่ยนรหัสผ่าน
        </h3>

        {pwSuccess && (
          <div className="flex items-center gap-2.5 p-3 px-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm mb-4 animate-[slideIn_0.3s_ease]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {pwSuccess}
          </div>
        )}
        {pwError && (
          <div className="flex items-center gap-2.5 p-3 px-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-4 animate-[slideIn_0.3s_ease]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {pwError}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="flex flex-col gap-4.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-gray-900">รหัสผ่านใหม่</label>
            <input
              type="password"
              value={passwords.new_password}
              onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
              placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
              className="w-full py-3 px-4 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white outline-none transition-all duration-200 focus:border-red-600 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed placeholder:text-gray-400"
              required
              disabled={pwSaving}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-gray-900">ยืนยันรหัสผ่านใหม่</label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
              className="w-full py-3 px-4 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white outline-none transition-all duration-200 focus:border-red-600 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed placeholder:text-gray-400"
              required
              disabled={pwSaving}
            />
          </div>
          <button type="submit" className="self-end sm:self-end w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-7 bg-red-600 text-white rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 hover:not(:disabled):bg-red-700 hover:not(:disabled):shadow-[0_4px_16px_rgba(220,38,38,0.35)] disabled:opacity-60 disabled:cursor-not-allowed mt-2" disabled={pwSaving}>
            {pwSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                กำลังเปลี่ยน...
              </>
            ) : (
              "เปลี่ยนรหัสผ่าน"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
