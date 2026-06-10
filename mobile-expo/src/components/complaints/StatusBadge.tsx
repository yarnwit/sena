import React from 'react';
import { Badge } from '../ui';
import theme from '../../utils/theme';
import { getStatusLabel } from '../../utils/helpers';
import { ComplaintStatus } from '../../types/complaint';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case 'pending':
        return theme.colors.status.pending;
      case 'in_progress':
        return theme.colors.status.in_progress;
      case 'resolved':
        return theme.colors.status.resolved;
      case 'rejected':
        return theme.colors.status.rejected;
      case 'closed':
        return theme.colors.status.closed;
      default:
        return theme.colors.status.pending;
    }
  };

  const getStatusBgColor = (status: ComplaintStatus) => {
    switch (status) {
      case 'pending':
        return theme.colors.status.pendingBg;
      case 'in_progress':
        return theme.colors.status.in_progressBg;
      case 'resolved':
        return theme.colors.status.resolvedBg;
      case 'rejected':
        return theme.colors.status.rejectedBg;
      case 'closed':
        return theme.colors.status.closedBg;
      default:
        return theme.colors.status.pendingBg;
    }
  };

  return (
    <Badge
      label={getStatusLabel(status)}
      color={getStatusColor(status)}
      backgroundColor={getStatusBgColor(status)}
      size={size}
    />
  );
};
