import React from 'react';
import { ComplaintStatus, STATUS_LABELS, STATUS_COLORS } from '@/types/complaint';
import { formatDateTime } from '@/lib/utils';

interface TimelineEntry {
  status: ComplaintStatus;
  date: string;
  description?: string;
}

interface StatusTimelineProps {
  entries: TimelineEntry[];
  currentStatus: string;
}

export default function StatusTimeline({ entries, currentStatus }: StatusTimelineProps) {
  const allStatuses: ComplaintStatus[] = ['pending', 'in_progress', 'resolved', 'closed'];

  // If no entries provided, show status flow
  const displayEntries = entries.length > 0
    ? entries
    : allStatuses.map((s) => ({
        status: s,
        date: '',
        description: STATUS_LABELS[s],
      }));

  return (
    <div className="space-y-4">
      {displayEntries.map((entry, idx) => {
        const isActive = entry.status === currentStatus;
        const isPast = allStatuses.indexOf(entry.status) <= allStatuses.indexOf(currentStatus as ComplaintStatus);
        const color = STATUS_COLORS[entry.status] || '#6b7280';

        return (
          <div key={idx} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-3 h-3 rounded-full border-2 ${
                  isActive ? 'scale-125' : ''
                } transition-transform`}
                style={{
                  backgroundColor: isPast ? color : 'transparent',
                  borderColor: color,
                }}
              />
              {idx < displayEntries.length - 1 && (
                <div
                  className="w-0.5 flex-1 min-h-[24px]"
                  style={{ backgroundColor: isPast ? color : '#e5e7eb' }}
                />
              )}
            </div>
            <div className={`pb-4 ${isActive ? 'font-semibold' : 'text-gray-500'}`}>
              <p className="text-sm">{STATUS_LABELS[entry.status] || entry.status}</p>
              {entry.date && (
                <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(entry.date)}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
