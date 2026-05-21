import { z } from 'zod';

export const updateUserSchema = z.object({
  first_name: z.string().min(1, 'กรุณากรอกชื่อจริง').optional(),
  last_name: z.string().min(1, 'กรุณากรอกนามสกุล').optional(),
  phone_number: z.string().optional(),
  house_no: z.string().optional(),
  resident_type: z.string().optional(),
});

export const changeRoleSchema = z.object({
  role: z.enum(['resident', 'staff', 'admin'], {
    errorMap: () => ({ message: 'Role ไม่ถูกต้อง' }),
  }),
});

export const toggleActiveSchema = z.object({
  is_active: z.boolean(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangeRoleInput = z.infer<typeof changeRoleSchema>;
export type ToggleActiveInput = z.infer<typeof toggleActiveSchema>;
