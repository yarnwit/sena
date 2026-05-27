import { Request, Response } from 'express';
import { UserModel } from '../models/User.model';
import { AuthService } from '../services/auth.service';
import { AuditLogModel } from '../models/AuditLog.model';
import { ComplaintModel } from '../models/Complaint.model';
import { sendSuccess, sendError } from '../utils/response.util';
import { hashPassword } from '../utils/hash.util';
import { supabase } from '../config/supabase';
import crypto from 'crypto';
import logger from '../config/logger';

// ===== GET /api/admin/users =====
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.findAll();
    return sendSuccess(res, users);
  } catch (error) {
    logger.error('Get users error:', error);
    return sendError(res, 'Internal server error');
  }
};

// ===== POST /api/admin/users =====
export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, password, first_name, last_name, role, house_no, phase, soi, phone_number, resident_type } = req.body;

    if (!username || !password || !first_name || !last_name) {
      return sendError(res, 'ข้อมูลไม่ครบถ้วน', 400);
    }

    if (role === 'resident' && !house_no) {
      return sendError(res, 'กรุณาระบุบ้านเลขที่สำหรับลูกบ้าน', 400);
    }

    // Checking if username exists first to give better error message
    const existingUser = await UserModel.findByUsername(username);
    if (existingUser) {
      return sendError(res, 'ชื่อผู้ใช้งานนี้มีในระบบแล้ว', 400);
    }

    // Create user manually in database without touching Supabase Auth
    const userId = crypto.randomUUID();
    const hashedPassword = await hashPassword(password);

    const { error: insertUserError } = await supabase.from('users').insert({
      user_id: userId,
      username,
      first_name,
      last_name,
      role: role || 'resident',
      password_hash: hashedPassword
    });

    if (insertUserError) {
      logger.error('Error inserting user manually:', insertUserError);
      return sendError(res, 'เกิดข้อผิดพลาดในการสร้างบัญชีผู้ใช้');
    }

    if (role === 'resident') {
      const { error: insertResidentError } = await supabase.from('resident').insert({
        user_id: userId,
        house_no,
        phone_number,
        resident_type: resident_type || 'owner',
        phase,
        soi,
      });

      if (insertResidentError) {
        logger.error('Error inserting resident manually:', insertResidentError);
        // We could delete the user here, but for now just return error
        return sendError(res, 'เกิดข้อผิดพลาดในการบันทึกข้อมูลลูกบ้าน');
      }
    }

    // Audit log (non-blocking)
    try {
      await AuditLogModel.create({
        user_id: req.user?.id || '',
        action: 'CREATE_USER',
        entity: 'user',
        entity_id: username,
        details: { role, username },
        ip_address: req.ip || '',
      });
    } catch (logErr) {
      logger.error('Audit log error (non-critical):', logErr);
    }

    logger.info(`Admin ${req.user?.id} created new user: ${username}`);
    return sendSuccess(res, null, 'สร้างผู้ใช้งานสำเร็จ');
  } catch (error: any) {
    logger.error('Create user error:', error);
    return sendError(res, error.message || 'เกิดข้อผิดพลาดในการสร้างผู้ใช้');
  }
};

// ===== PATCH /api/admin/users/:id =====
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role, first_name, last_name } = req.body;

    if (role) {
      const success = await UserModel.updateRole(id, role);
      if (!success) return sendError(res, 'Failed to update user role');

      // Audit log (non-blocking)
      try {
        await AuditLogModel.create({
          user_id: req.user?.id || '',
          action: 'CHANGE_ROLE',
          entity: 'user',
          entity_id: id,
          details: { new_role: role },
          ip_address: req.ip || '',
        });
      } catch (logErr) {
        logger.error('Audit log error (non-critical):', logErr);
      }

      logger.info(`User ${id} role changed to ${role} by admin ${req.user?.id}`);
    }

    if (first_name || last_name) {
      const success = await UserModel.updateProfile(id, {
        ...(first_name && { first_name }),
        ...(last_name && { last_name }),
      });
      if (!success) return sendError(res, 'Failed to update user profile');
    }

    return sendSuccess(res, null, 'อัปเดตผู้ใช้สำเร็จ');
  } catch (error) {
    logger.error('Update user error:', error);
    return sendError(res, 'Internal server error');
  }
};

// ===== DELETE /api/admin/users/:id =====
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await UserModel.findById(id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Call AuthService.deleteAccount which deletes Resident, UserModel, and Supabase Auth
    await AuthService.deleteAccount(id);

    // Audit log (non-blocking)
    try {
      await AuditLogModel.create({
        user_id: req.user?.id || '',
        action: 'DELETE_USER',
        entity: 'user',
        entity_id: id,
        details: { deleted_username: user.username },
        ip_address: req.ip || '',
      });
    } catch (logErr) {
      logger.error('Audit log error (non-critical):', logErr);
    }

    logger.info(`User ${id} deleted by admin ${req.user?.id}`);
    return sendSuccess(res, null, 'ลบผู้ใช้งานสำเร็จ');
  } catch (error) {
    logger.error('Delete user error:', error);
    return sendError(res, 'Internal server error');
  }
};

// ===== GET /api/admin/reports =====
export const getReports = async (req: Request, res: Response) => {
  try {
    const complaints = await ComplaintModel.findAll();

    const statusCount: Record<string, number> = {};
    complaints.forEach((c) => {
      statusCount[c.status] = (statusCount[c.status] || 0) + 1;
    });

    const report = {
      total_complaints: complaints.length,
      status_summary: statusCount,
      recent_complaints: complaints.slice(0, 10),
    };

    return sendSuccess(res, report);
  } catch (error) {
    logger.error('Get reports error:', error);
    return sendError(res, 'Internal server error');
  }
};

// ===== GET /api/admin/logs =====
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;

    const logs = await AuditLogModel.findAll(limit, offset);
    return sendSuccess(res, logs);
  } catch (error) {
    logger.error('Get audit logs error:', error);
    return sendError(res, 'Internal server error');
  }
};
