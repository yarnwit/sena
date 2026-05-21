'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { CreateComplaintRequest } from '@/types/complaint';

interface ComplaintFormProps {
  onSubmit: (data: CreateComplaintRequest) => Promise<void>;
  isLoading?: boolean;
  residentInfo?: { first_name: string; last_name: string; house_no: string };
}

export default function ComplaintForm({ onSubmit, isLoading, residentInfo }: ComplaintFormProps) {
  const [form, setForm] = useState<CreateComplaintRequest>({
    subject: '',
    description: '',
    location_written: '',
    soi: '',
    intake_channel: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.subject.trim()) newErrors.subject = 'กรุณากรอกหัวข้อ';
    if (!form.description.trim()) newErrors.description = 'กรุณากรอกรายละเอียด';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {residentInfo && (
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <p><strong>ผู้ร้อง:</strong> {residentInfo.first_name} {residentInfo.last_name}</p>
          <p><strong>บ้านเลขที่:</strong> {residentInfo.house_no}</p>
        </div>
      )}

      <Input
        label="หัวข้อร้องเรียน *"
        value={form.subject}
        onChange={(e) => setForm({ ...form, subject: e.target.value })}
        error={errors.subject}
        placeholder="ระบุหัวข้อร้องเรียน"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด *</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="อธิบายรายละเอียดปัญหา"
        />
        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
      </div>

      <Input
        label="สถานที่"
        value={form.location_written || ''}
        onChange={(e) => setForm({ ...form, location_written: e.target.value })}
        placeholder="ระบุสถานที่ (ถ้ามี)"
      />

      <Input
        label="ซอย"
        value={form.soi || ''}
        onChange={(e) => setForm({ ...form, soi: e.target.value })}
        placeholder="ระบุซอย (ถ้ามี)"
      />

      <Button type="submit" fullWidth isLoading={isLoading}>
        ส่งเรื่องร้องเรียน
      </Button>
    </form>
  );
}
