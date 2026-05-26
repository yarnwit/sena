export type ComplaintStatus = 'pending' | 'approved' | 'in_meeting' | 'in_progress' | 'resolved' | 'rejected' | 'closed';

export interface Complaint {
  complaint_id: number;
  ticket_no: string;
  subject: string;
  status: ComplaintStatus;
  description: string;
  reported_date: string;
  location_written?: string;
  attachment_url?: string;
  soi?: string;
  intake_channel?: string;
  phase?: string;
  petition?: string;
  // Enriched fields
  house_no?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  resident_type?: string;
}

export interface CreateComplaintRequest {
  subject: string;
  description: string;
  location_written?: string;
  soi?: string;
  intake_channel?: string;
  reported_date?: string;
  attachment_url?: string;
}

export interface UpdateComplaintRequest {
  subject: string;
  description: string;
  location_written?: string;
  soi?: string;
  intake_channel?: string;
  attachment_url?: string;
}

export interface Comment {
  comment_id: number;
  complaint_id: number;
  user_id: string;
  content: string;
  created_at: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

export const STATUS_LABELS: Record<ComplaintStatus, string> = {
  pending: 'รอดำเนินการ',
  approved: 'อนุมัติรับเรื่อง',
  in_meeting: 'เข้าที่ประชุม',
  in_progress: 'กำลังดำเนินการ',
  resolved: 'แก้ไขแล้ว',
  rejected: 'ไม่อนุมัติ',
  closed: 'ปิดเรื่อง',
};

export const STATUS_COLORS: Record<ComplaintStatus, string> = {
  pending: '#f59e0b',
  approved: '#10b981',
  in_meeting: '#8b5cf6',
  in_progress: '#3b82f6',
  resolved: '#10b981',
  rejected: '#ef4444',
  closed: '#6b7280',
};
