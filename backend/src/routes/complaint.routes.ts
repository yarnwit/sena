import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getMyComplaints, getComplaintById, getUserInfo, createComplaint, updateComplaint, getAllComplaints, getComplaintByIdForStaff, updateComplaintStatusForStaff, getResidentsList, createComplaintForStaff } from '../controllers/complaint.controller';

const router = Router();

// ดึงข้อมูลลูกบ้านสำหรับแสดงในฟอร์ม
router.get('/user-info', authenticate, getUserInfo);

// ดึงคำร้องทั้งหมดสำหรับ staff/admin
router.get('/all', authenticate, getAllComplaints);

// ดึงรายชื่อลูกบ้านทั้งหมด (สำหรับ staff เลือกในฟอร์มสร้างคำร้อง)
router.get('/residents-list', authenticate, getResidentsList);

// ดึงคำร้องตาม ID สำหรับ staff
router.get('/staff/:id', authenticate, getComplaintByIdForStaff);

// อัปเดตสถานะคำร้อง (สำหรับ staff/admin)
router.put('/staff/:id/status', authenticate, updateComplaintStatusForStaff);

// สร้างคำร้องโดย staff (เลือกลูกบ้านจากระบบ)
router.post('/staff', authenticate, createComplaintForStaff);

// ดึงคำร้องทั้งหมดของลูกบ้าน
router.get('/my', authenticate, getMyComplaints);

// ดึงคำร้องตาม ID พร้อมข้อมูลลูกบ้าน (ของ resident)
router.get('/:id', authenticate, getComplaintById);

// สร้างคำร้องใหม่
router.post('/', authenticate, createComplaint);

// แก้ไขคำร้อง
router.put('/:id', authenticate, updateComplaint);

export default router;
