/**
 * SENA Mobile App — Complaint Validators (Zod)
 *
 * Validation schemas for complaint forms
 */

import { z } from 'zod';

/** Create complaint form validation schema */
export const createComplaintSchema = z.object({
  subject: z
    .string()
    .min(1, 'กรุณากรอกหัวข้อเรื่องร้องเรียน')
    .max(255, 'หัวข้อต้องไม่เกิน 255 ตัวอักษร'),
  description: z
    .string()
    .min(10, 'รายละเอียดต้องมีอย่างน้อย 10 ตัวอักษร'),
  location_written: z
    .string()
    .max(255, 'สถานที่ต้องไม่เกิน 255 ตัวอักษร')
    .optional(),
  intake_channel: z
    .string()
    .max(50, 'ช่องทางรับเรื่องต้องไม่เกิน 50 ตัวอักษร')
    .optional(),
  petition: z
    .string()
    .max(255, 'คำร้องต้องไม่เกิน 255 ตัวอักษร')
    .optional(),
});

/** Update complaint form validation schema */
export const updateComplaintSchema = z.object({
  subject: z
    .string()
    .min(1, 'กรุณากรอกหัวข้อเรื่องร้องเรียน')
    .max(255, 'หัวข้อต้องไม่เกิน 255 ตัวอักษร')
    .optional(),
  description: z
    .string()
    .min(10, 'รายละเอียดต้องมีอย่างน้อย 10 ตัวอักษร')
    .optional(),
  location_written: z
    .string()
    .max(255, 'สถานที่ต้องไม่เกิน 255 ตัวอักษร')
    .optional(),
  intake_channel: z
    .string()
    .max(50, 'ช่องทางรับเรื่องต้องไม่เกิน 50 ตัวอักษร')
    .optional(),
  petition: z
    .string()
    .max(255, 'คำร้องต้องไม่เกิน 255 ตัวอักษร')
    .optional(),
});

/** Comment validation schema */
export const commentSchema = z.object({
  content: z
    .string()
    .min(1, 'กรุณากรอกความคิดเห็น')
    .max(1000, 'ความคิดเห็นต้องไม่เกิน 1000 ตัวอักษร'),
});

export type CreateComplaintFormData = z.infer<typeof createComplaintSchema>;
export type UpdateComplaintFormData = z.infer<typeof updateComplaintSchema>;
export type CommentFormData = z.infer<typeof commentSchema>;
