import { ComplaintStatus, STATUS_LABELS } from '@/types/complaint';

/**
 * Format date to Thai locale string
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format datetime to Thai locale string
 */
export function formatDateTime(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format status to Thai label
 */
export function formatStatus(status: string): string {
  return STATUS_LABELS[status as ComplaintStatus] || status;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Build full name from first/last name
 */
export function fullName(firstName?: string, lastName?: string): string {
  return [firstName, lastName].filter(Boolean).join(' ') || '-';
}

/**
 * Generate a random color for avatar
 */
export function getAvatarColor(name: string): string {
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
