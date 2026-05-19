"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Resident {
  resident_id: number;
  house_no: string;
  phone_number: string;
  first_name: string;
  last_name: string;
}

const intakeChannelOptions = [
  { value: "", label: "-- เลือกช่องทาง --" },
  { value: "walk_in", label: "เดินเข้ามาแจ้ง" },
  { value: "phone", label: "โทรศัพท์" },
  { value: "line", label: "LINE" },
  { value: "email", label: "อีเมล" },
];

export default function StaffNewComplaintPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Tab: "select" = เลือกจากระบบ, "manual" = กรอกเอง
  const [mode, setMode] = useState<"select" | "manual">("select");

  // Mode: select
  const [residents, setResidents] = useState<Resident[]>([]);
  const [selectedResidentId, setSelectedResidentId] = useState<number | null>(null);
  const [searchResident, setSearchResident] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const selectedResident = residents.find(r => r.resident_id === selectedResidentId) || null;

  // Mode: manual
  const [manualFirstName, setManualFirstName] = useState("");
  const [manualLastName, setManualLastName] = useState("");
  const [manualHouseNo, setManualHouseNo] = useState("");
  const [manualPhone, setManualPhone] = useState("");

  // Complaint form
  const [form, setForm] = useState({
    subject: "", description: "", location_written: "",
    soi: "", phase: "", intake_channel: "walk_in",
    reported_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const fetchResidents = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) { setPageLoading(false); return; }
        const res = await fetch(`${API_URL}/complaints/residents-list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success && json.data) setResidents(json.data);
      } catch { /* fallback */ }
      setPageLoading(false);
    };
    fetchResidents();
  }, []);

  const filteredResidents = residents.filter(r => {
    if (!searchResident) return true;
    const q = searchResident.toLowerCase();
    return (r.house_no?.toLowerCase().includes(q)) || (r.first_name?.toLowerCase().includes(q)) || (r.last_name?.toLowerCase().includes(q));
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "select" && !selectedResidentId) { setError("กรุณาเลือกลูกบ้าน"); return; }
    if (mode === "manual" && (!manualFirstName || !manualLastName || !manualHouseNo)) { setError("กรุณากรอกชื่อ นามสกุล และบ้านเลขที่"); return; }
    if (!form.subject || !form.description) { setError("กรุณากรอกหัวข้อและรายละเอียด"); return; }
    setShowConfirmModal(true);
  };

  const executeSubmit = async () => {
    setShowConfirmModal(false);
    setError(""); setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) { setError("กรุณาเข้าสู่ระบบก่อน"); setLoading(false); return; }

      const body: Record<string, unknown> = {
        subject: form.subject, description: form.description,
        location_written: form.location_written || null, soi: form.soi || null,
        phase: form.phase || null, intake_channel: form.intake_channel || null,
        reported_date: form.reported_date || new Date().toISOString(),
      };

      if (mode === "select") {
        body.resident_id = selectedResidentId;
      } else {
        body.manual_name = `${manualFirstName} ${manualLastName}`;
        body.manual_house_no = manualHouseNo;
        body.manual_phone = manualPhone || null;
      }

      const res = await fetch(`${API_URL}/complaints/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json.success) { setError(json.message || "เกิดข้อผิดพลาด"); setLoading(false); return; }
      setSuccess(true);
      setTimeout(() => router.push("/staff/complaints"), 2000);
    } catch { setError("เกิดข้อผิดพลาด"); } finally { setLoading(false); }
  };

  const inp = "w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50/30 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-100 disabled:opacity-50";
  const ro = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600 outline-none cursor-not-allowed";
  const lbl = "block text-sm font-medium text-gray-600 mb-1.5";

  if (pageLoading) return <div className="flex items-center justify-center py-32"><div className="w-10 h-10 border-3 border-gray-200 border-t-[#d4a574] rounded-full animate-spin" /></div>;

  const confirmLabel = mode === "select"
    ? `${selectedResident?.first_name} ${selectedResident?.last_name} (บ้าน ${selectedResident?.house_no})`
    : `${manualFirstName} ${manualLastName} (บ้าน ${manualHouseNo})`;

  return (
    <div className="max-w-3xl mx-auto">
      {success && <div className="mb-6 flex items-center gap-3 px-5 py-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm font-medium">✅ ส่งเรื่องร้องเรียนสำเร็จ!</div>}
      {error && <div className="mb-6 flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-medium">❌ {error}</div>}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-4 px-6 sm:px-8 py-6 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
            <svg className="w-7 h-7 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-800 m-0">สร้างรายการร้องเรียนใหม่</h1>
            <p className="text-sm text-gray-500 mt-1 m-0">เลือกลูกบ้านจากระบบ หรือกรอกข้อมูลเอง</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          {/* ===== Section 1: ข้อมูลผู้ร้อง ===== */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-4">1. ข้อมูลผู้ร้องเรียน</h2>

            {/* Mode Tabs */}
            <div className="flex gap-2 mb-5">
              <button type="button" onClick={() => { setMode("select"); setError(""); }}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-all cursor-pointer ${mode === "select" ? "bg-amber-500 text-white border-amber-500" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
                เลือกจากระบบ
              </button>
              <button type="button" onClick={() => { setMode("manual"); setError(""); }}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-all cursor-pointer ${mode === "manual" ? "bg-amber-500 text-white border-amber-500" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
                กรอกข้อมูลเอง
              </button>
            </div>

            {mode === "select" ? (
              <>
                {/* Search */}
                <div className="mb-4 relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  <input type="text" value={searchResident} onChange={(e) => setSearchResident(e.target.value)}
                    placeholder="พิมพ์บ้านเลขที่ หรือ ชื่อ-นามสกุล..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-amber-200 bg-amber-50/30 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                    disabled={loading || success} />
                </div>
                {/* Resident List */}
                <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white divide-y divide-gray-50">
                  {filteredResidents.length === 0 ? (
                    <div className="text-center py-6 text-sm text-gray-400">ไม่พบลูกบ้าน</div>
                  ) : filteredResidents.map((r) => (
                    <button key={r.resident_id} type="button" onClick={() => setSelectedResidentId(r.resident_id)} disabled={loading || success}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer border-none ${selectedResidentId === r.resident_id ? "bg-amber-50 ring-1 ring-amber-300" : "bg-white hover:bg-gray-50"}`}>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-semibold text-xs shrink-0">🏠 {r.house_no || "-"}</span>
                      <span className="text-sm text-gray-700 font-medium">{r.first_name} {r.last_name}</span>
                      <span className="text-xs text-gray-400 ml-auto">{r.phone_number || ""}</span>
                      {selectedResidentId === r.resident_id && <span className="text-amber-500 font-bold">✓</span>}
                    </button>
                  ))}
                </div>
                {selectedResident && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div><label className={lbl}>ชื่อจริง</label><input type="text" value={selectedResident.first_name} className={ro} readOnly /></div>
                    <div><label className={lbl}>นามสกุล</label><input type="text" value={selectedResident.last_name} className={ro} readOnly /></div>
                    <div><label className={lbl}>เบอร์โทร</label><input type="text" value={selectedResident.phone_number || "-"} className={ro} readOnly /></div>
                  </div>
                )}
              </>
            ) : (
              /* Manual Input */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className={lbl}>ชื่อจริง <span className="text-red-500">*</span></label>
                  <input type="text" value={manualFirstName} onChange={e => setManualFirstName(e.target.value)} placeholder="ชื่อจริง" className={inp} disabled={loading || success} /></div>
                <div><label className={lbl}>นามสกุล <span className="text-red-500">*</span></label>
                  <input type="text" value={manualLastName} onChange={e => setManualLastName(e.target.value)} placeholder="นามสกุล" className={inp} disabled={loading || success} /></div>
                <div><label className={lbl}>บ้านเลขที่ <span className="text-red-500">*</span></label>
                  <input type="text" value={manualHouseNo} onChange={e => setManualHouseNo(e.target.value)} placeholder="เช่น 88/1" className={inp} disabled={loading || success} /></div>
                <div><label className={lbl}>เบอร์โทรศัพท์</label>
                  <input type="text" value={manualPhone} onChange={e => setManualPhone(e.target.value)} placeholder="08x-xxx-xxxx" className={inp} disabled={loading || success} /></div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100" />

          {/* ===== Section 2: รายละเอียด ===== */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-4">2. ความประสงค์ / รายละเอียดปัญหา</h2>
            <div className="space-y-4">
              <div><label className={lbl}>หัวข้อเรื่องที่ร้องเรียน <span className="text-red-500">*</span></label>
                <input type="text" name="subject" value={form.subject} onChange={handleChange} placeholder="เช่น น้ำรั่วซึม" className={inp} required disabled={loading || success} /></div>
              <div><label className={lbl}>รายละเอียดเพิ่มเติม <span className="text-red-500">*</span></label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="อธิบายรายละเอียดปัญหา..." rows={5} className={`${inp} resize-none`} required disabled={loading || success} /></div>
              <div><label className={lbl}>ไฟล์แนบ</label>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed cursor-pointer transition-all ${file ? "border-green-300 bg-green-50/50" : "border-amber-200 bg-amber-50/20 hover:border-amber-400"}`}
                  onClick={() => !loading && !success && fileInputRef.current?.click()}>
                  <span className="text-sm text-gray-500">{file ? file.name : "📎 แนบไฟล์เอกสาร/ รูปภาพ"}</span>
                  {file && <button type="button" className="ml-auto text-red-400 bg-transparent border-none cursor-pointer" onClick={(e) => { e.stopPropagation(); setFile(null); }}>✕</button>}
                  <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} className="hidden" disabled={loading || success} />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* ===== Section 3: เอกสาร ===== */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-4">3. ข้อมูลเอกสารและการรับเรื่อง</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label className={lbl}>สถานที่รับคำร้อง</label>
                <input type="text" name="location_written" value={form.location_written} onChange={handleChange} placeholder="สำนักงาน" className={inp} disabled={loading || success} /></div>
              <div><label className={lbl}>วันที่</label>
                <input type="date" name="reported_date" value={form.reported_date} onChange={handleChange} className={inp} disabled={loading || success} /></div>
              <div><label className={lbl}>ช่องทางรับเรื่อง</label>
                <select name="intake_channel" value={form.intake_channel} onChange={handleChange} className={inp} disabled={loading || success}>
                  {intakeChannelOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select></div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/staff/complaints" className="px-8 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 no-underline transition-colors">ยกเลิก</Link>
            <button type="submit" className="px-8 py-3 rounded-xl bg-[#d4a574] hover:bg-[#b8865a] text-white text-sm font-medium border-none cursor-pointer transition-colors disabled:opacity-50" disabled={loading || success}>
              {loading ? "กำลังบันทึก..." : "บันทึกคำร้อง"}
            </button>
          </div>
        </form>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">ยืนยันการบันทึก</h3>
            <p className="text-sm text-gray-500 mb-8">สร้างคำร้องให้ <strong className="text-amber-600">{confirmLabel}</strong></p>
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => setShowConfirmModal(false)} className="px-6 py-3.5 border border-gray-200 rounded-2xl text-gray-700 font-bold hover:bg-gray-50 cursor-pointer bg-white">ยกเลิก</button>
              <button type="button" onClick={executeSubmit} className="px-6 py-3.5 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 shadow-lg shadow-green-500/30 cursor-pointer border-none">ยืนยัน</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
