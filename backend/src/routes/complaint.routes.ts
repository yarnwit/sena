import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getMyComplaints, getComplaintById, getUserInfo, createComplaint, updateComplaint, getAllComplaints, getComplaintByIdForStaff, updateComplaintStatusForStaff } from '../controllers/complaint.controller';

const router = Router();

// ดึงข้อมูลลูกบ้านสำหรับแสดงในฟอร์ม
router.get('/user-info', authenticate, getUserInfo);

// ดึงคำร้องทั้งหมดสำหรับ staff/admin
router.get('/all', authenticate, getAllComplaints);

// ดึงคำร้องตาม ID สำหรับ staff
router.get('/staff/:id', authenticate, getComplaintByIdForStaff);

// อัปเดตสถานะคำร้อง (สำหรับ staff/admin)
router.put('/staff/:id/status', authenticate, updateComplaintStatusForStaff);

// ดึงคำร้องทั้งหมดของลูกบ้าน
router.get('/my', authenticate, getMyComplaints);

// ดึงคำร้องตาม ID พร้อมข้อมูลลูกบ้าน (ของ resident)
router.get('/:id', authenticate, getComplaintById);

// สร้างคำร้องใหม่
router.post('/', authenticate, createComplaint);

// แก้ไขคำร้อง
router.put('/:id', authenticate, updateComplaint);

export default router;
