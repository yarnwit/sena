"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface ComplaintDetail {
  complaint_id: number;
  ticket_no: string;
  subject: string;
  description: string;
  reported_date: string;
  location_written: string | null;
  soi: string | null;
  house_no: string;
  first_name: string;
  last_name: string;
  phone_number: string;
}

function WorkOrderPrintContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [data, setData] = useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("ไม่พบรหัสอ้างอิง");
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      try {
        const res = await api.get(`/complaints/staff/${id}`);
        if (res.data.success && res.data.data) {
          setData(res.data.data);
          // Wait a brief moment for rendering, then open print dialog
          setTimeout(() => {
            window.print();
          }, 500);
        } else {
          setError("ไม่สามารถโหลดข้อมูลได้");
        }
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      }
      setLoading(false);
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#d4a574] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button 
            onClick={() => window.close()}
            className="w-full py-3 bg-gray-800 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            ปิดหน้าต่างนี้
          </button>
        </div>
      </div>
    );
  }

  const printDate = new Date().toLocaleDateString("th-TH", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
  
  const reportDate = new Date(data.reported_date).toLocaleDateString("th-TH", {
    year: "numeric", month: "long", day: "numeric"
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @page { size: A4; margin: 15mm; }
        @media print {
          body { -webkit-print-color-adjust: exact; background: white; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
        }
        body { background: #f3f4f6; }
        .a4-container {
          width: 210mm;
          min-height: 297mm;
          margin: 20mm auto;
          background: white;
          padding: 20mm;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        @media print {
          .a4-container {
            width: 100%;
            min-height: auto;
            margin: 0;
            padding: 0;
            box-shadow: none;
          }
        }
      `}} />

      {/* Floating Toolbar (Not visible in print) */}
      <div className="fixed top-4 right-4 flex gap-2 no-print z-50">
        <button 
          onClick={() => window.print()} 
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 font-medium text-sm transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          พิมพ์
        </button>
        <button 
          onClick={() => window.close()} 
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg shadow-lg hover:bg-gray-50 font-medium text-sm transition-all"
        >
          ปิด
        </button>
      </div>

      <div className="a4-container relative">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 m-0 mb-1">ใบแจ้งซ่อม (Work Order)</h1>
            <p className="text-gray-600 m-0">นิติบุคคลอาคารชุด / หมู่บ้านจัดสรร</p>
          </div>
          <div className="text-right">
            <div className="inline-block border-2 border-gray-800 rounded px-4 py-2 bg-gray-50">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold m-0 mb-1">เลขที่ใบงาน</p>
              <p className="text-xl font-bold text-[#d4a574] m-0">{data.ticket_no || `#${data.complaint_id}`}</p>
            </div>
          </div>
        </div>

        {/* Section 1: Customer Info */}
        <div className="mb-8">
          <div className="bg-gray-100 px-4 py-2 font-bold text-gray-800 mb-4 border-l-4 border-[#d4a574]">1. ข้อมูลผู้แจ้ง และ สถานที่</div>
          <div className="grid grid-cols-2 gap-y-4 gap-x-8 px-4 text-sm">
            <div>
              <span className="text-gray-500 block mb-1">ชื่อ-นามสกุล:</span>
              <strong className="text-gray-900 text-base">{data.first_name} {data.last_name}</strong>
            </div>
            <div>
              <span className="text-gray-500 block mb-1">เบอร์โทรศัพท์ติดต่อ:</span>
              <strong className="text-gray-900 text-base">{data.phone_number || "-"}</strong>
            </div>
            <div>
              <span className="text-gray-500 block mb-1">บ้านเลขที่ / แปลง:</span>
              <strong className="text-gray-900 text-base">{data.house_no || "-"}</strong>
            </div>
            <div>
              <span className="text-gray-500 block mb-1">วันที่แจ้งเรื่อง:</span>
              <strong className="text-gray-900 text-base">{reportDate}</strong>
            </div>
          </div>
        </div>

        {/* Section 2: Problem Details */}
        <div className="mb-8">
          <div className="bg-gray-100 px-4 py-2 font-bold text-gray-800 mb-4 border-l-4 border-[#d4a574]">2. รายละเอียดปัญหา</div>
          <div className="px-4 text-sm space-y-4">
            <div>
              <span className="text-gray-500 block mb-1">หัวข้อเรื่อง:</span>
              <strong className="text-gray-900 text-lg">{data.subject}</strong>
            </div>
            <div>
              <span className="text-gray-500 block mb-1">จุดที่เกิดเหตุ / สถานที่อ้างอิง:</span>
              <strong className="text-gray-900 text-base">{data.location_written || data.soi || "ไม่ระบุ"}</strong>
            </div>
            <div>
              <span className="text-gray-500 block mb-2">รายละเอียดเพิ่มเติม:</span>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded min-h-[100px] whitespace-pre-wrap text-gray-800 leading-relaxed">
                {data.description}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: For Technician (Blank lines to fill) */}
        <div className="mb-8">
          <div className="bg-gray-100 px-4 py-2 font-bold text-gray-800 mb-4 border-l-4 border-[#d4a574]">3. ส่วนของช่างผู้ดำเนินการ (สำหรับบันทึกหน้างาน)</div>
          <div className="px-4 text-sm space-y-6 mt-6">
            <div className="flex items-end">
              <span className="text-gray-700 w-32 shrink-0">สาเหตุของปัญหา :</span>
              <div className="flex-1 border-b border-dotted border-gray-400"></div>
            </div>
            <div className="flex items-end">
              <span className="text-gray-700 w-32 shrink-0">วิธีแก้ไข :</span>
              <div className="flex-1 border-b border-dotted border-gray-400"></div>
            </div>
            <div className="flex items-end">
              <div className="flex-1 border-b border-dotted border-gray-400"></div>
            </div>
            <div className="flex items-end">
              <span className="text-gray-700 w-32 shrink-0">อะไหล่ที่เบิก/ใช้ :</span>
              <div className="flex-1 border-b border-dotted border-gray-400"></div>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-16 pt-8 border-t border-gray-200 grid grid-cols-2 gap-16 px-8">
          <div className="text-center">
            <div className="border-b border-gray-400 w-full mb-3"></div>
            <p className="text-sm font-semibold text-gray-800 mb-1">ผู้ปฏิบัติงาน / ช่าง</p>
            <p className="text-xs text-gray-500">วันที่ ______/______/______</p>
          </div>
          <div className="text-center">
            <div className="border-b border-gray-400 w-full mb-3"></div>
            <p className="text-sm font-semibold text-gray-800 mb-1">ผู้ตรวจสอบ / ลูกบ้านรับมอบงาน</p>
            <p className="text-xs text-gray-500">วันที่ ______/______/______</p>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-10 left-10 right-10 text-center text-xs text-gray-400 border-t border-gray-100 pt-4">
          พิมพ์เมื่อ: {printDate} | ระบบจัดการนิติบุคคลอัจฉริยะ (SENA)
        </div>
      </div>
    </>
  );
}

export default function WorkOrderPrintPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#d4a574] rounded-full animate-spin"></div>
      </div>
    }>
      <WorkOrderPrintContent />
    </Suspense>
  );
}
