"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

const API_URL = API_BASE_URL;

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
      const res = await fetch(`${API_URL}/auth/forgot-password`, { credentials: "include",
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
      const res = await fetch(`${API_URL}/auth/reset-password`, { credentials: "include",
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
    <div className="flex items-center justify-center min-h-screen bg-[#f3f3f3] p-4">
      <div className="bg-white rounded-2xl p-8 sm:px-10 sm:py-12 w-full max-w-[480px] shadow-[0_2px_16px_rgba(0,0,0,0.06)] animate-[cardFadeIn_0.4s_ease-out]">
        {/* Logo Section */}
        <div className="text-center mb-7">
          <div className="flex flex-col items-center gap-0">
            <div className="w-[160px] sm:w-[200px] h-[1.5px] bg-[#1a1a2e] mb-1.5"></div>
            <span className="font-['Times_New_Roman',_'Georgia',_serif] text-sm sm:text-base font-normal tracking-[6px] text-[#1a1a2e] uppercase">SENA</span>
            <h1 className="font-['Times_New_Roman',_'Georgia',_serif] text-[26px] sm:text-[32px] font-bold tracking-[4px] text-[#1a1a2e] m-0 leading-[1.2]">GRAND HOME</h1>
            <span className="font-['Times_New_Roman',_'Georgia',_serif] text-sm font-normal tracking-[2px] text-[#1a1a2e] mt-0.5">Rangsit - Tiwanon</span>
          </div>
        </div>

        {/* Page Title */}
        <h2 className="text-xl sm:text-[22px] font-bold text-[#1a1a2e] text-center m-0 mb-1.5">
          {step === 4 ? "สำเร็จ!" : "ลืมรหัสผ่าน?"}
        </h2>
        <p className="text-[13px] text-[#888] text-center m-0 mb-6 leading-relaxed">
          {step === 1 && "กรอกชื่อผู้ใช้งานของคุณเพื่อเริ่มกระบวนการ"}
          {step === 2 && "กรอกชื่อ-นามสกุล ที่ใช้ลงทะเบียนเพื่อยืนยันตัวตน"}
          {step === 3 && "กำหนดรหัสผ่านใหม่สำหรับบัญชีของคุณ"}
          {step === 4 && "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว"}
        </p>

        {/* Step Indicator */}
        {step < 4 && (
          <div className="flex items-center justify-center gap-0 mb-7 px-0 sm:px-2.5">
            {stepLabels.map((label, index) => (
              <div key={index} className="flex items-center gap-0">
                <div
                  className={`w-[26px] h-[26px] sm:w-[30px] sm:h-[30px] rounded-full flex items-center justify-center text-[11px] sm:text-[13px] font-semibold border-2 transition-all duration-300 shrink-0 ${
                    index + 1 < step
                      ? "border-[#16a34a] text-white bg-[#16a34a]"
                      : index + 1 === step
                      ? "border-[#1400ff] text-[#1400ff] bg-[#f0edff] shadow-[0_0_0_4px_rgba(20,0,255,0.08)]"
                      : "border-[#e0e0e0] text-[#bbb] bg-white"
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
                  className={`text-[10px] sm:text-[11px] ml-1 sm:ml-1.5 whitespace-nowrap font-medium transition-colors duration-300 ${
                    index + 1 <= step ? "text-[#1a1a2e]" : "text-[#bbb]"
                  }`}
                >
                  {label}
                </span>
                {index < stepLabels.length - 1 && (
                  <div
                    className={`w-[20px] sm:w-[32px] h-[2px] mx-1 sm:mx-2 transition-colors duration-300 shrink-0 ${
                      index + 1 < step ? "bg-[#16a34a]" : "bg-[#e0e0e0]"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[13px] mb-1 animate-[shake_0.3s_ease-in-out]">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
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
            className="flex flex-col gap-4.5 animate-[stepFadeIn_0.35s_ease-out]"
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="username" className="text-sm font-medium text-[#1a1a2e]">
                ชื่อผู้ใช้งาน
              </label>
              <div className="relative group/input">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999] flex items-center pointer-events-none transition-colors duration-200 group-focus-within/input:text-[#3b5bff]">
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
                  className="w-full pl-11 pr-4 py-3.5 border border-[#e0e0e0] rounded-lg text-[15px] text-[#333] bg-white outline-none transition-all duration-200 placeholder:text-[#999] focus:border-[#3b5bff] focus:ring-[3px] focus:ring-[#3b5bff]/10 disabled:bg-[#f5f5f5] disabled:cursor-not-allowed"
                  autoComplete="username"
                  required
                  autoFocus
                />
              </div>
            </div>

            <button type="submit" id="step1-next-button" className="w-full mt-2 p-4 bg-[#1400ff] text-white text-base font-semibold border-none rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 hover:bg-[#1000d6] hover:shadow-[0_4px_16px_rgba(20,0,255,0.3)] active:scale-[0.98]">
              ถัดไป
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </form>
        )}

        {/* ===== STEP 2: Verify Identity ===== */}
        {step === 2 && (
          <form onSubmit={handleVerifyIdentity} className="flex flex-col gap-4.5 animate-[stepFadeIn_0.35s_ease-out]">
            <div className="flex items-center gap-2.5 px-4 py-3 bg-[#f0edff] border border-[#ddd8ff] rounded-lg text-[#4338ca] text-[13px] leading-relaxed">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="9" cy="10" r="2" />
                <path d="M15 8h2" />
                <path d="M15 12h2" />
                <path d="M7 16h10" />
              </svg>
              <span>กรอกข้อมูลให้ตรงกับที่ลงทะเบียนไว้ในระบบ</span>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="firstName" className="text-sm font-medium text-[#1a1a2e]">
                ชื่อจริง
              </label>
              <div className="relative">
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="กรอกชื่อจริง"
                  className="w-full px-4 py-3.5 border border-[#e0e0e0] rounded-lg text-[15px] text-[#333] bg-white outline-none transition-all duration-200 placeholder:text-[#999] focus:border-[#3b5bff] focus:ring-[3px] focus:ring-[#3b5bff]/10 disabled:bg-[#f5f5f5] disabled:cursor-not-allowed"
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="lastName" className="text-sm font-medium text-[#1a1a2e]">
                นามสกุล
              </label>
              <div className="relative">
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="กรอกนามสกุล"
                  className="w-full px-4 py-3.5 border border-[#e0e0e0] rounded-lg text-[15px] text-[#333] bg-white outline-none transition-all duration-200 placeholder:text-[#999] focus:border-[#3b5bff] focus:ring-[3px] focus:ring-[#3b5bff]/10 disabled:bg-[#f5f5f5] disabled:cursor-not-allowed"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-1">
              <button
                type="button"
                className="order-2 sm:order-1 w-full sm:w-auto flex items-center justify-center gap-1 px-4.5 py-3.5 bg-[#f5f5f5] text-[#555] text-sm font-medium border border-[#e0e0e0] rounded-xl cursor-pointer transition-all duration-200 whitespace-nowrap hover:bg-[#eee] hover:border-[#ccc] disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="order-1 sm:order-2 flex-1 w-full p-3.5 bg-[#1400ff] text-white text-base font-semibold border-none rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 hover:bg-[#1000d6] hover:shadow-[0_4px_16px_rgba(20,0,255,0.3)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:hover:bg-[#1400ff] disabled:hover:shadow-none"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4.5 animate-[stepFadeIn_0.35s_ease-out]">
            <div className="flex flex-col gap-2">
              <label htmlFor="newPassword" className="text-sm font-medium text-[#1a1a2e]">
                รหัสผ่านใหม่
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัว)"
                  className="w-full pl-4 pr-12 py-3.5 border border-[#e0e0e0] rounded-lg text-[15px] text-[#333] bg-white outline-none transition-all duration-200 placeholder:text-[#999] focus:border-[#3b5bff] focus:ring-[3px] focus:ring-[#3b5bff]/10 disabled:bg-[#f5f5f5] disabled:cursor-not-allowed"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[#888] p-1 flex items-center justify-center transition-colors duration-200 hover:text-[#333]"
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
                <div className="flex items-center gap-2.5">
                  <div className={`h-1 rounded-sm flex-1 transition-all duration-300 ${
                    newPassword.length >= 8 ? "bg-gradient-to-r from-[#16a34a] to-[#16a34a]" :
                    newPassword.length >= 6 ? "bg-gradient-to-r from-[#f59e0b] via-[#f59e0b] via-66% to-[#e0e0e0] to-66%" : "bg-gradient-to-r from-[#ef4444] via-[#ef4444] via-33% to-[#e0e0e0] to-33%"
                  }`} />
                  <span className="text-[11px] text-[#888] whitespace-nowrap">
                    {newPassword.length >= 8 ? "รหัสผ่านแข็งแรง" :
                     newPassword.length >= 6 ? "รหัสผ่านปานกลาง" : "รหัสผ่านอ่อนแอ"}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-[#1a1a2e]">
                ยืนยันรหัสผ่านใหม่
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  className="w-full pl-4 pr-12 py-3.5 border border-[#e0e0e0] rounded-lg text-[15px] text-[#333] bg-white outline-none transition-all duration-200 placeholder:text-[#999] focus:border-[#3b5bff] focus:ring-[3px] focus:ring-[#3b5bff]/10 disabled:bg-[#f5f5f5] disabled:cursor-not-allowed"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[#888] p-1 flex items-center justify-center transition-colors duration-200 hover:text-[#333]"
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
                <div className={`flex items-center gap-1.5 text-xs animate-[fadeIn_0.2s_ease] ${newPassword === confirmPassword ? "text-[#16a34a]" : "text-[#ef4444]"}`}>
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
              className="w-full mt-2 p-4 bg-[#1400ff] text-white text-base font-semibold border-none rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 hover:bg-[#1000d6] hover:shadow-[0_4px_16px_rgba(20,0,255,0.3)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:hover:bg-[#1400ff] disabled:hover:shadow-none"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          <div className="flex flex-col items-center gap-5 py-4 animate-[successPop_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)]">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#dcfce7] to-[#bbf7d0] flex items-center justify-center text-[#16a34a] animate-[iconPulse_2s_ease-in-out_infinite]">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <p className="text-sm text-[#555] text-center leading-[1.8] m-0">
              รหัสผ่านของคุณได้ถูกเปลี่ยนเรียบร้อยแล้ว
              <br />
              กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่
            </p>
            <button
              className="w-full p-4 bg-[#1400ff] text-white text-base font-semibold border-none rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 hover:bg-[#1000d6] hover:shadow-[0_4px_16px_rgba(20,0,255,0.3)] active:scale-[0.98]"
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
          <div className="flex items-center justify-center mt-6 gap-1.5">
            <Link href="/login" className="text-[13px] text-[#555] no-underline flex items-center gap-1.5 transition-colors duration-200 hover:text-[#3b5bff]">
              <span className="flex items-center">
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
