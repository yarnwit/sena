import { Request, Response } from 'express';
import { UserModel } from '../models/User.model';
import { AuditLogModel } from '../models/AuditLog.model';
import { ComplaintModel } from '../models/Complaint.model';
import { sendSuccess, sendError } from '../utils/response.util';
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

// ===== PATCH /api/admin/users/:id =====
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role, first_name, last_name } = req.body;

    if (role) {
      const success = await UserModel.updateRole(id, role);
      if (!success) return sendError(res, 'Failed to update user role');

      // Audit log
      await AuditLogModel.create({
        user_id: req.user?.id || '',
        action: 'CHANGE_ROLE',
        entity: 'user',
        entity_id: id,
        details: { new_role: role },
        ip_address: req.ip || '',
      });

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
