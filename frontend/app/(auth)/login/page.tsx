"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    <div className="flex items-center justify-center min-h-screen bg-[#f3f3f3] p-4 sm:p-8 font-sans">
      <div className="flex w-full max-w-[1200px] min-h-[600px] bg-white rounded-3xl shadow-[0_20px_60px_rgb(0,0,0,0.08)] overflow-hidden">
        {/* ===== Left Side (Image) ===== */}
        <div className="hidden lg:flex lg:w-[55%] relative bg-[#1a1a2e]">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-[35%_center] bg-no-repeat transition-transform duration-1000 hover:scale-105"
            style={{ backgroundImage: "url('/login-bg.png')" }}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e]/40 to-transparent" />
        </div>

        {/* ===== Right Side (Login Form) ===== */}
        <div className="w-full lg:w-[45%] flex items-center justify-center p-8 sm:p-14 bg-white">
          <div className="w-full max-w-[420px]">
            {/* Logo Section */}
            <div className="text-center mb-8">
              <div className="flex flex-col items-center w-full max-w-[280px] sm:max-w-[320px] mx-auto">
                <span className="font-['Times_New_Roman',_'Georgia',_serif] text-xl sm:text-2xl font-normal tracking-[2px] text-[#111] uppercase pb-1">SENA</span>
                <div className="w-full h-[1.5px] bg-[#111] mb-1.5"></div>
                <h1 className="font-['Times_New_Roman',_'Georgia',_serif] text-[32px] sm:text-[42px] font-normal tracking-[1px] text-[#111] m-0 leading-none">GRAND HOME</h1>
                <span className="font-['Times_New_Roman',_'Georgia',_serif] text-[13px] sm:text-[15px] font-normal tracking-[2px] text-[#333] mt-2">Rangsit - Tiwanon</span>
              </div>
              <p className="text-[13px] text-[#555] mt-3 leading-relaxed">
                ระบบจัดการรับเรื่องร้องเรียนและติดตามปัญหานิติบุคคล
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[13px] mb-1 transition-all">
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
                  className="shrink-0"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Username Field */}
              <div className="flex flex-col gap-2">
                <label htmlFor="username" className="text-sm font-medium text-[#1a1a2e]">
                  ชื่อผู้ใช้งาน
                </label>
                <div className="relative">
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="กรอกชื่อผู้ใช้งาน"
                    className="w-full px-4 py-3.5 border border-[#e0e0e0] rounded-lg text-[15px] text-[#333] bg-white outline-none transition-all duration-200 placeholder:text-[#999] focus:border-[#3b5bff] focus:ring-[3px] focus:ring-[#3b5bff]/10 disabled:bg-[#f5f5f5] disabled:cursor-not-allowed"
                    autoComplete="username"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-sm font-medium text-[#1a1a2e]">
                  รหัสผ่าน
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="w-full pl-4 pr-12 py-3.5 border border-[#e0e0e0] rounded-lg text-[15px] text-[#333] bg-white outline-none transition-all duration-200 placeholder:text-[#999] focus:border-[#3b5bff] focus:ring-[3px] focus:ring-[#3b5bff]/10 disabled:bg-[#f5f5f5] disabled:cursor-not-allowed"
                    autoComplete="current-password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[#888] p-1 flex items-center justify-center transition-colors duration-200 hover:text-[#333]"
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
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group" htmlFor="remember">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-[18px] h-[18px] border-[1.5px] border-[#d0d0d0] rounded cursor-pointer accent-[#3b5bff]"
                    disabled={loading}
                  />
                  <span className="text-[13px] text-[#555] select-none">จดจำไว้ในระบบ</span>
                </label>
                <Link href="/forgot-password" className="text-[13px] text-[#555] no-underline transition-colors duration-200 hover:text-[#3b5bff] hover:underline">
                  ลืมรหัสผ่าน?
                </Link>
              </div>

              <button
                type="submit"
                id="login-button"
                className="w-full p-4 bg-[#1400ff] text-white text-base font-semibold border-none rounded-xl cursor-pointer transition-all duration-200 mt-2 hover:bg-[#1000d6] hover:shadow-[0_4px_16px_rgba(20,0,255,0.3)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:hover:bg-[#1400ff] disabled:hover:shadow-none"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin"
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
              <div className="text-center mt-4 text-sm">
                <span className="text-[#555]">ไม่มีบัญชีใช่ไหม? </span>
                <Link href="/register" className="text-[#3b5bff] no-underline font-medium transition-colors duration-200 hover:text-[#1400ff] hover:underline">
                  สมัครสมาชิก
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}