"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComplaintForStaffSchema = exports.updateStatusSchema = exports.updateComplaintSchema = exports.createComplaintSchema = void 0;
const zod_1 = require("zod");
exports.createComplaintSchema = zod_1.z.object({
    subject: zod_1.z.string().min(1, 'กรุณากรอกหัวข้อ'),
    description: zod_1.z.string().min(1, 'กรุณากรอกรายละเอียด'),
    location_written: zod_1.z.string().optional().nullable(),
    soi: zod_1.z.string().optional().nullable(),
    intake_channel: zod_1.z.string().optional().nullable(),
    reported_date: zod_1.z.string().optional(),
    attachment_url: zod_1.z.string().optional().nullable(),
});
exports.updateComplaintSchema = zod_1.z.object({
    subject: zod_1.z.string().min(1, 'กรุณากรอกหัวข้อ'),
    description: zod_1.z.string().min(1, 'กรุณากรอกรายละเอียด'),
    location_written: zod_1.z.string().optional().nullable(),
    soi: zod_1.z.string().optional().nullable(),
    intake_channel: zod_1.z.string().optional().nullable(),
    attachment_url: zod_1.z.string().optional().nullable(),
});
exports.updateStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['pending', 'approved', 'in_meeting', 'in_progress', 'resolved', 'rejected', 'closed'], {
        errorMap: () => ({ message: 'สถานะไม่ถูกต้อง' }),
    }),
});
exports.createComplaintForStaffSchema = zod_1.z.object({
    resident_id: zod_1.z.number().optional().nullable(),
    manual_name: zod_1.z.string().optional(),
    manual_house_no: zod_1.z.string().optional(),
    manual_phone: zod_1.z.string().optional(),
    subject: zod_1.z.string().min(1, 'กรุณากรอกหัวข้อ'),
    description: zod_1.z.string().min(1, 'กรุณากรอกรายละเอียด'),
    location_written: zod_1.z.string().optional().nullable(),
    soi: zod_1.z.string().optional().nullable(),
    phase: zod_1.z.string().optional().nullable(),
    intake_channel: zod_1.z.string().optional().nullable(),
    reported_date: zod_1.z.string().optional(),
    attachment_url: zod_1.z.string().optional().nullable(),
});
