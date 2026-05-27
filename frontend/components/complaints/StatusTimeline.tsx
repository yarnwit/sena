import React from 'react';
import { ComplaintStatus, STATUS_LABELS, STATUS_COLORS } from '@/types/complaint';
import { formatDateTime } from '@/lib/utils';

interface TimelineEntry {
  status: ComplaintStatus;
  date: string;
  description?: string;
}

interface StatusTimelineProps {
  entries?: TimelineEntry[];
  currentStatus: string;
  isInteractive?: boolean;
  onStatusChange?: (status: string) => void;
  disabled?: boolean;
}

// Linear flow for the stepper
const LINEAR_FLOW: ComplaintStatus[] = [
  'pending',
  'approved',
  'in_meeting',
  'in_progress',
  'resolved'
];

export default function StatusTimeline({ 
  entries = [], 
  currentStatus, 
  isInteractive = false,
  onStatusChange,
  disabled = false
}: StatusTimelineProps) {
  
  const currentIndex = LINEAR_FLOW.indexOf(currentStatus as ComplaintStatus);
  const isRejected = currentStatus === 'rejected';

  return (
    <div className="space-y-4">
      {/* If rejected, show special state or keep original timeline but mark as rejected? 
          For now, we just show the linear flow, and if rejected we can show a specific message or just highlight it differently if needed.
          Since the design is linear without rejected, we'll render the linear flow. 
      */}
      {isRejected && (
        <div className="flex gap-3 mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
          <div className="flex flex-col items-center pt-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-red-600">สถานะปัจจุบัน: ไม่อนุมัติ</p>
            <p className="text-xs text-red-500 mt-1">เรื่องร้องเรียนนี้ถูกปฏิเสธหรือไม่ผ่านการอนุมัติ</p>
          </div>
        </div>
      )}

      {LINEAR_FLOW.map((status, idx) => {
        const isActive = status === currentStatus;
        const isPast = !isRejected && LINEAR_FLOW.indexOf(status) <= currentIndex;
        // Find if we have an entry with date for this status
        const entry = entries.find(e => e.status === status);
        
        // Define styling based on state
        const color = STATUS_COLORS[status] || '#d4a574';
        
        const dotStyle = isPast 
          ? { backgroundColor: color, borderColor: color }
          : { backgroundColor: 'white', border: `2px solid #e5e7eb` };

        return (
          <div key={status} className="flex gap-3 group">
            <div className="flex flex-col items-center">
              <div
                onClick={() => {
                  if (isInteractive && !disabled && onStatusChange) {
                    onStatusChange(status);
                  }
                }}
                className={`w-[14px] h-[14px] rounded-full z-10 transition-all ${
                  isInteractive && !disabled ? 'cursor-pointer hover:scale-125' : ''
                } ${isActive ? 'ring-4 ring-opacity-30 scale-110' : ''}`}
                style={{
                  ...dotStyle,
                  boxShadow: isActive ? `0 0 0 4px ${color}33` : 'none'
                }}
              />
              {idx < LINEAR_FLOW.length - 1 && (
                <div
                  className="w-[2px] flex-1 min-h-[32px] -mt-1 -mb-1"
                  style={{ backgroundColor: isPast && !isActive ? color : '#e5e7eb' }}
                />
              )}
            </div>
            <div className={`pb-5 pt-0.5 ${isActive ? 'font-bold' : (isPast ? 'font-medium text-gray-700' : 'text-gray-400')}`}>
              <span 
                onClick={() => {
                  if (isInteractive && !disabled && onStatusChange) {
                    onStatusChange(status);
                  }
                }}
                className={`${isInteractive && !disabled ? 'cursor-pointer hover:underline' : ''}`}
                style={{ color: isActive ? color : undefined }}
              >
                {STATUS_LABELS[status] || status}
              </span>
              {entry?.date && (
                <p className="text-xs text-gray-400 mt-1 font-normal">{formatDateTime(entry.date)}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
