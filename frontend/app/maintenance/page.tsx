import React from 'react';
import Link from 'next/link';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div className="flex justify-center">
          <div className="relative">
            <svg className="w-20 h-20 text-blue-600 animate-[spin_4s_linear_infinite]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <svg className="w-10 h-10 text-yellow-500 absolute bottom-0 right-0 animate-pulse" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
          </div>
        </div>
        
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            ระบบกำลังปิดปรับปรุง
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            ขออภัยในความไม่สะดวก ขณะนี้เรากำลังทำการอัปเดตระบบเพื่อให้มีประสิทธิภาพดียิ่งขึ้น กรุณาเข้าใช้งานใหม่อีกครั้งในภายหลัง
          </p>
        </div>
        
        <div className="pt-6">
          <Link 
            href="/login" 
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 w-full"
          >
            กลับสู่หน้าเข้าสู่ระบบ
          </Link>
        </div>
        
        <p className="mt-4 text-sm text-gray-400">
          หากมีเรื่องเร่งด่วน กรุณาติดต่อฝ่ายนิติบุคคล
        </p>
      </div>
    </div>
  );
}
