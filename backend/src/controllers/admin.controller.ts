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
    const users = await UserModel.findAll();

    
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

    const statusCount: Record<string, number> = {

      pending: 0,
      approved: 0,
      in_meeting: 0,
      in_progress: 0,
      resolved: 0,
      rejected: 0,
      closed: 0,
    };
    
    let todayCount = 0;
    const todayStr = new Date().toISOString().split('T')[0];

    filteredComplaints.forEach((c) => {
      if (statusCount[c.status] !== undefined) {
        statusCount[c.status]++;
      } else {
        statusCount[c.status] = 1;
      }
      
      if (c.reported_date && c.reported_date.startsWith(todayStr)) {
        todayCount++;
      }
    });

    const totalResidents = users.filter(u => u.role === 'resident').length;
    const totalStaff = users.filter(u => u.role === 'staff').length;
    const totalAdmins = users.filter(u => u.role === 'admin').length;

    const report = {
      total_complaints: filteredComplaints.length,
      total_users: users.length,
      total_residents: totalResidents,
      total_staff: totalStaff,
      total_admins: totalAdmins,
      pending: statusCount.pending,
      approved: statusCount.approved,
      in_meeting: statusCount.in_meeting,
      in_progress: statusCount.in_progress,
      resolved: statusCount.resolved,
      rejected: statusCount.rejected,
      closed: statusCount.closed,
      today: todayCount,
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

// ===== GET /api/admin/settings =====
export const getSystemSettings = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('system_settings').select('*').single();
    
    // PGRST116 means zero rows returned from single()
    if (error && error.code !== 'PGRST116') {
      logger.error('Get system settings error:', error);
      return sendError(res, 'Internal server error');
    }
    
    return sendSuccess(res, data || { is_maintenance: false });
  } catch (error) {
    logger.error('Get system settings exception:', error);
    return sendError(res, 'Internal server error');
  }
};

// ===== PUT /api/admin/settings =====
export const updateSystemSettings = async (req: Request, res: Response) => {
  try {
    const { is_maintenance } = req.body;
    
    // Check if row exists
    const { data: existingData } = await supabase.from('system_settings').select('id').single();
    
    let result;
    if (existingData) {
      result = await supabase.from('system_settings')
        .update({ 
          is_maintenance, 
          updated_by: req.user?.id, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', existingData.id)
        .select()
        .single();
    } else {
      result = await supabase.from('system_settings')
        .insert({ 
          id: 1, 
          is_maintenance, 
          updated_by: req.user?.id 
        })
        .select()
        .single();
    }

    if (result.error) {
      logger.error('Update system settings error:', result.error);
      return sendError(res, 'Failed to update settings');
    }

    // Audit log
    try {
      await AuditLogModel.create({
        user_id: req.user?.id || '',
        action: 'UPDATE_SYSTEM_SETTINGS',
        entity: 'system_settings',
        entity_id: '1',
        details: { is_maintenance },
        ip_address: req.ip || '',
      });
    } catch (logErr) {
      logger.error('Audit log error (non-critical):', logErr);
    }

    return sendSuccess(res, result.data, 'อัปเดตการตั้งค่าระบบสำเร็จ');
  } catch (error) {
    logger.error('Update system settings exception:', error);
    return sendError(res, 'Internal server error');
  }
};
