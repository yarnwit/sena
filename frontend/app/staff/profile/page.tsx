"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import "./profile.css";

interface UserProfile {
  first_name: string;
  last_name: string;
  username: string;
  role: string;
}

interface WorkStats {
  total: number;
  in_progress: number;
  resolved: number;
}

export default function StaffProfilePage() {
  const [user, setUser] = useState<UserProfile>({ first_name: "", last_name: "", username: "", role: "staff" });
  const [stats, setStats] = useState<WorkStats>({ total: 0, in_progress: 0, resolved: 0 });
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
      const supabase = createClient();
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        setLoading(false);
        return;
      }
      const authUser = JSON.parse(userStr);

      // ดึงข้อมูล users
      const { data: userData } = await supabase
        .from("users")
        .select("first_name, last_name, username, role")
        .eq("id", authUser.id)
        .single();

      if (userData) setUser(userData);

      // ดึง stats ของงานในระบบ (สำหรับ staff ดูทั้งระบบ ไม่ใช่เฉพาะตัวเอง)
      const { data: complaints } = await supabase
        .from("complaints")
        .select("status");

      if (complaints) {
        setStats({
          total:       complaints.length,
          in_progress: complaints.filter((c) => c.status === "in_progress").length,
          resolved:    complaints.filter((c) => c.status === "resolved" || c.status === "closed").length,
        });
      }

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

      const { error: userError } = await supabase
        .from("users")
        .update({
          first_name: user.first_name,
          last_name:  user.last_name,
        })
        .eq("id", authUser.id);

      if (userError) {
        setError(`อัปเดตข้อมูลไม่สำเร็จ: ${userError.message}`);
      } else {
        setSuccess("บันทึกข้อมูลสำเร็จ!");
        setTimeout(() => setSuccess(""), 3000);
      }
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
      const { error } = await supabase.auth.updateUser({ password: passwords.new_password });

      if (error) {
        setPwError(error.message);
      } else {
        setPwSuccess("เปลี่ยนรหัสผ่านสำเร็จ!");
        setPasswords({ new_password: "", confirm: "" });
        setTimeout(() => setPwSuccess(""), 3000);
      }
    } catch {
      setPwError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  const initials = user.first_name ? user.first_name.charAt(0).toUpperCase() : "S";

  return (
    <div className="profile-page">
      {/* ===== Header Card ===== */}
      <div className="profile-header-card">
        <div className="profile-avatar-large">{initials}</div>
        <div className="profile-header-info">
          <div className="profile-header-name">
            {user.first_name} {user.last_name}
          </div>
          <div className="profile-header-username">@{user.username}</div>
          <div className="profile-header-role">
            <span className="role-dot" />
            เจ้าหน้าที่นิติบุคคล (Staff)
          </div>
        </div>
      </div>

      {/* ===== Work Stats Row ===== */}
      <div className="profile-stats-row">
        <div className="profile-stat-card">
          <div className="profile-stat-icon amber">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
              <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
            </svg>
          </div>
          <div>
            <div className="profile-stat-value">{stats.total}</div>
            <div className="profile-stat-label">เรื่องร้องเรียนทั้งหมด</div>
          </div>
        </div>

        <div className="profile-stat-card">
          <div className="profile-stat-icon green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div>
            <div className="profile-stat-value">{stats.in_progress}</div>
            <div className="profile-stat-label">กำลังดำเนินการ</div>
          </div>
        </div>

        <div className="profile-stat-card">
          <div className="profile-stat-icon purple">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <div className="profile-stat-value">{stats.resolved}</div>
            <div className="profile-stat-label">แก้ไขแล้ว / ปิด</div>
          </div>
        </div>
      </div>

      {/* ===== Personal Info Form ===== */}
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
          {/* Username (read-only) */}
          <div className="profile-form-field">
            <label className="profile-form-label">ชื่อผู้ใช้งาน (Username)</label>
            <input
              type="text"
              value={user.username}
              className="profile-form-input"
              disabled
            />
            <span className="profile-form-hint">ไม่สามารถเปลี่ยนชื่อผู้ใช้งานได้</span>
          </div>

          {/* First / Last name */}
          <div className="profile-form-row">
            <div className="profile-form-field">
              <label className="profile-form-label">ชื่อจริง</label>
              <input
                type="text"
                value={user.first_name}
                onChange={(e) => setUser({ ...user, first_name: e.target.value })}
                className="profile-form-input"
                disabled={saving}
                required
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
                required
              />
            </div>
          </div>

          {/* Role (read-only info) */}
          <div className="profile-form-field">
            <label className="profile-form-label">ระดับสิทธิ์</label>
            <input
              type="text"
              value="เจ้าหน้าที่นิติบุคคล (Staff)"
              className="profile-form-input"
              disabled
            />
            <span className="profile-form-hint">สิทธิ์นี้กำหนดโดยผู้ดูแลระบบ ไม่สามารถเปลี่ยนได้</span>
          </div>

          <button type="submit" className="profile-save-button" disabled={saving}>
            {saving ? (
              <>
                <div className="loading-spinner inline" />
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
            {pwSaving ? (
              <>
                <div className="loading-spinner inline" />
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
