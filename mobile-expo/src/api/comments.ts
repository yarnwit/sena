/**
 * SENA Mobile App — Comments API Functions
 *
 * API calls for comment operations:
 * - GET /api/complaints/:id/comments
 * - POST /api/complaints/:id/comments
 */

import apiClient from './client';
import type { Comment, CommentCreatePayload } from '../types/complaint';

/**
 * Get comments for a specific complaint
 */
export const getComments = async (complaintId: number): Promise<{ data: Comment[] }> => {
  const response = await apiClient.get(`/complaints/${complaintId}/comments`);
  return response.data;
};

/**
 * Add a comment to a complaint
 */
export const addComment = async (
  complaintId: number,
  data: CommentCreatePayload,
): Promise<{ data: Comment }> => {
  const response = await apiClient.post(`/complaints/${complaintId}/comments`, data);
  return response.data;
};
