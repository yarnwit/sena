'use client';

import React, { useState } from 'react';
import ComplaintCard from './ComplaintCard';
import { Complaint, ComplaintStatus, STATUS_LABELS } from '@/types/complaint';

interface ComplaintListProps {
  complaints: Complaint[];
  isLoading?: boolean;
  onSelect?: (complaint: Complaint) => void;
  showResident?: boolean;
}

export default function ComplaintList({ complaints, isLoading, onSelect, showResident }: ComplaintListProps) {
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all'
    ? complaints
    : complaints.filter((c) => c.status === filter);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
            filter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          ทั้งหมด ({complaints.length})
        </button>
        {(Object.keys(STATUS_LABELS) as ComplaintStatus[]).map((status) => {
          const count = complaints.filter((c) => c.status === status).length;
          if (count === 0) return null;
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                filter === status ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {STATUS_LABELS[status]} ({count})
            </button>
          );
        })}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 py-8">ไม่มีข้อมูล</p>
      ) : (
        <div className="grid gap-3">
          {filtered.map((complaint) => (
            <ComplaintCard
              key={complaint.complaint_id}
              complaint={complaint}
              onClick={() => onSelect?.(complaint)}
              showResident={showResident}
            />
          ))}
        </div>
      )}
    </div>
  );
}
