"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

export default function SystemSettingsPage() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [updatedAt, setUpdatedAt] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get("/admin/settings");
      if (res.data.success) {
        setIsMaintenance(res.data.data.is_maintenance || false);
        if (res.data.data.updated_at) {
          setUpdatedAt(new Date(res.data.data.updated_at).toLocaleString('th-TH'));
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      showMessage("ไม่สามารถดึงข้อมูลการตั้งค่าได้", "error");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  const handleToggleMaintenance = async () => {
    setSaving(true);
    const newValue = !isMaintenance;
    
    try {
      const res = await api.put("/admin/settings", {
        is_maintenance: newValue
      });

      if (res.data.success) {
        setIsMaintenance(newValue);
        setUpdatedAt(new Date().toLocaleString('th-TH'));
        showMessage("บันทึกการตั้งค่าระบบสำเร็จ", "success");
      } else {
        showMessage("เกิดข้อผิดพลาดในการบันทึก", "error");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      showMessage("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              สถานะระบบและการให้บริการ
            </h2>
            <p className="text-gray-500 text-sm mt-1">ตั้งค่าเปิดหรือปิดการเข้าถึงระบบสำหรับผู้ใช้งานทั่วไป</p>
          </div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              )}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 md:p-6 bg-gray-50 rounded-xl border border-gray-100 gap-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">โหมดปิดปรับปรุงระบบ (Maintenance Mode)</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-lg">
                เมื่อเปิดใช้งาน ลูกบ้านและนิติบุคคลจะไม่สามารถเข้าสู่ระบบได้ จะแสดงหน้าจอแจ้งเตือนการปิดปรับปรุงระบบแทน (ยกเว้นผู้ดูแลระบบ)
              </p>
              {updatedAt && (
                <div className="mt-3 text-xs text-gray-400 font-medium">
                  อัปเดตล่าสุด: {updatedAt}
                </div>
              )}
            </div>

            <div className="flex items-center shrink-0">
              <button
                type="button"
                role="switch"
                aria-checked={isMaintenance}
                disabled={saving}
                onClick={handleToggleMaintenance}
                className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                  isMaintenance ? 'bg-red-500' : 'bg-gray-300'
                } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="sr-only">เปิดโหมดปรับปรุงระบบ</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isMaintenance ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={`ml-4 text-sm font-bold min-w-[60px] ${isMaintenance ? 'text-red-500' : 'text-gray-500'}`}>
                {isMaintenance ? 'เปิดอยู่' : 'ปิดอยู่'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
