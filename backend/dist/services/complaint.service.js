"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplaintService = void 0;
const supabase_1 = require("../config/supabase");
const Complaint_model_1 = require("../models/Complaint.model");
const AuditLog_model_1 = require("../models/AuditLog.model");
const logger_1 = __importDefault(require("../config/logger"));
// Status transition rules ตาม README.md
const STAFF_TRANSITIONS = {
    pending: ['approved', 'in_meeting', 'in_progress', 'rejected', 'resolved'],
    approved: ['pending', 'in_meeting', 'in_progress', 'rejected', 'resolved'],
    in_meeting: ['pending', 'approved', 'in_progress', 'rejected', 'resolved'],
    in_progress: ['pending', 'approved', 'in_meeting', 'resolved', 'rejected'],
    resolved: ['pending', 'approved', 'in_meeting', 'in_progress', 'rejected'],
    rejected: ['pending', 'approved', 'in_meeting', 'in_progress', 'resolved'],
};
const ADMIN_TRANSITIONS = {
    pending: ['approved', 'in_meeting', 'in_progress', 'rejected', 'resolved', 'closed'],
    approved: ['pending', 'in_meeting', 'in_progress', 'rejected', 'resolved', 'closed'],
    in_meeting: ['pending', 'approved', 'in_progress', 'rejected', 'resolved', 'closed'],
    in_progress: ['pending', 'approved', 'in_meeting', 'resolved', 'rejected', 'closed'],
    resolved: ['pending', 'approved', 'in_meeting', 'in_progress', 'rejected', 'closed'],
    rejected: ['pending', 'approved', 'in_meeting', 'in_progress', 'resolved', 'closed'],
    closed: ['pending', 'approved', 'in_meeting', 'in_progress', 'resolved', 'rejected'],
    // admin สามารถ override ได้ทุกสถานะ
};
function generateTicketNo() {
    const now = new Date();
    const y = now.getFullYear().toString().slice(-2);
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `TK${y}${m}${d}-${rand}`;
}
exports.ComplaintService = {
    /**
     * ดึง resident_id จาก user_id
     */
    async getResidentId(userId) {
        const { data } = await supabase_1.supabase
            .from('resident')
            .select('resident_id')
            .eq('user_id', userId)
            .single();
        return data?.resident_id || null;
    },
    /**
     * ดึงข้อมูล resident สำหรับแสดงในฟอร์ม
     */
    async getResidentInfo(userId) {
        const { data: userData } = await supabase_1.supabase
            .from('users')
            .select('first_name, last_name')
            .eq('user_id', userId)
            .single();
        const { data: residentData } = await supabase_1.supabase
            .from('resident')
            .select('resident_id, house_no, phone_number, resident_type, phase, soi')
            .eq('user_id', userId)
            .single();
        return {
            first_name: userData?.first_name || '',
            last_name: userData?.last_name || '',
            house_no: residentData?.house_no || '',
            phone_number: residentData?.phone_number || '',
            resident_type: residentData?.resident_type || '',
            phase: residentData?.phase || '',
            soi: residentData?.soi || '',
            resident_id: residentData?.resident_id || null,
        };
    },
    /**
     * ดึงรายชื่อลูกบ้านทั้งหมด (สำหรับ staff)
     */
    async getResidentsList() {
        const { data: residents } = await supabase_1.supabase
            .from('resident')
            .select('resident_id, house_no, phone_number, resident_type, phase, soi, user_id')
            .order('house_no', { ascending: true });
        return Promise.all((residents || []).map(async (r) => {
            let first_name = '';
            let last_name = '';
            if (r.user_id) {
                const { data: uData } = await supabase_1.supabase
                    .from('users')
                    .select('first_name, last_name')
                    .eq('user_id', r.user_id)
                    .single();
                if (uData) {
                    first_name = uData.first_name || '';
                    last_name = uData.last_name || '';
                }
            }
            return {
                resident_id: r.resident_id,
                house_no: r.house_no || '',
                phone_number: r.phone_number || '',
                resident_type: r.resident_type || '',
                phase: r.phase || '',
                soi: r.soi || '',
                first_name,
                last_name,
            };
        }));
    },
    /**
     * สร้างคำร้องใหม่ (resident)
     */
    async createComplaint(residentId, input, userId) {
        const ticketNo = generateTicketNo();
        const result = await Complaint_model_1.ComplaintModel.create({
            resident_id: residentId,
            ticket_no: ticketNo,
            subject: input.subject,
            description: input.description,
            reported_date: input.reported_date,
            location_written: input.location_written,
            soi: input.soi,
            intake_channel: input.intake_channel,
            attachment_url: input.attachment_url,
        });
        if (!result) {
            throw new Error('Failed to create complaint');
        }
        // Write to junction table
        try {
            await supabase_1.supabase.from('write_complaint').insert({
                user_id: userId,
                complaint_id: result.complaint_id,
            });
        }
        catch {
            // write_complaint table may not exist — don't block
        }
        // Audit log
        await AuditLog_model_1.AuditLogModel.create({
            user_id: userId,
            action: 'CREATE_COMPLAINT',
            entity: 'complaint',
            entity_id: String(result.complaint_id),
            details: { ticket_no: ticketNo },
        });
        logger_1.default.info(`Complaint created: ${ticketNo} by user ${userId}`);
        return result;
    },
    /**
     * สร้างคำร้องโดย staff
     */
    async createComplaintForStaff(input, staffUserId) {
        let finalResidentId = null;
        let finalDescription = input.description;
        if (input.resident_id) {
            const { data: residentData } = await supabase_1.supabase
                .from('resident')
                .select('resident_id')
                .eq('resident_id', input.resident_id)
                .single();
            if (!residentData) {
                throw new Error('ไม่พบข้อมูลลูกบ้านที่เลือก');
            }
            finalResidentId = residentData.resident_id;
        }
        else {
            if (!input.manual_name || !input.manual_house_no) {
                throw new Error('กรุณากรอกชื่อและบ้านเลขที่');
            }
            const contactInfo = `[ผู้ร้อง: ${input.manual_name} | บ้านเลขที่: ${input.manual_house_no}${input.manual_phone ? ` | โทร: ${input.manual_phone}` : ''}]\n\n`;
            finalDescription = contactInfo + input.description;
        }
        const ticketNo = generateTicketNo();
        const result = await Complaint_model_1.ComplaintModel.create({
            resident_id: finalResidentId,
            ticket_no: ticketNo,
            subject: input.subject,
            description: finalDescription,
            reported_date: input.reported_date,
            location_written: input.location_written,
            soi: input.soi,
            intake_channel: input.intake_channel,
            attachment_url: input.attachment_url,
            phase: input.phase,
        });
        if (!result) {
            throw new Error('Failed to create complaint');
        }
        await AuditLog_model_1.AuditLogModel.create({
            user_id: staffUserId,
            action: 'CREATE_COMPLAINT_BY_STAFF',
            entity: 'complaint',
            entity_id: String(result.complaint_id),
            details: { ticket_no: ticketNo, resident_id: finalResidentId },
        });
        logger_1.default.info(`Complaint created by staff: ${ticketNo}`);
        return result;
    },
    /**
     * ตรวจสอบสิทธิ์การเปลี่ยนสถานะ
     */
    validateStatusTransition(currentStatus, newStatus, role) {
        if (role === 'admin') {
            // Admin can override any status
            return true;
        }
        if (role === 'staff') {
            const allowed = STAFF_TRANSITIONS[currentStatus];
            return allowed ? allowed.includes(newStatus) : false;
        }
        // resident ไม่สามารถเปลี่ยนสถานะได้
        return false;
    },
    /**
     * อัปเดตสถานะ complaint (staff/admin)
     */
    async updateStatus(complaintId, newStatus, userId, role, petition) {
        const complaint = await Complaint_model_1.ComplaintModel.findById(complaintId);
        if (!complaint) {
            throw new Error('ไม่พบคำร้องนี้');
        }
        // Validate transition
        if (!this.validateStatusTransition(complaint.status, newStatus, role)) {
            throw new Error(`ไม่สามารถเปลี่ยนสถานะจาก ${complaint.status} เป็น ${newStatus} ได้`);
        }
        const result = await Complaint_model_1.ComplaintModel.updateStatus(complaintId, newStatus, petition);
        if (!result) {
            throw new Error('Failed to update status');
        }
        // Audit log
        await AuditLog_model_1.AuditLogModel.create({
            user_id: userId,
            action: 'UPDATE_STATUS',
            entity: 'complaint',
            entity_id: String(complaintId),
            details: { from: complaint.status, to: newStatus },
        });
        logger_1.default.info(`Complaint status updated to ${newStatus} for ID: ${complaintId} by ${role}`);
        return result;
    },
    /**
     * อัปเดตสถานะ complaint แบบหลายรายการพร้อมกัน (staff/admin)
     */
    async bulkUpdateStatus(complaintIds, newStatus, userId, role, petition) {
        const results = [];
        const errors = [];
        for (const complaintId of complaintIds) {
            try {
                const result = await this.updateStatus(complaintId, newStatus, userId, role, petition);
                results.push(result);
            }
            catch (err) {
                errors.push({ complaintId, message: err.message });
            }
        }
        return { results, errors };
    },
    /**
     * ดึงชื่อผู้เปลี่ยนสถานะล่าสุด
     */
    async getReviewerName(complaintId) {
        const logs = await AuditLog_model_1.AuditLogModel.findByEntity('complaint', String(complaintId));
        const updateLog = logs.find(log => log.action === 'UPDATE_STATUS');
        if (!updateLog)
            return null;
        const { data: userData } = await supabase_1.supabase
            .from('users')
            .select('first_name, last_name')
            .eq('user_id', updateLog.user_id)
            .single();
        if (userData) {
            return `${userData.first_name} ${userData.last_name}`.trim();
        }
        return null;
    },
    /**
     * ดึงข้อมูล complaint พร้อมข้อมูล resident สำหรับ staff view
     */
    async getComplaintDetailForStaff(complaintId) {
        const complaint = await Complaint_model_1.ComplaintModel.findById(complaintId);
        if (!complaint)
            return null;
        let userData = null;
        let residentData = null;
        if (complaint.resident_id) {
            const { data: rData } = await supabase_1.supabase
                .from('resident')
                .select('user_id, house_no, phone_number, resident_type, phase, soi')
                .eq('resident_id', complaint.resident_id)
                .single();
            residentData = rData;
            if (rData?.user_id) {
                const { data: uData } = await supabase_1.supabase
                    .from('users')
                    .select('first_name, last_name')
                    .eq('user_id', rData.user_id)
                    .single();
                userData = uData;
            }
        }
        else if (complaint.description && complaint.description.startsWith('[ผู้ร้อง:')) {
            const match = complaint.description.match(/^\[ผู้ร้อง:\s*(.*?)\s*\|\s*บ้านเลขที่:\s*([^\]|]+)/);
            if (match) {
                const fullName = match[1].trim();
                const parts = fullName.split(' ');
                userData = { first_name: parts[0], last_name: parts.slice(1).join(' ') };
                residentData = { house_no: match[2].trim() };
            }
        }
        const reviewer_name = await this.getReviewerName(complaintId);
        return {
            ...complaint,
            first_name: userData?.first_name || '',
            last_name: userData?.last_name || '',
            house_no: residentData?.house_no || '',
            phone_number: residentData?.phone_number || '',
            resident_type: residentData?.resident_type || '',
            phase: complaint.phase || residentData?.phase || '',
            soi: complaint.soi || residentData?.soi || '',
            reviewer_name,
        };
    },
};
