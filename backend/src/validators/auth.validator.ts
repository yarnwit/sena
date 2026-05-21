import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'กรุณากรอกชื่อผู้ใช้'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
});

export const registerSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
  username: z.string().min(1, 'กรุณากรอกชื่อผู้ใช้'),
  first_name: z.string().min(1, 'กรุณากรอกชื่อจริง'),
  last_name: z.string().min(1, 'กรุณากรอกนามสกุล'),
  house_no: z.string().optional(),
  phone_number: z.string().optional(),
  resident_type: z.string().optional(),
  role: z.enum(['resident', 'staff', 'admin']).default('resident'),
});

export const forgotPasswordSchema = z.object({
  username: z.string().min(1, 'กรุณากรอกชื่อผู้ใช้'),
  first_name: z.string().min(1, 'กรุณากรอกชื่อจริง'),
  last_name: z.string().min(1, 'กรุณากรอกนามสกุล'),
});

export const resetPasswordSchema = z.object({
  resetToken: z.string().min(1, 'กรุณาระบุ token'),
  newPassword: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
