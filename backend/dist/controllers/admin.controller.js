"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSystemSettings = exports.getSystemSettings = exports.getAuditLogs = exports.getReports = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUsers = void 0;
const User_model_1 = require("../models/User.model");
const auth_service_1 = require("../services/auth.service");
const AuditLog_model_1 = require("../models/AuditLog.model");
const Complaint_model_1 = require("../models/Complaint.model");
const response_util_1 = require("../utils/response.util");
const hash_util_1 = require("../utils/hash.util");
const supabase_1 = require("../config/supabase");
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = __importDefault(require("../config/logger"));
// ===== GET /api/admin/users =====
const getUsers = async (req, res) => {
    try {
        const users = await User_model_1.UserModel.findAll();
        return (0, response_util_1.sendSuccess)(res, users);
    }
    catch (error) {
        logger_1.default.error('Get users error:', error);
        return (0, response_util_1.sendError)(res, 'Internal server error');
    }
};
exports.getUsers = getUsers;
// ===== POST /api/admin/users =====
const createUser = async (req, res) => {
    try {
        const { username, password, first_name, last_name, role, house_no, phase, soi, phone_number, resident_type } = req.body;
        if (!username || !password || !first_name || !last_name) {
            return (0, response_util_1.sendError)(res, 'ข้อมูลไม่ครบถ้วน', 400);
        }
        if (role === 'resident' && !house_no) {
            return (0, response_util_1.sendError)(res, 'กรุณาระบุบ้านเลขที่สำหรับลูกบ้าน', 400);
        }
        // Checking if username exists first to give better error message
        const existingUser = await User_model_1.UserModel.findByUsername(username);
        if (existingUser) {
            return (0, response_util_1.sendError)(res, 'ชื่อผู้ใช้งานนี้มีในระบบแล้ว', 400);
        }
        // Create user manually in database without touching Supabase Auth
        const userId = crypto_1.default.randomUUID();
        const hashedPassword = await (0, hash_util_1.hashPassword)(password);
        const { error: insertUserError } = await supabase_1.supabase.from('users').insert({
            user_id: userId,
            username,
            first_name,
            last_name,
            role: role || 'resident',
            password_hash: hashedPassword
        });
        if (insertUserError) {
            logger_1.default.error('Error inserting user manually:', insertUserError);
            return (0, response_util_1.sendError)(res, 'เกิดข้อผิดพลาดในการสร้างบัญชีผู้ใช้');
        }
        if (role === 'resident') {
            const { error: insertResidentError } = await supabase_1.supabase.from('resident').insert({
                user_id: userId,
                house_no,
                phone_number,
                resident_type: resident_type || 'owner',
                phase,
                soi,
            });
            if (insertResidentError) {
                logger_1.default.error('Error inserting resident manually:', insertResidentError);
                // We could delete the user here, but for now just return error
                return (0, response_util_1.sendError)(res, 'เกิดข้อผิดพลาดในการบันทึกข้อมูลลูกบ้าน');
            }
        }
        // Audit log (non-blocking)
        try {
            await AuditLog_model_1.AuditLogModel.create({
                user_id: req.user?.id || '',
                action: 'CREATE_USER',
                entity: 'user',
                entity_id: username,
                details: { role, username },
                ip_address: req.ip || '',
            });
        }
        catch (logErr) {
            logger_1.default.error('Audit log error (non-critical):', logErr);
        }
        logger_1.default.info(`Admin ${req.user?.id} created new user: ${username}`);
        return (0, response_util_1.sendSuccess)(res, null, 'สร้างผู้ใช้งานสำเร็จ');
    }
    catch (error) {
        logger_1.default.error('Create user error:', error);
        return (0, response_util_1.sendError)(res, error.message || 'เกิดข้อผิดพลาดในการสร้างผู้ใช้');
    }
};
exports.createUser = createUser;
// ===== PATCH /api/admin/users/:id =====
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, first_name, last_name } = req.body;
        if (role) {
            const success = await User_model_1.UserModel.updateRole(id, role);
            if (!success)
                return (0, response_util_1.sendError)(res, 'Failed to update user role');
            // Audit log (non-blocking)
            try {
                await AuditLog_model_1.AuditLogModel.create({
                    user_id: req.user?.id || '',
                    action: 'CHANGE_ROLE',
                    entity: 'user',
                    entity_id: id,
                    details: { new_role: role },
                    ip_address: req.ip || '',
                });
            }
            catch (logErr) {
                logger_1.default.error('Audit log error (non-critical):', logErr);
            }
            logger_1.default.info(`User ${id} role changed to ${role} by admin ${req.user?.id}`);
        }
        if (first_name || last_name) {
            const success = await User_model_1.UserModel.updateProfile(id, {
                ...(first_name && { first_name }),
                ...(last_name && { last_name }),
            });
            if (!success)
                return (0, response_util_1.sendError)(res, 'Failed to update user profile');
        }
        return (0, response_util_1.sendSuccess)(res, null, 'อัปเดตผู้ใช้สำเร็จ');
    }
    catch (error) {
        logger_1.default.error('Update user error:', error);
        return (0, response_util_1.sendError)(res, 'Internal server error');
    }
};
exports.updateUser = updateUser;
// ===== DELETE /api/admin/users/:id =====
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if user exists
        const user = await User_model_1.UserModel.findById(id);
        if (!user) {
            return (0, response_util_1.sendError)(res, 'User not found', 404);
        }
        // Call AuthService.deleteAccount which deletes Resident, UserModel, and Supabase Auth
        await auth_service_1.AuthService.deleteAccount(id);
        // Audit log (non-blocking)
        try {
            await AuditLog_model_1.AuditLogModel.create({
                user_id: req.user?.id || '',
                action: 'DELETE_USER',
                entity: 'user',
                entity_id: id,
                details: { deleted_username: user.username },
                ip_address: req.ip || '',
            });
        }
        catch (logErr) {
            logger_1.default.error('Audit log error (non-critical):', logErr);
        }
        logger_1.default.info(`User ${id} deleted by admin ${req.user?.id}`);
        return (0, response_util_1.sendSuccess)(res, null, 'ลบผู้ใช้งานสำเร็จ');
    }
    catch (error) {
        logger_1.default.error('Delete user error:', error);
        return (0, response_util_1.sendError)(res, 'Internal server error');
    }
};
exports.deleteUser = deleteUser;
// ===== GET /api/admin/reports =====
const getReports = async (req, res) => {
    try {
        const complaints = await Complaint_model_1.ComplaintModel.findAll();
        const users = await User_model_1.UserModel.findAll();
        const filter = req.query.filter;
        let filteredComplaints = complaints;
        const now = new Date();
        if (filter === 'today') {
            const todayStr = now.toISOString().split('T')[0];
            filteredComplaints = complaints.filter(c => c.reported_date && c.reported_date.startsWith(todayStr));
        }
        else if (filter === 'week') {
            const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            filteredComplaints = complaints.filter(c => c.reported_date && new Date(c.reported_date) >= lastWeek);
        }
        else if (filter === 'month') {
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            filteredComplaints = complaints.filter(c => c.reported_date && new Date(c.reported_date) >= lastMonth);
        }
        const statusCount = {
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
            }
            else {
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
        return (0, response_util_1.sendSuccess)(res, report);
    }
    catch (error) {
        logger_1.default.error('Get reports error:', error);
        return (0, response_util_1.sendError)(res, 'Internal server error');
    }
};
exports.getReports = getReports;
// ===== GET /api/admin/logs =====
const getAuditLogs = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;
        const logs = await AuditLog_model_1.AuditLogModel.findAll(limit, offset);
        return (0, response_util_1.sendSuccess)(res, logs);
    }
    catch (error) {
        logger_1.default.error('Get audit logs error:', error);
        return (0, response_util_1.sendError)(res, 'Internal server error');
    }
};
exports.getAuditLogs = getAuditLogs;
// ===== GET /api/admin/settings =====
const getSystemSettings = async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabase.from('system_settings').select('*').single();
        // PGRST116 means zero rows returned from single()
        if (error && error.code !== 'PGRST116') {
            logger_1.default.error('Get system settings error:', error);
            return (0, response_util_1.sendError)(res, 'Internal server error');
        }
        return (0, response_util_1.sendSuccess)(res, data || { is_maintenance: false });
    }
    catch (error) {
        logger_1.default.error('Get system settings exception:', error);
        return (0, response_util_1.sendError)(res, 'Internal server error');
    }
};
exports.getSystemSettings = getSystemSettings;
// ===== PUT /api/admin/settings =====
const updateSystemSettings = async (req, res) => {
    try {
        const { is_maintenance } = req.body;
        // Check if row exists
        const { data: existingData } = await supabase_1.supabase.from('system_settings').select('id').single();
        let result;
        if (existingData) {
            result = await supabase_1.supabase.from('system_settings')
                .update({
                is_maintenance,
                updated_by: req.user?.id,
                updated_at: new Date().toISOString()
            })
                .eq('id', existingData.id)
                .select()
                .single();
        }
        else {
            result = await supabase_1.supabase.from('system_settings')
                .insert({
                id: 1,
                is_maintenance,
                updated_by: req.user?.id
            })
                .select()
                .single();
        }
        if (result.error) {
            logger_1.default.error('Update system settings error:', result.error);
            return (0, response_util_1.sendError)(res, 'Failed to update settings');
        }
        // Audit log
        try {
            await AuditLog_model_1.AuditLogModel.create({
                user_id: req.user?.id || '',
                action: 'UPDATE_SYSTEM_SETTINGS',
                entity: 'system_settings',
                entity_id: '1',
                details: { is_maintenance },
                ip_address: req.ip || '',
            });
        }
        catch (logErr) {
            logger_1.default.error('Audit log error (non-critical):', logErr);
        }
        return (0, response_util_1.sendSuccess)(res, result.data, 'อัปเดตการตั้งค่าระบบสำเร็จ');
    }
    catch (error) {
        logger_1.default.error('Update system settings exception:', error);
        return (0, response_util_1.sendError)(res, 'Internal server error');
    }
};
exports.updateSystemSettings = updateSystemSettings;
