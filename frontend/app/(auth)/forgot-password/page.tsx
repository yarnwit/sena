"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./forgot-password.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Step tracking: 1 = username, 2 = verify identity, 3 = new password, 4 = success
  const [step, setStep] = useState(1);

  // Form fields
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State
  const [resetToken, setResetToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1 & 2: Verify identity
  const handleVerifyIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          first_name: firstName,
          last_name: lastName,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "ข้อมูลไม่ถูกต้อง");
        return;
      }

      setResetToken(data.data.resetToken);
      setStep(3);
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน กรุณากรอกใหม่");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resetToken,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้");
        return;
      }

      setStep(4);
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  // Step indicator
  const stepLabels = ["ชื่อผู้ใช้", "ยืนยันตัวตน", "รหัสใหม่"];

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        {/* Logo Section */}
        <div className="logo-section">
          <div className="logo-text">
            <div className="logo-divider-top"></div>
            <span className="logo-sena">SENA</span>
            <h1 className="logo-grand-home">GRAND HOME</h1>
            <span className="logo-location">Rangsit - Tiwanon</span>
          </div>
        </div>

        {/* Page Title */}
        <h2 className="forgot-title">
          {step === 4 ? "สำเร็จ!" : "ลืมรหัสผ่าน?"}
        </h2>
        <p className="forgot-subtitle">
          {step === 1 && "กรอกชื่อผู้ใช้งานของคุณเพื่อเริ่มกระบวนการ"}
          {step === 2 && "กรอกชื่อ-นามสกุล ที่ใช้ลงทะเบียนเพื่อยืนยันตัวตน"}
          {step === 3 && "กำหนดรหัสผ่านใหม่สำหรับบัญชีของคุณ"}
          {step === 4 && "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว"}
        </p>

        {/* Step Indicator */}
        {step < 4 && (
          <div className="step-indicator">
            {stepLabels.map((label, index) => (
              <div key={index} className="step-item">
                <div
                  className={`step-circle ${
                    index + 1 < step
                      ? "step-completed"
                      : index + 1 === step
                      ? "step-active"
                      : ""
                  }`}
                >
                  {index + 1 < step ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`step-label ${
                    index + 1 <= step ? "step-label-active" : ""
                  }`}
                >
                  {label}
                </span>
                {index < stepLabels.length - 1 && (
                  <div
                    className={`step-line ${
                      index + 1 < step ? "step-line-completed" : ""
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* ===== STEP 1: Enter Username ===== */}
        {step === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setError("");
              if (!username.trim()) {
                setError("กรุณากรอกชื่อผู้ใช้งาน");
                return;
              }
              setUsername(username.trim());
              setStep(2);
            }}
            className="forgot-password-form"
          >
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                ชื่อผู้ใช้งาน
              </label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="กรอกชื่อผู้ใช้งาน"
                  className="form-input has-icon"
                  autoComplete="username"
                  required
                  autoFocus
                />
              </div>
            </div>

            <button type="submit" className="forgot-button" id="step1-next-button">
              ถัดไป
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </form>
        )}

        {/* ===== STEP 2: Verify Identity ===== */}
        {step === 2 && (
          <form onSubmit={handleVerifyIdentity} className="forgot-password-form">
            <div className="identity-info-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="9" cy="10" r="2" />
                <path d="M15 8h2" />
                <path d="M15 12h2" />
                <path d="M7 16h10" />
              </svg>
              <span>กรอกข้อมูลให้ตรงกับที่ลงทะเบียนไว้ในระบบ</span>
            </div>

            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                ชื่อจริง
              </label>
              <div className="input-wrapper">
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="กรอกชื่อจริง"
                  className="form-input"
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                นามสกุล
              </label>
              <div className="input-wrapper">
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="กรอกนามสกุล"
                  className="form-input"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="back-step-button"
                onClick={() => {
                  setError("");
                  setStep(1);
                }}
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                ย้อนกลับ
              </button>
              <button
                type="submit"
                id="verify-identity-button"
                className="forgot-button flex-1"
                disabled={loading}
              >
                {loading ? (
                  <span className="forgot-loading">
                    <svg className="spinner" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    กำลังตรวจสอบ...
                  </span>
                ) : (
                  <>
                    ยืนยันตัวตน
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ===== STEP 3: Set New Password ===== */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="newPassword" className="form-label">
                รหัสผ่านใหม่
              </label>
              <div className="input-wrapper password-wrapper">
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัว)"
                  className="form-input"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  disabled={loading}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>
              {/* Password strength indicator */}
              {newPassword && (
                <div className="password-strength">
                  <div className={`strength-bar ${
                    newPassword.length >= 8 ? "strength-strong" :
                    newPassword.length >= 6 ? "strength-medium" : "strength-weak"
                  }`} />
                  <span className="strength-text">
                    {newPassword.length >= 8 ? "รหัสผ่านแข็งแรง" :
                     newPassword.length >= 6 ? "รหัสผ่านปานกลาง" : "รหัสผ่านอ่อนแอ"}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                ยืนยันรหัสผ่านใหม่
              </label>
              <div className="input-wrapper password-wrapper">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  className="form-input"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="password-toggle"
                  aria-label={showConfirmPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>
              {/* Match indicator */}
              {confirmPassword && (
                <div className={`match-indicator ${newPassword === confirmPassword ? "match-ok" : "match-error"}`}>
                  {newPassword === confirmPassword ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      รหัสผ่านตรงกัน
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      รหัสผ่านไม่ตรงกัน
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              id="reset-password-button"
              className="forgot-button"
              disabled={loading}
            >
              {loading ? (
                <span className="forgot-loading">
                  <svg className="spinner" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  กำลังเปลี่ยนรหัสผ่าน...
                </span>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  เปลี่ยนรหัสผ่าน
                </>
              )}
            </button>
          </form>
        )}

        {/* ===== STEP 4: Success ===== */}
        {step === 4 && (
          <div className="success-section">
            <div className="success-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <p className="success-text">
              รหัสผ่านของคุณได้ถูกเปลี่ยนเรียบร้อยแล้ว
              <br />
              กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่
            </p>
            <button
              className="forgot-button"
              id="go-to-login-button"
              onClick={() => router.push("/login")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              ไปหน้าเข้าสู่ระบบ
            </button>
          </div>
        )}

        {/* Back Link */}
        {step < 4 && (
          <div className="back-link-section">
            <Link href="/login" className="back-link">
              <span className="back-link-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </span>
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
