import { z } from 'zod';

export const createComplaintSchema = z.object({
  subject: z.string().min(1, 'กรุณากรอกหัวข้อ'),
  description: z.string().min(1, 'กรุณากรอกรายละเอียด'),
  location_written: z.string().optional().nullable(),
  soi: z.string().optional().nullable(),
  intake_channel: z.string().optional().nullable(),
  reported_date: z.string().optional(),
  attachment_url: z.string().optional().nullable(),
});

export const updateComplaintSchema = z.object({
  subject: z.string().min(1, 'กรุณากรอกหัวข้อ'),
  description: z.string().min(1, 'กรุณากรอกรายละเอียด'),
  location_written: z.string().optional().nullable(),
  soi: z.string().optional().nullable(),
  intake_channel: z.string().optional().nullable(),
  attachment_url: z.string().optional().nullable(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'resolved', 'rejected', 'closed'], {
    errorMap: () => ({ message: 'สถานะไม่ถูกต้อง' }),
  }),
});

export const createComplaintForStaffSchema = z.object({
  resident_id: z.number().optional().nullable(),
  manual_name: z.string().optional(),
  manual_house_no: z.string().optional(),
  manual_phone: z.string().optional(),
  subject: z.string().min(1, 'กรุณากรอกหัวข้อ'),
  description: z.string().min(1, 'กรุณากรอกรายละเอียด'),
  location_written: z.string().optional().nullable(),
  soi: z.string().optional().nullable(),
  phase: z.string().optional().nullable(),
  intake_channel: z.string().optional().nullable(),
  reported_date: z.string().optional(),
  attachment_url: z.string().optional().nullable(),
});

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;
export type UpdateComplaintInput = z.infer<typeof updateComplaintSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type CreateComplaintForStaffInput = z.infer<typeof createComplaintForStaffSchema>;
