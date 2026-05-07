"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "./profile.css";

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
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) return;

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
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

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
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  const initials = user.first_name ? user.first_name.charAt(0).toUpperCase() : "?";

  return (
    <div className="profile-page">
      {/* Header Card */}
      <div className="profile-header-card">
        <div className="profile-avatar-large">{initials}</div>
        <div className="profile-header-info">
          <div className="profile-header-name">
            {user.first_name} {user.last_name}
          </div>
          <div className="profile-header-role">
            <span className="role-dot" />
            ลูกบ้าน (Resident)
          </div>
        </div>
      </div>

      {/* Personal Info Form */}
      <div className="profile-form-card">
        <h3 className="profile-section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          ข้อมูลส่วนตัว
        </h3>

        {success && (
          <div className="profile-success">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {success}
          </div>
        )}
        {error && (
          <div className="profile-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="profile-form">
          <div className="profile-form-field">
            <label className="profile-form-label">ชื่อผู้ใช้งาน</label>
            <input
              type="text"
              value={user.username}
              className="profile-form-input"
              disabled
            />
          </div>

          <div className="profile-form-row">
            <div className="profile-form-field">
              <label className="profile-form-label">ชื่อจริง</label>
              <input
                type="text"
                value={user.first_name}
                onChange={(e) => setUser({ ...user, first_name: e.target.value })}
                className="profile-form-input"
                disabled={saving}
              />
            </div>
            <div className="profile-form-field">
              <label className="profile-form-label">นามสกุล</label>
              <input
                type="text"
                value={user.last_name}
                onChange={(e) => setUser({ ...user, last_name: e.target.value })}
                className="profile-form-input"
                disabled={saving}
              />
            </div>
          </div>

          <div className="profile-form-row">
            <div className="profile-form-field">
              <label className="profile-form-label">บ้านเลขที่</label>
              <input
                type="text"
                value={resident.house_no}
                onChange={(e) => setResident({ ...resident, house_no: e.target.value })}
                placeholder="เช่น 123/45"
                className="profile-form-input"
                disabled={saving}
              />
            </div>
            <div className="profile-form-field">
              <label className="profile-form-label">เบอร์โทรศัพท์</label>
              <input
                type="tel"
                value={resident.phone_number}
                onChange={(e) => setResident({ ...resident, phone_number: e.target.value })}
                placeholder="เช่น 081-234-5678"
                className="profile-form-input"
                disabled={saving}
              />
            </div>
          </div>

          <div className="profile-form-field">
            <label className="profile-form-label">ประเภทผู้อยู่อาศัย</label>
            <input
              type="text"
              value={resident.resident_type}
              onChange={(e) => setResident({ ...resident, resident_type: e.target.value })}
              placeholder="เช่น เจ้าของบ้าน, ผู้เช่า"
              className="profile-form-input"
              disabled={saving}
            />
          </div>

          <button type="submit" className="profile-save-button" disabled={saving}>
            {saving ? (
              <>
                <svg className="loading-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      <div className="profile-form-card password-section">
        <h3 className="profile-section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          เปลี่ยนรหัสผ่าน
        </h3>

        {pwSuccess && (
          <div className="profile-success">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {pwSuccess}
          </div>
        )}
        {pwError && (
          <div className="profile-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {pwError}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="profile-form">
          <div className="profile-form-field">
            <label className="profile-form-label">รหัสผ่านใหม่</label>
            <input
              type="password"
              value={passwords.new_password}
              onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
              placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
              className="profile-form-input"
              required
              disabled={pwSaving}
            />
          </div>
          <div className="profile-form-field">
            <label className="profile-form-label">ยืนยันรหัสผ่านใหม่</label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
              className="profile-form-input"
              required
              disabled={pwSaving}
            />
          </div>
          <button type="submit" className="profile-save-button" disabled={pwSaving}>
            {pwSaving ? "กำลังเปลี่ยน..." : "เปลี่ยนรหัสผ่าน"}
          </button>
        </form>
      </div>

      {/* Danger Zone - Delete Account */}
      <div className="profile-form-card danger-zone-card">
        <h3 className="profile-section-title danger-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          ลบบัญชี
        </h3>
        <p className="danger-description">
          เมื่อลบบัญชีแล้ว ข้อมูลทั้งหมดของคุณจะถูกลบอย่างถาวรและไม่สามารถกู้คืนได้
          รวมถึงข้อมูลส่วนตัว ประวัติการร้องเรียน และข้อมูลอื่นๆ ทั้งหมด
        </p>
        <button
          type="button"
          className="delete-account-button"
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
        <div className="delete-modal-overlay" onClick={() => !deleting && setShowDeleteModal(false)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h3 className="delete-modal-title">ยืนยันการลบบัญชี</h3>
            <p className="delete-modal-text">
              การดำเนินการนี้ไม่สามารถย้อนกลับได้ ข้อมูลทั้งหมดจะถูกลบถาวร
            </p>
            <p className="delete-modal-text">
              กรุณาพิมพ์ <strong>ลบบัญชี</strong> เพื่อยืนยัน
            </p>

            {deleteError && (
              <div className="profile-error" style={{ marginBottom: 12 }}>
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
              className="profile-form-input delete-confirm-input"
              placeholder='พิมพ์ "ลบบัญชี" ที่นี่'
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              disabled={deleting}
            />
            <div className="delete-modal-actions">
              <button
                type="button"
                className="delete-modal-cancel"
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
                className="delete-modal-confirm"
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
