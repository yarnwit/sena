'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { RegisterRequest } from '@/types/auth';

interface RegisterFormProps {
  onSubmit: (data: RegisterRequest) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export default function RegisterForm({ onSubmit, isLoading, error }: RegisterFormProps) {
  const [form, setForm] = useState<RegisterRequest>({
    email: '',
    password: '',
    username: '',
    first_name: '',
    last_name: '',
    house_no: '',
    phone_number: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.email) newErrors.email = 'กรุณากรอกอีเมล';
    if (!form.username) newErrors.username = 'กรุณากรอกชื่อผู้ใช้';
    if (!form.first_name) newErrors.first_name = 'กรุณากรอกชื่อจริง';
    if (!form.last_name) newErrors.last_name = 'กรุณากรอกนามสกุล';
    if (form.password.length < 6) newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    if (form.password !== confirmPassword) newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
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
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="ชื่อจริง *" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} error={errors.first_name} />
        <Input label="นามสกุล *" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} error={errors.last_name} />
      </div>

      <Input label="อีเมล *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
      <Input label="ชื่อผู้ใช้ *" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} error={errors.username} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="รหัสผ่าน *" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} />
        <Input label="ยืนยันรหัสผ่าน *" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} error={errors.confirmPassword} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="บ้านเลขที่" value={form.house_no || ''} onChange={(e) => setForm({ ...form, house_no: e.target.value })} />
        <Input label="เบอร์โทร" value={form.phone_number || ''} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
      </div>

      <Button type="submit" fullWidth isLoading={isLoading} size="lg">
        สมัครสมาชิก
      </Button>
    </form>
  );
}
