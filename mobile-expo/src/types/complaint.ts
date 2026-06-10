/**
 * SENA Mobile App — Complaint Types
 *
 * Types for complaint-related data
 */

/** Complaint status values */
export type ComplaintStatus =
  | 'pending'
  | 'approved'
  | 'in_meeting'
  | 'in_progress'
  | 'resolved'
  | 'rejected'
  | 'closed';

/** Complaint object from API */
export interface Complaint {
  complaint_id: number;
  resident_id: number;
  ticket_no: string;
  subject: string;
  status: ComplaintStatus;
  description: string;
  reported_date: string;
  location_written: string;
  attachment_url: string | null;
  intake_channel: string;
  petition: string;
  /** Joined from resident/user tables */
  resident_name?: string;
  house_no?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  phase?: string;
  soi?: string;
  reviewer_name?: string | null;
}

/** File attachment for complaint creation */
export interface AttachmentFile {
  uri: string;
  type: string;
  name: string;
}

/** Payload for creating a new complaint */
export interface ComplaintCreatePayload {
  subject: string;
  description: string;
  location_written?: string;
  intake_channel?: string;
  petition?: string;
  attachment?: AttachmentFile;
}

/** Payload for updating a complaint */
export interface ComplaintUpdatePayload {
  subject?: string;
  description?: string;
  location_written?: string;
  intake_channel?: string;
  petition?: string;
}

/** Payload for updating complaint status */
export interface ComplaintStatusPayload {
  status: ComplaintStatus;
  petition?: string;
}

/** Query params for complaint list */
export interface ComplaintListParams {
  page?: number;
  limit?: number;
  status?: ComplaintStatus;
  search?: string;
  sort_by?: 'reported_date' | 'status';
  sort_order?: 'asc' | 'desc';
}

/** Paginated API response */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Comment object */
export interface Comment {
  comment_id: number;
  complaint_id: number;
  user_id: string;
  content: string;
  created_at: string;
  /** Joined from user table */
  username?: string;
  first_name?: string;
  last_name?: string;
  /** Audit Log fields */
  type?: 'comment' | 'system_log';
  action?: string;
  details?: Record<string, any>;
}

/** Payload for creating a comment */
export interface CommentCreatePayload {
  content: string;
}

/** Payload for creating a complaint by staff */
export interface ComplaintCreateForStaffPayload {
  subject: string;
  description: string;
  intake_channel?: string;
  attachment?: AttachmentFile;
  resident_id?: number | null;
  manual_name?: string;
  manual_house_no?: string;
  manual_phone?: string;
  phase?: string;
  soi?: string;
}

