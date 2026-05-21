import { Request, Response } from 'express';
import { ComplaintModel } from '../models/Complaint.model';
import { ComplaintService } from '../services/complaint.service';
import { sendSuccess, sendError } from '../utils/response.util';
import logger from '../config/logger';

// ===== GET /api/complaints/my =====
export const getMyComplaints = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const residentId = await ComplaintService.getResidentId(userId);
    if (!residentId) return sendSuccess(res, []);

    const complaints = await ComplaintModel.findByResidentId(residentId);
    return sendSuccess(res, complaints);
  } catch (error) {
    logger.error('Get complaints error:', error);
    return sendError(res, 'Internal server error');
  }
};

// ===== GET /api/complaints/all =====
export const getAllComplaints = async (req: Request, res: Response) => {
  try {
    const complaints = await ComplaintModel.findAll();
    const enriched = await ComplaintModel.enrichMany(complaints);
    return sendSuccess(res, enriched);
  } catch (error) {
    logger.error('Get all complaints error:', error);
    return sendError(res, 'Internal server error');
  }
};

// ===== GET /api/complaints/staff/:id =====
export const getComplaintByIdForStaff = async (req: Request, res: Response) => {
  try {
    const detail = await ComplaintService.getComplaintDetailForStaff(req.params.id);
    if (!detail) return sendError(res, 'ไม่พบคำร้องนี้', 404);
    return sendSuccess(res, detail);
  } catch (error) {
    logger.error('Get complaint by ID for staff error:', error);
    return sendError(res, 'Internal server error');
  }
};

// ===== GET /api/complaints/:id =====
export const getComplaintById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const residentInfo = await ComplaintService.getResidentInfo(userId);
    if (!residentInfo.resident_id) return sendError(res, 'ไม่พบข้อมูลลูกบ้าน', 404);

    const complaint = await ComplaintModel.findByIdAndResident(req.params.id, residentInfo.resident_id);
    if (!complaint) return sendError(res, 'ไม่พบคำร้องนี้', 404);

    return sendSuccess(res, {
      ...complaint,
      first_name: residentInfo.first_name,
      last_name: residentInfo.last_name,
      house_no: residentInfo.house_no,
      phone_number: residentInfo.phone_number,
      resident_type: residentInfo.resident_type,
    });
  } catch (error) {
    logger.error('Get complaint by ID error:', error);
    return sendError(res, 'Internal server error');
  }
};

// ===== GET /api/complaints/user-info =====
export const getUserInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const info = await ComplaintService.getResidentInfo(userId);
    return sendSuccess(res, info);
  } catch (error) {
    logger.error('Get user info error:', error);
    return sendError(res, 'Internal server error');
  }
};

// ===== POST /api/complaints =====
export const createComplaint = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const residentId = await ComplaintService.getResidentId(userId);
    if (!residentId) return sendError(res, 'ไม่พบข้อมูลลูกบ้าน กรุณาติดต่อผู้ดูแลระบบ', 400);

    const result = await ComplaintService.createComplaint(residentId, req.body, userId);
    return sendSuccess(res, result, 'สร้างคำร้องสำเร็จ', 201);
  } catch (error: any) {
    logger.error('Create complaint error:', error);
    return sendError(res, error.message || 'Internal server error');
  }
};

// ===== PATCH /api/complaints/:id/status =====
export const updateComplaintStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId || !role) return sendError(res, 'Unauthorized', 401);

    const result = await ComplaintService.updateStatus(req.params.id, req.body.status, userId, role);
    return sendSuccess(res, result, 'อัปเดตสถานะสำเร็จ');
  } catch (error: any) {
    if (error.message.includes('ไม่พบ')) return sendError(res, error.message, 404);
    if (error.message.includes('ไม่สามารถเปลี่ยน')) return sendError(res, error.message, 400);
    logger.error('Update complaint status error:', error);
    return sendError(res, 'Internal server error');
  }
};

// ===== PATCH /api/complaints/:id =====
export const updateComplaint = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const residentId = await ComplaintService.getResidentId(userId);
    if (!residentId) return sendError(res, 'ไม่พบข้อมูลลูกบ้าน', 404);

    // Check ownership
    const complaint = await ComplaintModel.findByIdAndResident(req.params.id, residentId);
    if (!complaint) return sendError(res, 'ไม่พบคำร้องนี้', 404);

    const result = await ComplaintModel.update(req.params.id, req.body);
    if (!result) return sendError(res, 'Failed to update complaint');

    logger.info(`Complaint updated: ${req.params.id} by user ${userId}`);
    return sendSuccess(res, result, 'อัปเดตคำร้องสำเร็จ');
  } catch (error) {
    logger.error('Update complaint error:', error);
    return sendError(res, 'Internal server error');
  }
};

// ===== DELETE /api/complaints/:id =====
export const deleteComplaint = async (req: Request, res: Response) => {
  try {
    const success = await ComplaintModel.deleteById(req.params.id);
    if (!success) return sendError(res, 'ไม่พบคำร้องนี้', 404);

    logger.info(`Complaint deleted: ${req.params.id} by admin ${req.user?.id}`);
    return sendSuccess(res, null, 'ลบคำร้องสำเร็จ');
  } catch (error) {
    logger.error('Delete complaint error:', error);
    return sendError(res, 'Internal server error');
  }
};

// ===== GET /api/complaints/residents-list =====
export const getResidentsList = async (req: Request, res: Response) => {
  try {
    const list = await ComplaintService.getResidentsList();
    return sendSuccess(res, list);
  } catch (error) {
    logger.error('Get residents list error:', error);
    return sendError(res, 'Internal server error');
  }
};

// ===== POST /api/complaints/staff =====
export const createComplaintForStaff = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const result = await ComplaintService.createComplaintForStaff(req.body, userId);
    return sendSuccess(res, result, 'สร้างคำร้องสำเร็จ', 201);
  } catch (error: any) {
    logger.error('Staff create complaint error:', error);
    return sendError(res, error.message || 'Internal server error');
  }
};
