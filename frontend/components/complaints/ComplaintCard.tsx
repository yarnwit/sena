import React from 'react';
import Card from '@/components/ui/Card';
import StatusBadge from './StatusBadge';
import { Complaint } from '@/types/complaint';
import { formatDate, truncate } from '@/lib/utils';

interface ComplaintCardProps {
  complaint: Complaint;
  onClick?: () => void;
  showResident?: boolean;
}

export default function ComplaintCard({ complaint, onClick, showResident = false }: ComplaintCardProps) {
  return (
    <Card onClick={onClick} className="hover:border-blue-200">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs text-gray-400 font-mono">{complaint.ticket_no}</span>
        <StatusBadge status={complaint.status} />
      </div>
      <h4 className="font-medium text-gray-900 mb-1">{complaint.subject}</h4>
      <p className="text-sm text-gray-500 mb-3">{truncate(complaint.description, 120)}</p>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{formatDate(complaint.reported_date)}</span>
        {showResident && complaint.first_name && (
          <span>{complaint.first_name} {complaint.last_name} {complaint.house_no ? `(${complaint.house_no})` : ''}</span>
        )}
      </div>
    </Card>
  );
}
