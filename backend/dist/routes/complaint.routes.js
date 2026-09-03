"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const complaint_controller_1 = require("../controllers/complaint.controller");
const comment_controller_1 = require("../controllers/comment.controller");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const router = (0, express_1.Router)();
// ดึงข้อมูลลูกบ้านสำหรับแสดงในฟอร์ม
router.get('/user-info', auth_middleware_1.authenticate, complaint_controller_1.getUserInfo);
// ดึงคำร้องทั้งหมดสำหรับ staff/admin
router.get('/all', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)('staff', 'admin'), complaint_controller_1.getAllComplaints);
// ดึงรายชื่อลูกบ้านทั้งหมด (สำหรับ staff เลือกในฟอร์มสร้างคำร้อง)
router.get('/residents-list', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)('staff', 'admin'), complaint_controller_1.getResidentsList);
// ดึงคำร้องตาม ID สำหรับ staff
router.get('/staff/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)('staff', 'admin'), complaint_controller_1.getComplaintByIdForStaff);
// อัปเดตสถานะคำร้อง (สำหรับ staff/admin) — PATCH ตาม spec
router.patch('/staff/:id/status', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)('staff', 'admin'), complaint_controller_1.updateComplaintStatus);
// อัปเดตสถานะคำร้องแบบกลุ่ม (สำหรับ staff/admin)
router.patch('/staff/bulk-status', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)('staff', 'admin'), complaint_controller_1.bulkUpdateComplaintStatus);
// สร้างคำร้องโดย staff (เลือกลูกบ้านจากระบบ)
router.post('/staff', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)('staff', 'admin'), upload_middleware_1.upload.single('attachment'), complaint_controller_1.createComplaintForStaff);
// แก้ไขคำร้องโดย staff/admin (ไม่ต้องตรวจ ownership)
router.patch('/staff/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)('staff', 'admin'), upload_middleware_1.upload.single('attachment'), complaint_controller_1.updateComplaintByStaff);
// ดึงคำร้องทั้งหมดของลูกบ้าน
router.get('/my', auth_middleware_1.authenticate, complaint_controller_1.getMyComplaints);
// Comments endpoints
router.get('/:id/comments', auth_middleware_1.authenticate, comment_controller_1.getComments);
router.post('/:id/comments', auth_middleware_1.authenticate, comment_controller_1.createComment);
router.delete('/:id/comments/:commentId', auth_middleware_1.authenticate, comment_controller_1.deleteComment);
// ดึงคำร้องตาม ID พร้อมข้อมูลลูกบ้าน (ของ resident)
router.get('/:id', auth_middleware_1.authenticate, complaint_controller_1.getComplaintById);
// สร้างคำร้องใหม่
router.post('/', auth_middleware_1.authenticate, upload_middleware_1.upload.single('attachment'), complaint_controller_1.createComplaint);
// แก้ไขคำร้อง — PATCH ตาม spec
router.patch('/:id', auth_middleware_1.authenticate, upload_middleware_1.upload.single('attachment'), complaint_controller_1.updateComplaint);
// ลบคำร้อง — Admin only
router.delete('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)('admin'), complaint_controller_1.deleteComplaint);
exports.default = router;
