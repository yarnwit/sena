import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getMyComplaints, getUserInfo, createComplaint } from '../controllers/complaint.controller';

const router = Router();

// ดึงข้อมูลลูกบ้านสำหรับแสดงในฟอร์ม
router.get('/user-info', authenticate, getUserInfo);

// ดึงคำร้องทั้งหมดของลูกบ้าน
router.get('/my', authenticate, getMyComplaints);

// สร้างคำร้องใหม่
router.post('/', authenticate, createComplaint);

export default router;
