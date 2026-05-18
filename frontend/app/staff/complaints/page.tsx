"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import "./complaints.css";

interface Complaint {
  complaint_id: number;
  ticket_no: string;
  subject: string;
  status: string;
  reported_date: string;
  location_written: string | null;
  soi: string | null;
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function StaffComplaintsPage() {
  const searchParams = useSearchParams();
  const defaultStatus = searchParams.get("status") || "all";

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(defaultStatus);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/complaints/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();
        if (json.success && json.data) {
          setComplaints(json.data);
        }
      } catch (error) {
        console.error("Fetch complaints error:", error);
      }
      setLoading(false);
    };

    fetchComplaints();
  }, []);

  // Update filter when URL param changes (e.g. clicking quick action from dashboard)
  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam && filterOptions.some(opt => opt.key === statusParam)) {
      setFilter(statusParam);
    }
  }, [searchParams]);

  // Filter + Search
  const filtered = complaints.filter((c) => {
    const matchFilter = filter === "all" || c.status === filter;
    const matchSearch =
      search === "" ||
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      (c.ticket_no && c.ticket_no.toLowerCase().includes(search.toLowerCase())) ||
      (c.location_written && c.location_written.toLowerCase().includes(search.toLowerCase()));
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
            placeholder="ค้นหาเรื่องร้องเรียน, เลขที่, หรือสถานที่..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="complaints-search"
          />
        </div>
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
            {search || filter !== "all" ? "ลองเปลี่ยนคำค้นหาหรือตัวกรอง" : "ไม่มีเรื่องร้องเรียนในระบบ"}
          </p>
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
                  <th>สถานที่ / ซอย</th>
                  <th>สถานะ</th>
                  <th>วันที่แจ้ง</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.complaint_id} onClick={() => window.location.href = `/staff/complaints/${c.complaint_id}`}>
                    <td className="table-ticket">{c.ticket_no || `#${c.complaint_id}`}</td>
                    <td className="table-subject">{c.subject}</td>
                    <td className="table-location">
                      {c.location_written || "-"} {c.soi ? `(ซอย ${c.soi})` : ""}
                    </td>
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
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td>
                      <Link href={`/staff/complaints/${c.complaint_id}`} className="table-action-link">
                        จัดการ
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
                href={`/staff/complaints/${c.complaint_id}`}
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
