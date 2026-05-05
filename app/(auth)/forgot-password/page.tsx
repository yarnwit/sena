"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import "./forgot-password.css";

export default function ForgotPasswordPage() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const supabase = createClient();

      // ถ้าไม่มี @ ให้เติม domain สำหรับ Supabase
      const email = emailOrUsername.includes("@")
        ? emailOrUsername
        : `${emailOrUsername}@sena-grandhome.local`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSuccess(
        "ส่งลิงก์รีเซ็ตรหัสผ่านเรียบร้อยแล้ว กรุณาตรวจสอบอีเมลของคุณ"
      );
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

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
        <h2 className="forgot-title">ลืมรหัสผ่าน?</h2>
        <p className="forgot-subtitle">
          ระบบจะส่งลิงก์รีเซ็ตไปยังอีเมลของคุณ
        </p>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="success-message">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        {/* Forgot Password Form */}
        <form onSubmit={handleSubmit} className="forgot-password-form">
          {/* Email / Username Field */}
          <div className="form-group">
            <label htmlFor="emailOrUsername" className="form-label">
              อีเมล หรือ ชื่อผู้ใช้
            </label>
            <div className="input-wrapper">
              <input
                id="emailOrUsername"
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="กรอกอีเมล หรือ ชื่อผู้ใช้งาน"
                className="form-input"
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Spam Notice */}
          <div className="spam-notice">
            <svg
              className="spam-notice-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>ตรวจสอบโฟลเดอร์ Spam หากไม่พบอีเมลภายใน 5 นาที</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="forgot-password-button"
            className="forgot-button"
            disabled={loading}
          >
            {loading ? (
              <span className="forgot-loading">
                <svg
                  className="spinner"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                กำลังส่งลิงก์...
              </span>
            ) : (
              "ส่งลิงก์รีเซ็ตรหัสผ่าน"
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="back-link-section">
          <Link href="/login" className="back-link">
            <span className="back-link-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </span>
            กลับไปหน้าก่อนหน้า
          </Link>
        </div>
      </div>
    </div>
  );
}
