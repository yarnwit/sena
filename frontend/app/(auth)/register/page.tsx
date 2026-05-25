"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import "./register.css";

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
    <div className="register-page">
      <div className="register-card">
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

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="register-form">
          {/* First Name Field */}
          <div className="form-group">
            <label htmlFor="firstName" className="form-label">
              ชื่อ
            </label>
            <div className="input-wrapper">
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="กรอกชื่อ"
                className="form-input"
                autoComplete="given-name"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Last Name Field */}
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
                autoComplete="family-name"
                required
                disabled={loading}
              />
            </div>
          </div>

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

          {/* House No Field */}
          <div className="form-group">
            <label htmlFor="houseNo" className="form-label">
              บ้านเลขที่
            </label>
            <div className="input-wrapper">
              <input
                id="houseNo"
                type="text"
                value={houseNo}
                onChange={(e) => setHouseNo(e.target.value)}
                placeholder="กรอกบ้านเลขที่"
                className="form-input"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Phase Field */}
          <div className="form-group">
            <label htmlFor="phase" className="form-label">
              เฟส
            </label>
            <div className="input-wrapper">
              <input
                id="phase"
                type="text"
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
                placeholder="กรอกเฟส (เช่น 1, 2, 3)"
                className="form-input"
                disabled={loading}
              />
            </div>
          </div>

          {/* Soi Field */}
          <div className="form-group">
            <label htmlFor="soi" className="form-label">
              ซอย
            </label>
            <div className="input-wrapper">
              <input
                id="soi"
                type="text"
                value={soi}
                onChange={(e) => setSoi(e.target.value)}
                placeholder="กรอกซอย"
                className="form-input"
                disabled={loading}
              />
            </div>
          </div>

          {/* Phone Number Field */}
          <div className="form-group">
            <label htmlFor="phoneNumber" className="form-label">
              เบอร์โทรศัพท์
            </label>
            <div className="input-wrapper">
              <input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="กรอกเบอร์โทรศัพท์"
                className="form-input"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Resident Type Field */}
          <div className="form-group">
            <label htmlFor="residentType" className="form-label">
              ประเภทผู้อยู่อาศัย
            </label>
            <div className="input-wrapper">
              <select
                id="residentType"
                value={residentType}
                onChange={(e) => setResidentType(e.target.value)}
                className="form-input"
                style={{ appearance: "auto", cursor: "pointer" }}
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
                autoComplete="new-password"
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
                {showPassword ? <EyeOpenIcon /> : <EyeOffIcon />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              ยืนยันรหัสผ่าน
            </label>
            <div className="input-wrapper password-wrapper">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••"
                className="form-input"
                autoComplete="new-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle"
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
            className="register-button"
            disabled={loading}
          >
            {loading ? (
              <span className="register-loading">
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
                กำลังลงทะเบียน...
              </span>
            ) : (
              "ลงทะเบียน"
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="login-link-section">
          มีบัญชีอยู่แล้ว?{" "}
          <Link href="/login" className="login-link">
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  );
}
