"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, 'กรุณากรอกชื่อผู้ใช้'),
    password: zod_1.z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
});
exports.registerSchema = zod_1.z.object({
    password: zod_1.z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
    username: zod_1.z.string().min(1, 'กรุณากรอกชื่อผู้ใช้'),
    first_name: zod_1.z.string().min(1, 'กรุณากรอกชื่อจริง'),
    last_name: zod_1.z.string().min(1, 'กรุณากรอกนามสกุล'),
    house_no: zod_1.z.string().optional(),
    phase: zod_1.z.string().optional(),
    soi: zod_1.z.string().optional(),
    phone_number: zod_1.z.string().optional(),
    resident_type: zod_1.z.string().optional(),
    role: zod_1.z.enum(['resident', 'staff', 'admin']).default('resident'),
});
exports.forgotPasswordSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, 'กรุณากรอกชื่อผู้ใช้'),
    first_name: zod_1.z.string().min(1, 'กรุณากรอกชื่อจริง'),
    last_name: zod_1.z.string().min(1, 'กรุณากรอกนามสกุล'),
});
exports.resetPasswordSchema = zod_1.z.object({
    resetToken: zod_1.z.string().min(1, 'กรุณาระบุ token'),
    newPassword: zod_1.z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
});
