import React from 'react';
import Badge from '@/components/ui/Badge';
import { ComplaintStatus, STATUS_LABELS } from '@/types/complaint';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gray'> = {
  pending: 'warning',
  in_progress: 'info',
  resolved: 'success',
  rejected: 'danger',
  closed: 'gray',
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = STATUS_VARIANT[status] || 'default';
  const label = STATUS_LABELS[status as ComplaintStatus] || status;

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
