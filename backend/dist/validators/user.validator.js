"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleActiveSchema = exports.changeRoleSchema = exports.updateUserSchema = void 0;
const zod_1 = require("zod");
exports.updateUserSchema = zod_1.z.object({
    first_name: zod_1.z.string().min(1, 'กรุณากรอกชื่อจริง').optional(),
    last_name: zod_1.z.string().min(1, 'กรุณากรอกนามสกุล').optional(),
    phone_number: zod_1.z.string().optional(),
    house_no: zod_1.z.string().optional(),
    resident_type: zod_1.z.string().optional(),
});
exports.changeRoleSchema = zod_1.z.object({
    role: zod_1.z.enum(['resident', 'staff', 'admin'], {
        errorMap: () => ({ message: 'Role ไม่ถูกต้อง' }),
    }),
});
exports.toggleActiveSchema = zod_1.z.object({
    is_active: zod_1.z.boolean(),
});
