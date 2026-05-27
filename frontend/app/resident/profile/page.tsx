"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  first_name: string;
  last_name: string;
  username: string;
}

interface ResidentProfile {
  house_no: string;
  phone_number: string;
  resident_type: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile>({ first_name: "", last_name: "", username: "" });
  const [resident, setResident] = useState<ResidentProfile>({ house_no: "", phone_number: "", resident_type: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Password change
  const [passwords, setPasswords] = useState({ current: "", new_password: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");

  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        setLoading(false);
        return;
      }
      const authUser = JSON.parse(userStr);

      // ดึงข้อมูล user
      const { data: userData } = await supabase
        .from("users")
        .select("first_name, last_name, username")
        .eq("id", authUser.id)
        .single();

      if (userData) setUser(userData);

      // ดึงข้อมูล resident
      const { data: residentData } = await supabase
        .from("resident")
        .select("house_no, phone_number, resident_type")
        .eq("user_id", authUser.id)
        .single();

      if (residentData) setResident(residentData);
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    setError("");

    try {
      const supabase = createClient();
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        setSaving(false);
        return;
      }
      const authUser = JSON.parse(userStr);

      // อัปเดต users table
      const { error: userError } = await supabase
        .from("users")
        .update({
          first_name: user.first_name,
          last_name: user.last_name,
        })
        .eq("id", authUser.id);

      if (userError) {
        setError(`อัปเดตข้อมูลไม่สำเร็จ: ${userError.message}`);
        setSaving(false);
        return;
      }

      // อัปเดต resident table
      const { error: residentError } = await supabase
        .from("resident")
        .update({
          house_no: resident.house_no,
          phone_number: resident.phone_number,
          resident_type: resident.resident_type,
        })
        .eq("user_id", authUser.id);

      if (residentError) {
        setError(`อัปเดตข้อมูลลูกบ้านไม่สำเร็จ: ${residentError.message}`);
        setSaving(false);
        return;
      }

      setSuccess("บันทึกข้อมูลสำเร็จ!");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
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
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: passwords.new_password,
      });

      if (error) {
        setPwError(error.message);
      } else {
        setPwSuccess("เปลี่ยนรหัสผ่านสำเร็จ!");
        setPasswords({ current: "", new_password: "", confirm: "" });
        setTimeout(() => setPwSuccess(""), 3000);
      }
    } catch {
      setPwError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setPwSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "ลบบัญชี") return;
    setDeleting(true);
    setDeleteError("");

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setDeleteError("ไม่พบ session กรุณาเข้าสู่ระบบใหม่");
        setDeleting(false);
        return;
      }

      const res = await fetch("http://localhost:5000/api/auth/account", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setDeleteError(data.message || "ลบบัญชีไม่สำเร็จ");
        setDeleting(false);
        return;
      }

      // Sign out locally and redirect
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      setDeleteError("เกิดข้อผิดพลาด กรุณาลองใหม่");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  const initials = user.first_name ? user.first_name.charAt(0).toUpperCase() : "?";

  return (
    <div className="max-w-[720px] flex flex-col gap-6 w-full mx-auto pb-8">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] rounded-2xl p-8 text-white flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden text-center sm:text-left">
        <div className="absolute -top-10 -right-10 w-[150px] h-[150px] bg-[#3b5bff]/15 rounded-full" />
        <div className="absolute -bottom-16 right-[60px] w-[120px] h-[120px] bg-[#3b5bff]/10 rounded-full" />

        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#3b5bff] to-[#6c8aff] flex items-center justify-center text-[32px] font-bold text-white shrink-0 border-4 border-white/20 z-10">
          {initials}
        </div>
        <div className="z-10 flex-1">
          <div className="text-[22px] font-semibold mb-1">
            {user.first_name} {user.last_name}
          </div>
          <div className="text-[13px] text-white/60 flex items-center justify-center sm:justify-start gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#5cff8a] rounded-full" />
            ลูกบ้าน (Resident)
          </div>
        </div>
      </div>

      {/* Personal Info Form */}
      <div className="bg-white rounded-xl p-6 sm:p-8 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-black/5">
        <h3 className="text-base font-semibold text-[#1a1a2e] m-0 mb-5 pb-3.5 border-b border-[#f0f0f0] flex items-center gap-2">
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
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#1a1a2e]">ชื่อผู้ใช้งาน</label>
            <input
              type="text"
              value={user.username}
              className="w-full py-3 px-4 border border-[#e0e0e0] rounded-xl text-sm text-[#333] bg-[#f8f8f8] cursor-not-allowed"
              disabled
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#1a1a2e]">ชื่อจริง</label>
              <input
                type="text"
                value={user.first_name}
                onChange={(e) => setUser({ ...user, first_name: e.target.value })}
                className="w-full py-3 px-4 border border-[#e0e0e0] rounded-xl text-sm text-[#333] bg-white outline-none transition-all duration-200 focus:border-[#3b5bff] focus:shadow-[0_0_0_3px_rgba(59,91,255,0.1)] disabled:bg-[#f8f8f8] disabled:text-[#888] disabled:cursor-not-allowed"
                disabled={saving}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#1a1a2e]">นามสกุล</label>
              <input
                type="text"
                value={user.last_name}
                onChange={(e) => setUser({ ...user, last_name: e.target.value })}
                className="w-full py-3 px-4 border border-[#e0e0e0] rounded-xl text-sm text-[#333] bg-white outline-none transition-all duration-200 focus:border-[#3b5bff] focus:shadow-[0_0_0_3px_rgba(59,91,255,0.1)] disabled:bg-[#f8f8f8] disabled:text-[#888] disabled:cursor-not-allowed"
                disabled={saving}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#1a1a2e]">บ้านเลขที่</label>
              <input
                type="text"
                value={resident.house_no}
                onChange={(e) => setResident({ ...resident, house_no: e.target.value })}
                placeholder="เช่น 123/45"
                className="w-full py-3 px-4 border border-[#e0e0e0] rounded-xl text-sm text-[#333] bg-white outline-none transition-all duration-200 focus:border-[#3b5bff] focus:shadow-[0_0_0_3px_rgba(59,91,255,0.1)] disabled:bg-[#f8f8f8] disabled:text-[#888] disabled:cursor-not-allowed placeholder:text-[#aaa]"
                disabled={saving}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#1a1a2e]">เบอร์โทรศัพท์</label>
              <input
                type="tel"
                value={resident.phone_number}
                onChange={(e) => setResident({ ...resident, phone_number: e.target.value })}
                placeholder="เช่น 081-234-5678"
                className="w-full py-3 px-4 border border-[#e0e0e0] rounded-xl text-sm text-[#333] bg-white outline-none transition-all duration-200 focus:border-[#3b5bff] focus:shadow-[0_0_0_3px_rgba(59,91,255,0.1)] disabled:bg-[#f8f8f8] disabled:text-[#888] disabled:cursor-not-allowed placeholder:text-[#aaa]"
                disabled={saving}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#1a1a2e]">ประเภทผู้อยู่อาศัย</label>
            <input
              type="text"
              value={resident.resident_type}
              onChange={(e) => setResident({ ...resident, resident_type: e.target.value })}
              placeholder="เช่น เจ้าของบ้าน, ผู้เช่า"
              className="w-full py-3 px-4 border border-[#e0e0e0] rounded-xl text-sm text-[#333] bg-white outline-none transition-all duration-200 focus:border-[#3b5bff] focus:shadow-[0_0_0_3px_rgba(59,91,255,0.1)] disabled:bg-[#f8f8f8] disabled:text-[#888] disabled:cursor-not-allowed placeholder:text-[#aaa]"
              disabled={saving}
            />
          </div>

          <button type="submit" className="self-end sm:self-end w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-7 bg-[#1400ff] text-white rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 hover:not(:disabled):bg-[#1000d6] hover:not(:disabled):shadow-[0_4px_16px_rgba(20,0,255,0.25)] disabled:opacity-60 disabled:cursor-not-allowed mt-2" disabled={saving}>
            {saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
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

      {/* Change Password */}
      <div className="bg-white rounded-xl p-6 sm:p-8 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-black/5 mt-0">
        <h3 className="text-base font-semibold text-[#1a1a2e] m-0 mb-5 pb-3.5 border-b border-[#f0f0f0] flex items-center gap-2">
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
            <label className="text-[13px] font-medium text-[#1a1a2e]">รหัสผ่านใหม่</label>
            <input
              type="password"
              value={passwords.new_password}
              onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
              placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
              className="w-full py-3 px-4 border border-[#e0e0e0] rounded-xl text-sm text-[#333] bg-white outline-none transition-all duration-200 focus:border-[#3b5bff] focus:shadow-[0_0_0_3px_rgba(59,91,255,0.1)] disabled:bg-[#f8f8f8] disabled:text-[#888] disabled:cursor-not-allowed placeholder:text-[#aaa]"
              required
              disabled={pwSaving}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#1a1a2e]">ยืนยันรหัสผ่านใหม่</label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
              className="w-full py-3 px-4 border border-[#e0e0e0] rounded-xl text-sm text-[#333] bg-white outline-none transition-all duration-200 focus:border-[#3b5bff] focus:shadow-[0_0_0_3px_rgba(59,91,255,0.1)] disabled:bg-[#f8f8f8] disabled:text-[#888] disabled:cursor-not-allowed placeholder:text-[#aaa]"
              required
              disabled={pwSaving}
            />
          </div>
          <button type="submit" className="self-end sm:self-end w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-7 bg-[#1400ff] text-white rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 hover:not(:disabled):bg-[#1000d6] hover:not(:disabled):shadow-[0_4px_16px_rgba(20,0,255,0.25)] disabled:opacity-60 disabled:cursor-not-allowed mt-2" disabled={pwSaving}>
            {pwSaving ? "กำลังเปลี่ยน..." : "เปลี่ยนรหัสผ่าน"}
          </button>
        </form>
      </div>

      {/* Danger Zone - Delete Account */}
      <div className="bg-gradient-to-br from-white to-red-50 border border-red-500/20 rounded-xl p-6 sm:p-8 mt-0 shadow-sm">
        <h3 className="text-base font-semibold text-red-600 m-0 mb-5 pb-3.5 border-b border-red-500/15 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          ลบบัญชี
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed mb-5 m-0">
          เมื่อลบบัญชีแล้ว ข้อมูลทั้งหมดของคุณจะถูกลบอย่างถาวรและไม่สามารถกู้คืนได้
          รวมถึงข้อมูลส่วนตัว ประวัติการร้องเรียน และข้อมูลอื่นๆ ทั้งหมด
        </p>
        <button
          type="button"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 bg-transparent text-red-600 border border-red-500/30 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-[0_4px_16px_rgba(220,38,38,0.25)]"
          onClick={() => setShowDeleteModal(true)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
          ลบบัญชีของฉัน
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[4px] flex items-center justify-center z-[1000] animate-[fadeIn_0.2s_ease]" onClick={() => !deleting && setShowDeleteModal(false)}>
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-[440px] w-[90%] shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-[slideUp_0.3s_ease]" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 text-red-600">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#1a1a2e] text-center m-0 mb-2">ยืนยันการลบบัญชี</h3>
            <p className="text-sm text-gray-500 text-center leading-relaxed m-0 mb-2">
              การดำเนินการนี้ไม่สามารถย้อนกลับได้ ข้อมูลทั้งหมดจะถูกลบถาวร
            </p>
            <p className="text-sm text-gray-500 text-center leading-relaxed m-0 mb-2">
              กรุณาพิมพ์ <strong className="text-red-600 font-semibold">ลบบัญชี</strong> เพื่อยืนยัน
            </p>

            {deleteError && (
              <div className="flex items-center gap-2.5 p-3 px-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-3 mt-3 animate-[slideIn_0.3s_ease]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {deleteError}
              </div>
            )}

            <input
              type="text"
              className="w-full py-3 px-4 mt-3 border border-red-500/30 rounded-xl text-sm text-[#333] bg-white outline-none transition-all duration-200 focus:border-red-600 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)] placeholder:text-[#aaa]"
              placeholder='พิมพ์ "ลบบัญชี" ที่นี่'
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              disabled={deleting}
            />
            <div className="flex gap-3 mt-5">
              <button
                type="button"
                className="flex-1 py-3 px-4 bg-[#f3f3f3] border border-[#e0e0e0] rounded-xl text-sm font-medium text-[#333] cursor-pointer transition-colors duration-200 hover:bg-[#e8e8e8]"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                  setDeleteError("");
                }}
                disabled={deleting}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className="flex-1 py-3 px-4 bg-red-600 border-none rounded-xl text-sm font-semibold text-white cursor-pointer transition-all duration-200 hover:not(:disabled):bg-red-700 hover:not(:disabled):shadow-[0_4px_16px_rgba(220,38,38,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "ลบบัญชี" || deleting}
              >
                {deleting ? "กำลังลบ..." : "ลบบัญชีถาวร"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
