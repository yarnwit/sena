/**
 * SENA Mobile App — Auth Validators (Zod)
 *
 * Validation schemas for login, registration, and password recovery forms
 */

import { z } from 'zod';

/** Login form validation schema */
export const loginSchema = z.object({
  username: z
    .string()
    .min(3, 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร')
    .max(255, 'ชื่อผู้ใช้ต้องไม่เกิน 255 ตัวอักษร'),
  password: z
    .string()
    .min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
});

/** Registration form validation schema */
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร')
    .max(255, 'ชื่อผู้ใช้ต้องไม่เกิน 255 ตัวอักษร'),
  password: z
    .string()
    .min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
    .max(100, 'รหัสผ่านต้องไม่เกิน 100 ตัวอักษร'),
  first_name: z
    .string()
    .min(1, 'กรุณากรอกชื่อ')
    .max(100, 'ชื่อต้องไม่เกิน 100 ตัวอักษร'),
  last_name: z
    .string()
    .min(1, 'กรุณากรอกนามสกุล')
    .max(100, 'นามสกุลต้องไม่เกิน 100 ตัวอักษร'),
  house_no: z
    .string()
    .min(1, 'กรุณากรอกบ้านเลขที่'),
  phone_number: z
    .string()
    .min(9, 'เบอร์โทรศัพท์ไม่ถูกต้อง')
    .max(20, 'เบอร์โทรศัพท์ไม่ถูกต้อง'),
  resident_type: z
    .string()
    .min(1, 'กรุณาเลือกประเภทผู้พักอาศัย'),
  phase: z
    .string()
    .min(1, 'กรุณาเลือก Phase'),
  soi: z
    .string()
    .min(1, 'กรุณากรอกซอย'),
});

/** Forgot password form validation schema */
export const forgotPasswordSchema = z.object({
  username: z
    .string()
    .min(1, 'กรุณากรอกชื่อผู้ใช้'),
  first_name: z
    .string()
    .min(1, 'กรุณากรอกชื่อจริง'),
  last_name: z
    .string()
    .min(1, 'กรุณากรอกนามสกุล'),
});

/** Reset password form validation schema */
export const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(6, 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร')
    .max(100, 'รหัสผ่านต้องไม่เกิน 100 ตัวอักษร'),
  confirmPassword: z
    .string()
    .min(1, 'กรุณายืนยันรหัสผ่าน'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'รหัสผ่านไม่ตรงกัน',
  path: ['confirmPassword'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
