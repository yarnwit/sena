/**
 * SENA Mobile App — Complaints API Functions
 *
 * API calls for complaint CRUD operations:
 * - GET /api/complaints
 * - GET /api/complaints/:id
 * - POST /api/complaints
 * - PATCH /api/complaints/:id
 * - PATCH /api/complaints/:id/status
 * - DELETE /api/complaints/:id
 */

import apiClient from './client';
import type {
  Complaint,
  AttachmentFile,
  ComplaintCreatePayload,
  ComplaintUpdatePayload,
  ComplaintStatusPayload,
  ComplaintListParams,
  PaginatedResponse,
  ComplaintCreateForStaffPayload,
} from '../types/complaint';

/**
 * Get list of complaints with optional filters
 */
export const getComplaints = async (
  params?: ComplaintListParams,
  role?: string,
): Promise<PaginatedResponse<Complaint>> => {
  const endpoint = role === 'staff' || role === 'admin' ? '/complaints/all' : '/complaints/my';
  const response = await apiClient.get(endpoint, { params });
  return response.data;
};

/**
 * Get a single complaint by ID
 */
export const getComplaintById = async (id: number, role?: string): Promise<{ data: Complaint }> => {
  const endpoint = role === 'staff' || role === 'admin' ? `/complaints/staff/${id}` : `/complaints/${id}`;
  const response = await apiClient.get(endpoint);
  return response.data;
};

/**
 * Create a new complaint
 */
export const createComplaint = async (
  data: ComplaintCreatePayload,
): Promise<{ data: Complaint }> => {
  // Use FormData if attachment is included
  if (data.attachment) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'attachment' && value) {
        formData.append('attachment', {
          uri: value.uri,
          type: value.type,
          name: value.name,
        } as unknown as Blob);
      } else if (value !== undefined) {
        formData.append(key, String(value));
      }
    });
    const response = await apiClient.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  const response = await apiClient.post('/complaints', data);
  return response.data;
};

/**
 * Update an existing complaint
 */
export const updateComplaint = async (
  id: number,
  data: ComplaintUpdatePayload & { attachment?: AttachmentFile },
  role?: string,
): Promise<{ data: Complaint }> => {
  const endpoint = role === 'staff' || role === 'admin' ? `/complaints/staff/${id}` : `/complaints/${id}`;

  if (data.attachment) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'attachment' && value) {
        formData.append('attachment', {
          uri: (value as AttachmentFile).uri,
          type: (value as AttachmentFile).type,
          name: (value as AttachmentFile).name,
        } as unknown as Blob);
      } else if (value !== undefined) {
        formData.append(key, String(value));
      }
    });
    const response = await apiClient.patch(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  const response = await apiClient.patch(endpoint, data);
  return response.data;
};

/**
 * Update complaint status (staff/admin only)
 */
export const updateComplaintStatus = async (
  id: number,
  data: ComplaintStatusPayload,
): Promise<{ data: Complaint }> => {
  const response = await apiClient.patch(`/complaints/staff/${id}/status`, data);
  return response.data;
};

/**
 * Delete a complaint (admin only)
 */
export const deleteComplaint = async (id: number): Promise<void> => {
  await apiClient.delete(`/complaints/${id}`);
};

/**
 * Get list of residents (staff/admin only)
 */
export const getResidentsList = async (): Promise<{ data: any[] }> => {
  const response = await apiClient.get('/complaints/residents-list');
  return response.data;
};

/**
 * Create a new complaint by staff
 */
export const createComplaintForStaff = async (
  data: ComplaintCreateForStaffPayload,
): Promise<{ data: Complaint }> => {
  if (data.attachment) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'attachment' && value) {
        formData.append('attachment', {
          uri: value.uri,
          type: value.type,
          name: value.name,
        } as unknown as Blob);
      } else if (value !== undefined) {
        formData.append(key, String(value));
      }
    });
    const response = await apiClient.post('/complaints/staff', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  const response = await apiClient.post('/complaints/staff', data);
  return response.data;
};

