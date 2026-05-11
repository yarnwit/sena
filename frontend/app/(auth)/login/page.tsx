"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./login.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ส่ง/รับ cookie (refreshToken)
        body: JSON.stringify({ username, password }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError("ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง");
        return;
      }

      const { accessToken, user } = json.data;

      // เก็บ accessToken และข้อมูลผู้ใช้ไว้ใน localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      // เก็บ accessToken และ user ไว้ใน cookie เพื่อให้ middleware อ่านได้
      document.cookie = `accessToken=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
      document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;

      // Redirect ตาม Role
      const role = user.role || "resident";
      if (role === "admin") {
        router.push("/admin/dashboard");
      } else if (role === "staff") {
        router.push("/staff/dashboard");
      } else {
        router.push("/resident/dashboard");
      }

      router.refresh();
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo Section */}
        <div className="logo-section">
          <div className="logo-text">
            <div className="logo-divider-top"></div>
            <span className="logo-sena">SENA</span>
            <h1 className="logo-grand-home">GRAND HOME</h1>
            <span className="logo-location">Rangsit - Tiwanon</span>
          </div>
          <p className="logo-description">
            ระบบจัดการรับเรื่องร้องเรียนและติดตามปัญหานิติบุคคล
          </p>
        </div>

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

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Username Field */}
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              ชื่อผู้ใช้งาน
            </label>
            <div className="input-wrapper">
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="กรอกชื่อผู้ใช้งาน"
                className="form-input"
                autoComplete="username"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              รหัสผ่าน
            </label>
            <div className="input-wrapper password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="form-input"
                autoComplete="current-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                disabled={loading}
              >
                {showPassword ? (
                  /* Eye Open Icon */
                  <svg
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
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  /* Eye Off Icon */
                  <svg
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
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="form-options">
            <label className="remember-me" htmlFor="remember">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="remember-checkbox"
                disabled={loading}
              />
              <span className="remember-text">จดจำไว้ในระบบ</span>
            </label>
            <Link href="/forgot-password" className="forgot-password">
              ลืมรหัสผ่าน?
            </Link>
          </div>

          <button
            type="submit"
            id="login-button"
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <span className="login-loading">
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
                กำลังเข้าสู่ระบบ...
              </span>
            ) : (
              "เข้าสู่ระบบ"
            )}
          </button>

          {/* Register Link */}
          <div className="register-link-container">
            <span className="register-text">ไม่มีบัญชีใช่ไหม? </span>
            <Link href="/register" className="register-link">
              สมัครสมาชิก
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
