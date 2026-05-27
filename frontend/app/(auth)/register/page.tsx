"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [phase, setPhase] = useState("");
  const [soi, setSoi] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [residentType, setResidentType] = useState("owner");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน กรุณากรอกรหัสผ่านให้ตรงกัน");
      return;
    }

    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setLoading(true);

    try {
      await register({
        password,
        username,
        first_name: firstName,
        last_name: lastName,
        house_no: houseNo,
        phone_number: phoneNumber,
        resident_type: residentType,
        phase: phase || undefined,
        soi: soi || undefined,
      });

      setSuccess("ลงทะเบียนสำเร็จ! กำลังไปหน้าเข้าสู่ระบบ...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "เกิดข้อผิดพลาดในการลงทะเบียน");
    } finally {
      setLoading(false);
    }
  };


  /* Shared eye icons */
  const EyeOpenIcon = () => (
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
  );

  const EyeOffIcon = () => (
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
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f3f3f3] p-4">
      <div className="bg-white rounded-2xl p-8 sm:px-10 sm:py-12 w-full max-w-[460px] shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center gap-0">
            <div className="w-[160px] sm:w-[200px] h-[1.5px] bg-[#1a1a2e] mb-1.5"></div>
            <span className="font-['Times_New_Roman',_'Georgia',_serif] text-sm sm:text-base font-normal tracking-[6px] text-[#1a1a2e] uppercase">SENA</span>
            <h1 className="font-['Times_New_Roman',_'Georgia',_serif] text-[26px] sm:text-[32px] font-bold tracking-[4px] text-[#1a1a2e] m-0 leading-[1.2]">GRAND HOME</h1>
            <span className="font-['Times_New_Roman',_'Georgia',_serif] text-sm font-normal tracking-[2px] text-[#1a1a2e] mt-0.5">Rangsit - Tiwanon</span>
          </div>
          <p className="text-[13px] text-[#555] mt-3 leading-relaxed">
            ระบบจัดการรับเรื่องร้องเรียนและติดตามปัญหานิติบุคคล
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[13px] mb-1 animate-[shake_0.3s_ease-in-out]">
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

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-[13px] mb-1 animate-[fadeIn_0.3s_ease-in-out]">
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
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* First Name Field */}
          <div className="flex flex-col gap-2">
            <label htmlFor="firstName" className="text-sm font-medium text-[#1a1a2e]">
              ชื่อ
            </label>
            <div className="relative">
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="กรอกชื่อ"
                className="w-full px-4 py-3.5 border border-[#e0e0e0] rounded-lg text-[15px] text-[#333] bg-white outline-none transition-all duration-200 placeholder:text-[#999] focus:border-[#3b5bff] focus:ring-[3px] focus:ring-[#3b5bff]/10 disabled:bg-[#f5f5f5] disabled:cursor-not-allowed"
                autoComplete="given-name"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Last Name Field */}
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
                autoComplete="family-name"
                required
                disabled={loading}
              />
            </div>
          </div>

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

          {/* House No Field */}
          <div className="flex flex-col gap-2">
            <label htmlFor="houseNo" className="text-sm font-medium text-[#1a1a2e]">
              บ้านเลขที่
            </label>
            <div className="relative">
              <input
                id="houseNo"
                type="text"
                value={houseNo}
                onChange={(e) => setHouseNo(e.target.value)}
                placeholder="กรอกบ้านเลขที่"
                className="w-full px-4 py-3.5 border border-[#e0e0e0] rounded-lg text-[15px] text-[#333] bg-white outline-none transition-all duration-200 placeholder:text-[#999] focus:border-[#3b5bff] focus:ring-[3px] focus:ring-[#3b5bff]/10 disabled:bg-[#f5f5f5] disabled:cursor-not-allowed"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Phase Field */}
          <div className="flex flex-col gap-2">
            <label htmlFor="phase" className="text-sm font-medium text-[#1a1a2e]">
              เฟส
            </label>
            <div className="relative">
              <input
                id="phase"
                type="text"
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
                placeholder="กรอกเฟส (เช่น 1, 2, 3)"
                className="w-full px-4 py-3.5 border border-[#e0e0e0] rounded-lg text-[15px] text-[#333] bg-white outline-none transition-all duration-200 placeholder:text-[#999] focus:border-[#3b5bff] focus:ring-[3px] focus:ring-[#3b5bff]/10 disabled:bg-[#f5f5f5] disabled:cursor-not-allowed"
                disabled={loading}
              />
            </div>
          </div>

          {/* Soi Field */}
          <div className="flex flex-col gap-2">
            <label htmlFor="soi" className="text-sm font-medium text-[#1a1a2e]">
              ซอย
            </label>
            <div className="relative">
              <input
                id="soi"
                type="text"
                value={soi}
                onChange={(e) => setSoi(e.target.value)}
                placeholder="กรอกซอย"
                className="w-full px-4 py-3.5 border border-[#e0e0e0] rounded-lg text-[15px] text-[#333] bg-white outline-none transition-all duration-200 placeholder:text-[#999] focus:border-[#3b5bff] focus:ring-[3px] focus:ring-[#3b5bff]/10 disabled:bg-[#f5f5f5] disabled:cursor-not-allowed"
                disabled={loading}
              />
            </div>
          </div>

          {/* Phone Number Field */}
          <div className="flex flex-col gap-2">
            <label htmlFor="phoneNumber" className="text-sm font-medium text-[#1a1a2e]">
              เบอร์โทรศัพท์
            </label>
            <div className="relative">
              <input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="กรอกเบอร์โทรศัพท์"
                className="w-full px-4 py-3.5 border border-[#e0e0e0] rounded-lg text-[15px] text-[#333] bg-white outline-none transition-all duration-200 placeholder:text-[#999] focus:border-[#3b5bff] focus:ring-[3px] focus:ring-[#3b5bff]/10 disabled:bg-[#f5f5f5] disabled:cursor-not-allowed"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Resident Type Field */}
          <div className="flex flex-col gap-2">
            <label htmlFor="residentType" className="text-sm font-medium text-[#1a1a2e]">
              ประเภทผู้อยู่อาศัย
            </label>
            <div className="relative">
              <select
                id="residentType"
                value={residentType}
                onChange={(e) => setResidentType(e.target.value)}
                className="w-full px-4 py-3.5 border border-[#e0e0e0] rounded-lg text-[15px] text-[#333] bg-white outline-none transition-all duration-200 placeholder:text-[#999] focus:border-[#3b5bff] focus:ring-[3px] focus:ring-[#3b5bff]/10 disabled:bg-[#f5f5f5] disabled:cursor-not-allowed appearance-auto cursor-pointer"
                required
                disabled={loading}
              >
                <option value="owner">เจ้าของบ้าน</option>
                <option value="tenant">ผู้เช่า</option>
                <option value="family">สมาชิกครอบครัว</option>
              </select>
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
                autoComplete="new-password"
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
                {showPassword ? <EyeOpenIcon /> : <EyeOffIcon />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-[#1a1a2e]">
              ยืนยันรหัสผ่าน
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••"
                className="w-full pl-4 pr-12 py-3.5 border border-[#e0e0e0] rounded-lg text-[15px] text-[#333] bg-white outline-none transition-all duration-200 placeholder:text-[#999] focus:border-[#3b5bff] focus:ring-[3px] focus:ring-[#3b5bff]/10 disabled:bg-[#f5f5f5] disabled:cursor-not-allowed"
                autoComplete="new-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[#888] p-1 flex items-center justify-center transition-colors duration-200 hover:text-[#333]"
                aria-label={showConfirmPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOpenIcon /> : <EyeOffIcon />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="register-button"
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
                กำลังลงทะเบียน...
              </span>
            ) : (
              "ลงทะเบียน"
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-5 text-[13px] text-[#555]">
          มีบัญชีอยู่แล้ว?{" "}
          <Link href="/login" className="text-[#3b5bff] font-medium no-underline transition-colors duration-200 hover:text-[#1000d6] hover:underline">
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  );
}
