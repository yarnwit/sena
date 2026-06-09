"use client";

import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import Link from "next/link";

/* ===== SVG Icons ===== */
const IconTicket = () => (
  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
  </svg>
);
const IconUsers = ({ className }: { className?: string }) => (
  <svg className={`w-8 h-8 ${className || "text-violet-500"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconClock = () => (
  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconRefresh = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);


const InboxIcon = () => (
  <svg className="w-8 h-8 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

const ApprovedIcon = () => (
  <svg className="w-8 h-8 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="m9 15 2 2 4-4" />
  </svg>
);

const InMeetingIcon = () => (
  <svg className="w-8 h-8 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ActivityIcon = () => (
  <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const CrossIcon = () => (
  <svg className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const UserRoleIcon = ({ className }: { className?: string }) => (
  <svg className={`w-8 h-8 ${className || "text-gray-500"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={`w-8 h-8 ${className || "text-gray-400"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={`w-8 h-8 ${className || "text-green-500"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);


/* ===== Helpers ===== */
function actionType(action: string) {
  const a = action.toLowerCase();
  if (a.includes('create') || a.includes('add') || a.includes('insert')) return 'create';
  if (a.includes('update') || a.includes('edit')) return 'update';
  if (a.includes('delete') || a.includes('remove')) return 'delete';
  if (a.includes('login') || a.includes('auth')) return 'login';
  return 'other';
}
/* ===== Main Page ===== */
export default function AdminDashboardPage() {
  const { stats, recentComplaints, recentUsers, activities, isLoading, error, lastUpdated, refetch } = useAdminDashboard();

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="grid gap-5">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-[18px] md:text-2xl font-bold text-gray-900 m-0 tracking-tight">ภาพรวมระบบ</h1>
            <p className="text-sm text-gray-500 mt-1 m-0">
            {lastUpdated
              ? `อัปเดตล่าสุด ${lastUpdated.toLocaleTimeString("th-TH")}`
              : "กำลังโหลดข้อมูล..."}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium cursor-pointer disabled:opacity-60"
        >
          <IconRefresh /> รีเฟรช
        </button>
      </div>

      
      {/* ── Stat Cards (Staff Style + User Stats) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* รวมทั้งหมด */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50"><InboxIcon /></div>
            <div>
              <p className="text-3xl font-bold text-gray-800 m-0 leading-none">{stats?.totalComplaints ?? 0}</p>
              <p className="text-sm text-gray-500 mt-1 m-0">เรื่องทั้งหมด</p>
            </div>
          </div>
        </div>

        {/* รอดำเนินการ */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50"><ClockIcon className="text-gray-400" /></div>
            <div>
              <p className="text-3xl font-bold text-gray-800 m-0 leading-none">{stats?.pendingCount ?? 0}</p>
              <p className="text-sm text-gray-500 mt-1 m-0">รอดำเนินการ</p>
            </div>
          </div>
        </div>

        {/* อนุมัติรับเรื่อง */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-teal-50"><ApprovedIcon /></div>
            <div>
              <p className="text-3xl font-bold text-gray-800 m-0 leading-none">{stats?.approvedCount ?? 0}</p>
              <p className="text-sm text-gray-500 mt-1 m-0">อนุมัติรับเรื่อง</p>
            </div>
          </div>
        </div>

        {/* เข้าที่ประชุม */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-50"><InMeetingIcon /></div>
            <div>
              <p className="text-3xl font-bold text-gray-800 m-0 leading-none">{stats?.inMeetingCount ?? 0}</p>
              <p className="text-sm text-gray-500 mt-1 m-0">เข้าที่ประชุม</p>
            </div>
          </div>
        </div>

        {/* กำลังดำเนินการ */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50"><ActivityIcon /></div>
            <div>
              <p className="text-3xl font-bold text-gray-800 m-0 leading-none">{stats?.inProgressCount ?? 0}</p>
              <p className="text-sm text-gray-500 mt-1 m-0">กำลังดำเนินการ</p>
            </div>
          </div>
        </div>

        {/* แก้ไขแล้ว / ปิด */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50"><CheckCircleIcon /></div>
            <div>
              <p className="text-3xl font-bold text-gray-800 m-0 leading-none">{(stats?.resolvedCount ?? 0) + (stats?.closedCount ?? 0)}</p>
              <p className="text-sm text-gray-500 mt-1 m-0">แก้ไขแล้ว / ปิด</p>
            </div>
          </div>
        </div>

        {/* ปฏิเสธ */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50"><CrossIcon /></div>
            <div>
              <p className="text-3xl font-bold text-gray-800 m-0 leading-none">{stats?.rejectedCount ?? 0}</p>
              <p className="text-sm text-gray-500 mt-1 m-0">ปฏิเสธ</p>
            </div>
          </div>
        </div>

        {/* ผู้ใช้งานทั้งหมด (ลูกบ้าน) */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50"><IconUsers className="text-emerald-500" /></div>
            <div>
              <p className="text-3xl font-bold text-gray-800 m-0 leading-none">{stats?.totalResidents ?? 0}</p>
              <p className="text-sm text-gray-500 mt-1 m-0">ผู้ใช้งานลูกบ้าน</p>
            </div>
          </div>
        </div>

        {/* ผู้ใช้งาน (นิติ) */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50"><UserRoleIcon className="text-indigo-500" /></div>
            <div>
              <p className="text-3xl font-bold text-gray-800 m-0 leading-none">{stats?.totalStaff ?? 0}</p>
              <p className="text-sm text-gray-500 mt-1 m-0">เจ้าหน้าที่นิติบุคคล</p>
            </div>
          </div>
        </div>

        {/* ผู้ใช้งาน (แอดมิน) */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-pink-50"><UserRoleIcon className="text-pink-500" /></div>
            <div>
              <p className="text-3xl font-bold text-gray-800 m-0 leading-none">{stats?.totalAdmins ?? 0}</p>
              <p className="text-sm text-gray-500 mt-1 m-0">ผู้ดูแลระบบ (Admin)</p>
            </div>
          </div>
        </div>
      </div>


      {/* ── Row 2: Recent Users & Audit Activity ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Recent Users */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <p className="text-[15px] font-semibold text-gray-900 m-0">ผู้ใช้งานล่าสุด</p>
              <p className="text-xs text-gray-400 mt-0.5 m-0">5 รายการล่าสุด</p>
            </div>
            <Link href="/admin/users" className="text-[13px] text-violet-600 font-medium no-underline hover:underline">จัดการผู้ใช้ →</Link>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="flex flex-col gap-3">
                <div className="h-[36px] bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-[36px] bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-[36px] bg-gray-100 rounded-lg animate-pulse" />
              </div>
            ) : recentUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 py-5 text-sm text-gray-400 gap-2">ไม่พบข้อมูลผู้ใช้</div>
            ) : (
              recentUsers.map(u => (
                <div key={u.user_id} className="flex items-center gap-2.5 py-3 border-b border-gray-100 last:border-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center text-[13px] font-semibold text-white shrink-0">
                    {u.first_name?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-gray-900">{u.first_name} {u.last_name}</div>
                    <div className="text-xs text-gray-400">@{u.username}</div>
                  </div>
                  <span className={`ml-auto text-[11px] font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${
                    u.role === 'staff' ? 'bg-indigo-100 text-indigo-800' :
                    u.role === 'admin' ? 'bg-pink-100 text-pink-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {u.role === "staff" ? "นิติบุคคล" : u.role === "admin" ? "แอดมิน" : "ลูกบ้าน"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Audit Activity */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <p className="text-[15px] font-semibold text-gray-900 m-0">กิจกรรมล่าสุด</p>
              <p className="text-xs text-gray-400 mt-0.5 m-0">Audit log ล่าสุด</p>
            </div>
            <Link href="/admin/logs" className="text-[13px] text-violet-600 font-medium no-underline hover:underline">ดู Logs →</Link>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="flex flex-col gap-3">
                <div className="h-[40px] bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-[40px] bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-[40px] bg-gray-100 rounded-lg animate-pulse" />
              </div>
            ) : activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 py-5 text-sm text-gray-400 gap-2">ยังไม่มีกิจกรรม</div>
            ) : (
              <div className="flex flex-col gap-0">
                {activities.map((a, idx) => (
                  <div key={a.log_id || a.id || idx} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0 relative">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      actionType(a.action) === 'create' ? 'bg-emerald-500' :
                      actionType(a.action) === 'update' ? 'bg-indigo-500' :
                      actionType(a.action) === 'delete' ? 'bg-rose-500' :
                      actionType(a.action) === 'login' ? 'bg-amber-500' :
                      'bg-gray-500'
                    }`} />
                    <div>
                      <div className="text-[13px] text-gray-700 flex-1 leading-relaxed">
                        <strong className="text-gray-900">{a.user_name ?? "ผู้ใช้"}</strong>{" "}
                        {a.action}
                        {a.details?.from && a.details?.to && (
                          <span className="text-gray-400">
                            {" "}({String(a.details.from)} → {String(a.details.to)})
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{new Date(a.created_at).toLocaleDateString("th-TH")}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Row 3: Recent Complaints ── */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <p className="text-[15px] font-semibold text-gray-900 m-0">เรื่องร้องเรียนล่าสุด</p>
            <p className="text-xs text-gray-400 mt-0.5 m-0">8 รายการล่าสุดในระบบ</p>
          </div>
          <Link href="/admin/reports" className="text-[13px] text-violet-600 font-medium no-underline hover:underline">ดูทั้งหมด →</Link>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="px-6 py-5 flex flex-col gap-3">
              <div className="h-[44px] bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-[44px] bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-[44px] bg-gray-100 rounded-lg animate-pulse" />
            </div>
          ) : recentComplaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 py-10 text-sm text-gray-400 gap-2">ยังไม่มีเรื่องร้องเรียน</div>
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden sm:block">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-50 border-b border-gray-100">เลขที่</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-50 border-b border-gray-100">หัวข้อ</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-50 border-b border-gray-100">ผู้แจ้ง</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-50 border-b border-gray-100">สถานะ</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-50 border-b border-gray-100">วันที่</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentComplaints.map(c => (
                      <tr key={c.complaint_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3.5 border-b border-gray-50 text-gray-700 align-middle"><span className="font-mono text-xs text-violet-600 font-semibold">{c.ticket_no ?? `#${c.complaint_id}`}</span></td>
                        <td className="px-4 py-3.5 border-b border-gray-50 text-gray-700 align-middle"><span className="max-w-[180px] whitespace-nowrap overflow-hidden text-ellipsis font-medium text-gray-900">{c.subject}</span></td>
                        <td className="px-4 py-3.5 border-b border-gray-50 text-gray-700 align-middle">{c.resident_name ?? "—"}</td>
                        <td className="px-4 py-3.5 border-b border-gray-50 text-gray-700 align-middle">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 border-b border-gray-50 text-gray-700 align-middle text-xs text-gray-400">
                          {c.reported_date ? new Date(c.reported_date).toLocaleDateString("th-TH") : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="sm:hidden divide-y divide-gray-100">
                {recentComplaints.map(c => (
                  <div key={c.complaint_id} className="p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-violet-600 font-semibold">{c.ticket_no ?? `#${c.complaint_id}`}</span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {c.status}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-gray-800 truncate">
                      {c.subject}
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>ผู้แจ้ง: {c.resident_name ?? "—"}</span>
                      <span>
                        {c.reported_date ? new Date(c.reported_date).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "2-digit"
                        }) : "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>{/* ── Bottom padding ── */}
      <div className="h-2" />
    </div>
  );
}
