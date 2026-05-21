'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface LoginFormProps {
  onSubmit: (data: { username: string; password: string }) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export default function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ username, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Input
        label="ชื่อผู้ใช้"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="กรอกชื่อผู้ใช้"
        required
        autoComplete="username"
      />

      <Input
        label="รหัสผ่าน"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="กรอกรหัสผ่าน"
        required
        autoComplete="current-password"
      />

      <Button type="submit" fullWidth isLoading={isLoading} size="lg">
        เข้าสู่ระบบ
      </Button>
    </form>
  );
}
