import { Request, Response } from 'express';
import { ComplaintModel } from '../models/Complaint.model';
import { ComplaintService } from '../services/complaint.service';
import { AuditLogModel } from '../models/AuditLog.model';
import { sendSuccess, sendError } from '../utils/response.util';
import { UploadService } from '../services/upload.service';
import logger from '../config/logger';
import { supabase } from '../config/supabase';

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
    
    const filter = req.query.filter as string;
    let filteredComplaints = complaints;
    const now = new Date();
    
    if (filter === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      filteredComplaints = complaints.filter(c => c.reported_date && c.reported_date.startsWith(todayStr));
    } else if (filter === 'week') {
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredComplaints = complaints.filter(c => c.reported_date && new Date(c.reported_date) >= lastWeek);
    } else if (filter === 'month') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      filteredComplaints = complaints.filter(c => c.reported_date && new Date(c.reported_date) >= lastMonth);
    }

    const enriched = await ComplaintModel.enrichMany(filteredComplaints);

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

    const reviewer_name = await ComplaintService.getReviewerName(req.params.id);

    return sendSuccess(res, {
      ...complaint,
      first_name: residentInfo.first_name,
      last_name: residentInfo.last_name,
      house_no: residentInfo.house_no,
      phone_number: residentInfo.phone_number,
      resident_type: residentInfo.resident_type,
      phase: (complaint as any).phase || residentInfo.phase,
      soi: (complaint as any).soi || residentInfo.soi,
      reviewer_name,
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

    let residentId = await ComplaintService.getResidentId(userId);
    
    // ถ้ายังไม่มี resident record ให้สร้างอัตโนมัติจากข้อมูล user
    if (!residentId) {
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('first_name, last_name')
          .eq('user_id', userId)
          .single();

        if (!userData) {
          return sendError(res, 'ไม่พบข้อมูลผู้ใช้งาน', 400);
        }

        const { data: newResident, error: insertError } = await supabase
          .from('resident')
          .insert({
            user_id: userId,
            house_no: '',
            phone_number: '',
            resident_type: 'owner',
          })
          .select('resident_id')
          .single();

        if (insertError) {
          logger.error('Auto-create resident error:', insertError);
          return sendError(res, 'ไม่พบข้อมูลลูกบ้าน กรุณาติดต่อผู้ดูแลระบบ', 400);
        }

        residentId = newResident.resident_id;
        logger.info(`Auto-created resident record for user ${userId}, resident_id: ${residentId}`);
      } catch (autoCreateError) {
        logger.error('Auto-create resident error:', autoCreateError);
        return sendError(res, 'ไม่พบข้อมูลลูกบ้าน กรุณาติดต่อผู้ดูแลระบบ', 400);
      }
    }

    if (req.file) {
      const ext = req.file.originalname.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const url = await UploadService.uploadFile('attachments', `complaints/${fileName}`, req.file.buffer, req.file.mimetype);
      if (url) req.body.attachment_url = url;
    }

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

    const { status, petition } = req.body;
    const result = await ComplaintService.updateStatus(req.params.id, status, userId, role, petition);
    return sendSuccess(res, result, 'อัปเดตสถานะสำเร็จ');
  } catch (error: any) {
    if (error.message.includes('ไม่พบ')) return sendError(res, error.message, 404);
    if (error.message.includes('ไม่สามารถเปลี่ยน')) return sendError(res, error.message, 400);
    logger.error('Update complaint status error:', error);
    return sendError(res, 'Internal server error');
  }
};

// ===== PATCH /api/complaints/staff/bulk-status =====
export const bulkUpdateComplaintStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId || !role) return sendError(res, 'Unauthorized', 401);

    const { complaintIds, status, petition } = req.body;
    
    if (!Array.isArray(complaintIds) || complaintIds.length === 0) {
      return sendError(res, 'กรุณาระบุรายการคำร้องที่ต้องการอัปเดต', 400);
    }
    
    if (!status) {
      return sendError(res, 'กรุณาระบุสถานะที่ต้องการเปลี่ยน', 400);
    }

    const result = await ComplaintService.bulkUpdateStatus(complaintIds, status, userId, role, petition);
    
    // If there were any successes, we consider the request partially or fully successful
    if (result.results.length > 0) {
      return sendSuccess(res, result, `อัปเดตสำเร็จ ${result.results.length} รายการ${result.errors.length > 0 ? `, ล้มเหลว ${result.errors.length} รายการ` : ''}`);
    } else {
      return sendError(res, `ไม่สามารถอัปเดตสถานะได้เลย: ${result.errors[0]?.message}`, 400);
    }
  } catch (error: any) {
    logger.error('Bulk update complaint status error:', error);
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

    if (req.file) {
      const ext = req.file.originalname.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const url = await UploadService.uploadFile('attachments', `complaints/${fileName}`, req.file.buffer, req.file.mimetype);
      if (url) req.body.attachment_url = url;
    }

    const result = await ComplaintModel.update(req.params.id, req.body);
    if (!result) return sendError(res, 'Failed to update complaint');

    // --- Audit Log for Complaint Update ---
    try {
      const updatedFields = Object.keys(req.body);
      const oldData: any = {};
      const newData: any = {};
      
      updatedFields.forEach(key => {
        oldData[key] = (complaint as any)[key];
        newData[key] = req.body[key];
      });

      await AuditLogModel.create({
        user_id: userId,
        action: 'UPDATE_COMPLAINT',
        entity: 'complaint',
        entity_id: req.params.id,
        details: { from: oldData, to: newData },
        ip_address: req.ip
      });
    } catch (err) {
      logger.error('Failed to insert audit log for update:', err);
    }



    logger.info(`Complaint updated: ${req.params.id} by user ${userId}`);
    return sendSuccess(res, result, 'อัปเดตคำร้องสำเร็จ');
  } catch (error) {
    logger.error('Update complaint error:', error);
    return sendError(res, 'Internal server error');
  }
};

// ===== PATCH /api/complaints/staff/:id =====
export const updateComplaintByStaff = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    // Staff/Admin ไม่ต้องตรวจ ownership — จัดการได้ทุกเรื่อง
    const complaint = await ComplaintModel.findById(req.params.id);
    if (!complaint) return sendError(res, 'ไม่พบคำร้องนี้', 404);

    if (req.file) {
      const ext = req.file.originalname.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const url = await UploadService.uploadFile('attachments', `complaints/${fileName}`, req.file.buffer, req.file.mimetype);
      if (url) req.body.attachment_url = url;
    }

    const result = await ComplaintModel.update(req.params.id, req.body);
    if (!result) return sendError(res, 'Failed to update complaint');

    // --- Audit Log for Complaint Update ---
    try {
      const updatedFields = Object.keys(req.body);
      const oldData: any = {};
      const newData: any = {};
      
      updatedFields.forEach(key => {
        oldData[key] = (complaint as any)[key];
        newData[key] = req.body[key];
      });

      await AuditLogModel.create({
        user_id: userId,
        action: 'UPDATE_COMPLAINT_BY_STAFF',
        entity: 'complaint',
        entity_id: req.params.id,
        details: { from: oldData, to: newData },
        ip_address: req.ip
      });
    } catch (err) {
      logger.error('Failed to insert audit log for staff update:', err);
    }



    logger.info(`Complaint updated by staff: ${req.params.id} by user ${userId}`);
    return sendSuccess(res, result, 'อัปเดตคำร้องสำเร็จ');
  } catch (error) {
    logger.error('Staff update complaint error:', error);
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

    if (req.file) {
      const ext = req.file.originalname.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const url = await UploadService.uploadFile('attachments', `complaints/${fileName}`, req.file.buffer, req.file.mimetype);
      if (url) req.body.attachment_url = url;
    }

    const result = await ComplaintService.createComplaintForStaff(req.body, userId);
    


    return sendSuccess(res, result, 'สร้างคำร้องสำเร็จ', 201);
  } catch (error: any) {
    logger.error('Staff create complaint error:', error);
    return sendError(res, error.message || 'Internal server error');
  }
};
