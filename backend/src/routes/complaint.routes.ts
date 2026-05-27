import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import {
  getMyComplaints,
  getComplaintById,
  getUserInfo,
  createComplaint,
  updateComplaint,
  getAllComplaints,
  getComplaintByIdForStaff,
  updateComplaintStatus,
  bulkUpdateComplaintStatus,
  getResidentsList,
  createComplaintForStaff,
  deleteComplaint,
} from '../controllers/complaint.controller';
import { getComments, createComment, deleteComment } from '../controllers/comment.controller';

const router = Router();

// ดึงข้อมูลลูกบ้านสำหรับแสดงในฟอร์ม
router.get('/user-info', authenticate, getUserInfo);

// ดึงคำร้องทั้งหมดสำหรับ staff/admin
router.get('/all', authenticate, authorize('staff', 'admin'), getAllComplaints);

// ดึงรายชื่อลูกบ้านทั้งหมด (สำหรับ staff เลือกในฟอร์มสร้างคำร้อง)
router.get('/residents-list', authenticate, authorize('staff', 'admin'), getResidentsList);

// ดึงคำร้องตาม ID สำหรับ staff
router.get('/staff/:id', authenticate, authorize('staff', 'admin'), getComplaintByIdForStaff);

// อัปเดตสถานะคำร้อง (สำหรับ staff/admin) — PATCH ตาม spec
router.patch('/staff/:id/status', authenticate, authorize('staff', 'admin'), updateComplaintStatus);

// อัปเดตสถานะคำร้องแบบกลุ่ม (สำหรับ staff/admin)
router.patch('/staff/bulk-status', authenticate, authorize('staff', 'admin'), bulkUpdateComplaintStatus);

// สร้างคำร้องโดย staff (เลือกลูกบ้านจากระบบ)
router.post('/staff', authenticate, authorize('staff', 'admin'), createComplaintForStaff);

// ดึงคำร้องทั้งหมดของลูกบ้าน
router.get('/my', authenticate, getMyComplaints);

// Comments endpoints
router.get('/:id/comments', authenticate, getComments);
router.post('/:id/comments', authenticate, createComment);
router.delete('/:id/comments/:commentId', authenticate, deleteComment);

// ดึงคำร้องตาม ID พร้อมข้อมูลลูกบ้าน (ของ resident)
router.get('/:id', authenticate, getComplaintById);

// สร้างคำร้องใหม่
router.post('/', authenticate, createComplaint);

// แก้ไขคำร้อง — PATCH ตาม spec
router.patch('/:id', authenticate, updateComplaint);

// ลบคำร้อง — Admin only
router.delete('/:id', authenticate, authorize('admin'), deleteComplaint);

export default router;
