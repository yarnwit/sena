/**
 * SENA Mobile App — Complaint Types
 *
 * Types for complaint-related data
 */

/** Complaint status values */
export type ComplaintStatus =
  | 'pending'
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
}

/** Payload for creating a comment */
export interface CommentCreatePayload {
  content: string;
}
