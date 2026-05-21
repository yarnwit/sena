import { supabase } from '../config/supabase';
import { ComplaintModel, ComplaintCreateInput, EnrichedComplaint } from '../models/Complaint.model';
import { AuditLogModel } from '../models/AuditLog.model';
import logger from '../config/logger';

// Status transition rules ตาม README.md
const STAFF_TRANSITIONS: Record<string, string[]> = {
  pending: ['in_progress', 'rejected'],
  in_progress: ['resolved', 'pending'],
};

const ADMIN_TRANSITIONS: Record<string, string[]> = {
  pending: ['in_progress', 'rejected', 'closed'],
  in_progress: ['resolved', 'pending', 'closed'],
  resolved: ['closed'],
  rejected: ['pending'],
  // admin สามารถ override ได้ทุกสถานะ
};

function generateTicketNo(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TK${y}${m}${d}-${rand}`;
}

export const ComplaintService = {
  /**
   * ดึง resident_id จาก user_id
   */
  async getResidentId(userId: string): Promise<number | null> {
    const { data } = await supabase
      .from('resident')
      .select('resident_id')
      .eq('user_id', userId)
      .single();

    return data?.resident_id || null;
  },

  /**
   * ดึงข้อมูล resident สำหรับแสดงในฟอร์ม
   */
  async getResidentInfo(userId: string) {
    const { data: userData } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('user_id', userId)
      .single();

    const { data: residentData } = await supabase
      .from('resident')
      .select('resident_id, house_no, phone_number, resident_type')
      .eq('user_id', userId)
      .single();

    return {
      first_name: userData?.first_name || '',
      last_name: userData?.last_name || '',
      house_no: residentData?.house_no || '',
      phone_number: residentData?.phone_number || '',
      resident_type: residentData?.resident_type || '',
      resident_id: residentData?.resident_id || null,
    };
  },

  /**
   * ดึงรายชื่อลูกบ้านทั้งหมด (สำหรับ staff)
   */
  async getResidentsList() {
    const { data: residents } = await supabase
      .from('resident')
      .select('resident_id, house_no, phone_number, resident_type, user_id')
      .order('house_no', { ascending: true });

    return Promise.all(
      (residents || []).map(async (r) => {
        let first_name = '';
        let last_name = '';

        if (r.user_id) {
          const { data: uData } = await supabase
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
          first_name,
          last_name,
        };
      })
    );
  },

  /**
   * สร้างคำร้องใหม่ (resident)
   */
  async createComplaint(residentId: number, input: {
    subject: string;
    description: string;
    location_written?: string | null;
    soi?: string | null;
    intake_channel?: string | null;
    reported_date?: string;
    attachment_url?: string | null;
  }, userId: string) {
    const ticketNo = generateTicketNo();

    const result = await ComplaintModel.create({
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
      await supabase.from('write_complaint').insert({
        user_id: userId,
        complaint_id: result.complaint_id,
      });
    } catch {
      // write_complaint table may not exist — don't block
    }

    // Audit log
    await AuditLogModel.create({
      user_id: userId,
      action: 'CREATE_COMPLAINT',
      entity: 'complaint',
      entity_id: String(result.complaint_id),
      details: { ticket_no: ticketNo },
    });

    logger.info(`Complaint created: ${ticketNo} by user ${userId}`);
    return result;
  },

  /**
   * สร้างคำร้องโดย staff
   */
  async createComplaintForStaff(input: {
    resident_id?: number | null;
    manual_name?: string;
    manual_house_no?: string;
    manual_phone?: string;
    subject: string;
    description: string;
    location_written?: string | null;
    soi?: string | null;
    phase?: string | null;
    intake_channel?: string | null;
    reported_date?: string;
    attachment_url?: string | null;
  }, staffUserId: string) {
    let finalResidentId: number | null = null;
    let finalDescription = input.description;

    if (input.resident_id) {
      const { data: residentData } = await supabase
        .from('resident')
        .select('resident_id')
        .eq('resident_id', input.resident_id)
        .single();

      if (!residentData) {
        throw new Error('ไม่พบข้อมูลลูกบ้านที่เลือก');
      }
      finalResidentId = residentData.resident_id;
    } else {
      if (!input.manual_name || !input.manual_house_no) {
        throw new Error('กรุณากรอกชื่อและบ้านเลขที่');
      }
      const contactInfo = `[ผู้ร้อง: ${input.manual_name} | บ้านเลขที่: ${input.manual_house_no}${input.manual_phone ? ` | โทร: ${input.manual_phone}` : ''}]\n\n`;
      finalDescription = contactInfo + input.description;
    }

    const ticketNo = generateTicketNo();

    const result = await ComplaintModel.create({
      resident_id: finalResidentId as number,
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

    await AuditLogModel.create({
      user_id: staffUserId,
      action: 'CREATE_COMPLAINT_BY_STAFF',
      entity: 'complaint',
      entity_id: String(result.complaint_id),
      details: { ticket_no: ticketNo, resident_id: finalResidentId },
    });

    logger.info(`Complaint created by staff: ${ticketNo}`);
    return result;
  },

  /**
   * ตรวจสอบสิทธิ์การเปลี่ยนสถานะ
   */
  validateStatusTransition(currentStatus: string, newStatus: string, role: string): boolean {
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
  async updateStatus(complaintId: number | string, newStatus: string, userId: string, role: string) {
    const complaint = await ComplaintModel.findById(complaintId);
    if (!complaint) {
      throw new Error('ไม่พบคำร้องนี้');
    }

    // Validate transition
    if (!this.validateStatusTransition(complaint.status, newStatus, role)) {
      throw new Error(`ไม่สามารถเปลี่ยนสถานะจาก ${complaint.status} เป็น ${newStatus} ได้`);
    }

    const result = await ComplaintModel.updateStatus(complaintId, newStatus);
    if (!result) {
      throw new Error('Failed to update status');
    }

    // Audit log
    await AuditLogModel.create({
      user_id: userId,
      action: 'UPDATE_STATUS',
      entity: 'complaint',
      entity_id: String(complaintId),
      details: { from: complaint.status, to: newStatus },
    });

    logger.info(`Complaint status updated to ${newStatus} for ID: ${complaintId} by ${role}`);
    return result;
  },

  /**
   * ดึงข้อมูล complaint พร้อมข้อมูล resident สำหรับ staff view
   */
  async getComplaintDetailForStaff(complaintId: number | string) {
    const complaint = await ComplaintModel.findById(complaintId);
    if (!complaint) return null;

    let userData = null;
    let residentData = null;

    if (complaint.resident_id) {
      const { data: rData } = await supabase
        .from('resident')
        .select('user_id, house_no, phone_number, resident_type')
        .eq('resident_id', complaint.resident_id)
        .single();
      residentData = rData;

      if (rData?.user_id) {
        const { data: uData } = await supabase
          .from('users')
          .select('first_name, last_name')
          .eq('user_id', rData.user_id)
          .single();
        userData = uData;
      }
    }

    return {
      ...complaint,
      first_name: userData?.first_name || '',
      last_name: userData?.last_name || '',
      house_no: residentData?.house_no || '',
      phone_number: residentData?.phone_number || '',
      resident_type: residentData?.resident_type || '',
    };
  },
};
