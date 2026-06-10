/**
 * SENA Mobile App — Helper Utilities
 *
 * Common helper functions used across the app
 */

import type { ComplaintStatus } from '../types/complaint';

/**
 * Get color for complaint status
 */
export const getStatusColor = (status: ComplaintStatus): string => {
  const colors: Record<ComplaintStatus, string> = {
    pending: '#F59E0B',     // Yellow/Orange
    approved: '#8B5CF6',    // Purple
    in_meeting: '#EC4899',  // Pink
    in_progress: '#3B82F6', // Blue
    resolved: '#10B981',    // Green
    rejected: '#EF4444',    // Red
    closed: '#6B7280',      // Gray
  };
  return colors[status] || '#6B7280';
};

/**
 * Get Thai label for complaint status
 */
export const getStatusLabel = (status: ComplaintStatus): string => {
  const labels: Record<ComplaintStatus, string> = {
    pending: 'รอดำเนินการ',
    approved: 'อนุมัติรับเรื่อง',
    in_meeting: 'เข้าที่ประชุม',
    in_progress: 'กำลังดำเนินการ',
    resolved: 'แก้ไขแล้ว',
    rejected: 'ถูกปฏิเสธ',
    closed: 'ปิดเรื่อง',
  };
  return labels[status] || status;
};

/**
 * Format date to Thai locale string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format date to short format
 */
export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  });
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {return text;}
  return text.slice(0, maxLength).trim() + '...';
};

/**
 * Get initials from first and last name
 */
export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

/**
 * Validate that a status transition is allowed for a given role
 */
export const isStatusTransitionAllowed = (
  fromStatus: ComplaintStatus,
  toStatus: ComplaintStatus,
  role: 'resident' | 'staff' | 'admin',
): boolean => {
  if (role === 'resident') {
    return false; // residents cannot change status
  }

  if (role === 'admin') {
    return true; // admin can override any transition
  }

  // Staff transitions
  const staffAllowed: Record<string, ComplaintStatus[]> = {
    pending: ['in_progress', 'rejected'],
    in_progress: ['resolved', 'pending'],
  };

  return staffAllowed[fromStatus]?.includes(toStatus) ?? false;
};
