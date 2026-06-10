/**
 * SENA Mobile App — User Validators (Zod)
 *
 * Validation schemas for user profile forms
 */

import { z } from 'zod';

/** Profile update validation schema */
export const updateProfileSchema = z.object({
  first_name: z
    .string()
    .min(1, 'กรุณากรอกชื่อ')
    .max(100, 'ชื่อต้องไม่เกิน 100 ตัวอักษร')
    .optional(),
  last_name: z
    .string()
    .min(1, 'กรุณากรอกนามสกุล')
    .max(100, 'นามสกุลต้องไม่เกิน 100 ตัวอักษร')
    .optional(),
  phone_number: z
    .string()
    .min(9, 'เบอร์โทรศัพท์ไม่ถูกต้อง')
    .max(20, 'เบอร์โทรศัพท์ไม่ถูกต้อง')
    .optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
