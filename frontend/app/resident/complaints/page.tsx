"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import "./complaints.css";

interface Complaint {
  complaint_id: number;
  ticket_no: string;
  subject: string;
  status: string;
  reported_date: string;
  description: string;
}

const statusLabels: Record<string, string> = {
  pending: "รอดำเนินการ",
  in_progress: "กำลังดำเนินการ",
  resolved: "แก้ไขแล้ว",
  rejected: "ปฏิเสธ",
  closed: "ปิดเรื่อง",
};

const filterOptions = [
  { key: "all", label: "ทั้งหมด" },
  { key: "pending", label: "รอดำเนินการ" },
  { key: "in_progress", label: "กำลังดำเนินการ" },
  { key: "resolved", label: "แก้ไขแล้ว" },
  { key: "rejected", label: "ปฏิเสธ" },
  { key: "closed", label: "ปิดเรื่อง" },
];

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchComplaints = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: residentData } = await supabase
        .from("resident")
        .select("resident_id")
        .eq("user_id", user.id)
        .single();

      if (!residentData) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("complaints")
        .select("complaint_id, ticket_no, subject, status, reported_date, description")
        .eq("resident_id", residentData.resident_id)
        .order("reported_date", { ascending: false });

      if (data) setComplaints(data);
      setLoading(false);
    };

    fetchComplaints();
  }, []);

  // Filter + Search
  const filtered = complaints.filter((c) => {
    const matchFilter = filter === "all" || c.status === filter;
    const matchSearch =
      search === "" ||
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      (c.ticket_no && c.ticket_no.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  // Count per filter
  const countByStatus = (status: string) =>
    status === "all"
      ? complaints.length
      : complaints.filter((c) => c.status === status).length;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="complaints-page">
      {/* Top Bar */}
      <div className="complaints-top-bar">
        <div className="complaints-search-wrapper">
          <svg className="complaints-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="ค้นหาเรื่องร้องเรียน..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="complaints-search"
          />
        </div>
        <Link href="/resident/complaints/new" className="new-complaint-button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          สร้างร้องเรียนใหม่
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {filterOptions.map((option) => (
          <button
            key={option.key}
            className={`filter-tab ${filter === option.key ? "active" : ""}`}
            onClick={() => setFilter(option.key)}
          >
            {option.label}
            <span className="filter-tab-count">{countByStatus(option.key)}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <h3 className="empty-title">ไม่พบเรื่องร้องเรียน</h3>
          <p className="empty-text">
            {search || filter !== "all" ? "ลองเปลี่ยนคำค้นหาหรือตัวกรอง" : "คุณยังไม่มีเรื่องร้องเรียน"}
          </p>
          {!search && filter === "all" && (
            <Link href="/resident/complaints/new" className="empty-button">
              สร้างร้องเรียนใหม่
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="complaints-table-wrapper">
            <table className="complaints-table">
              <thead>
                <tr>
                  <th>เลขที่</th>
                  <th>หัวข้อ</th>
                  <th>สถานะ</th>
                  <th>วันที่แจ้ง</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.complaint_id} onClick={() => window.location.href = `/resident/complaints/${c.complaint_id}`}>
                    <td className="table-ticket">{c.ticket_no || `#${c.complaint_id}`}</td>
                    <td className="table-subject">{c.subject}</td>
                    <td>
                      <span className={`status-badge ${c.status}`}>
                        <span className="status-dot" />
                        {statusLabels[c.status] || c.status}
                      </span>
                    </td>
                    <td className="table-date">
                      {new Date(c.reported_date).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td>
                      <Link href={`/resident/complaints/${c.complaint_id}`} className="table-action-link">
                        ดูรายละเอียด
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="complaints-mobile-list">
            {filtered.map((c) => (
              <Link
                key={c.complaint_id}
                href={`/resident/complaints/${c.complaint_id}`}
                className="complaint-card"
              >
                <div className="complaint-card-left">
                  <div className="complaint-card-ticket">{c.ticket_no || `#${c.complaint_id}`}</div>
                  <div className="complaint-card-subject">{c.subject}</div>
                  <div className="complaint-card-date">
                    {new Date(c.reported_date).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <div className="complaint-card-right">
                  <span className={`status-badge ${c.status}`}>
                    <span className="status-dot" />
                    {statusLabels[c.status] || c.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
