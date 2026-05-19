import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import logger from '../config/logger';

// สร้าง ticket number อัตโนมัติ
function generateTicketNo() {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TK${y}${m}${d}-${rand}`;
}

// ===== GET /api/complaints/my — ดึงคำร้องทั้งหมดของลูกบ้าน =====
export const getMyComplaints = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // ดึง resident_id
    const { data: residentData } = await supabase
      .from('resident')
      .select('resident_id')
      .eq('user_id', userId)
      .single();

    if (!residentData) {
      return res.status(200).json({ success: true, data: [] });
    }

    const { data: complaints, error } = await supabase
      .from('complaints')
      .select('complaint_id, ticket_no, subject, status, reported_date, description')
      .eq('resident_id', residentData.resident_id)
      .order('reported_date', { ascending: false });

    if (error) {
      logger.error('Get complaints error:', error.message);
      return res.status(500).json({ success: false, message: error.message });
    }

    res.status(200).json({ success: true, data: complaints || [] });
  } catch (error) {
    logger.error('Get complaints error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ===== GET /api/complaints/all — ดึงคำร้องทั้งหมดสำหรับ staff/admin =====
export const getAllComplaints = async (req: Request, res: Response) => {
  try {
    const { data: complaints, error } = await supabase
      .from('complaints')
      .select('complaint_id, ticket_no, subject, status, reported_date, location_written, soi, phase, description, attachment_url, intake_channel, petition, resident_id')
      .order('reported_date', { ascending: false });

    if (error) {
      logger.error('Get all complaints error:', error.message);
      return res.status(500).json({ success: false, message: error.message });
    }

    // ดึงข้อมูลลูกบ้าน (house_no) และชื่อ-นามสกุล ผ่าน resident → users
    const enrichedComplaints = await Promise.all(
      (complaints || []).map(async (complaint) => {
        let house_no = '';
        let first_name = '';
        let last_name = '';

        if (complaint.resident_id) {
          const { data: rData } = await supabase
            .from('resident')
            .select('house_no, user_id')
            .eq('resident_id', complaint.resident_id)
            .single();

          if (rData) {
            house_no = rData.house_no || '';

            if (rData.user_id) {
              const { data: uData } = await supabase
                .from('users')
                .select('first_name, last_name')
                .eq('user_id', rData.user_id)
                .single();

              if (uData) {
                first_name = uData.first_name || '';
                last_name = uData.last_name || '';
              }
            }
          }
        }

        const { resident_id, ...rest } = complaint;
        return { ...rest, house_no, first_name, last_name };
      })
    );

    res.status(200).json({ success: true, data: enrichedComplaints });
  } catch (error) {
    logger.error('Get all complaints error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ===== GET /api/complaints/staff/:id — ดึงคำร้องตาม ID สำหรับ staff/admin =====
export const getComplaintByIdForStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: complaint, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('complaint_id', id)
      .single();

    if (error || !complaint) {
      return res.status(404).json({ success: false, message: 'ไม่พบคำร้องนี้' });
    }

    // ดึงข้อมูลลูกบ้าน
    let userData = null;
    let residentData = null;
    
    if (complaint.resident_id) {
      const { data: rData } = await supabase
        .from('resident')
        .select('user_id, house_no, phone_number, resident_type')
        .eq('resident_id', complaint.resident_id)
        .single();
      residentData = rData;
      
      if (rData && rData.user_id) {
        const { data: uData } = await supabase
          .from('users')
          .select('first_name, last_name')
          .eq('user_id', rData.user_id)
          .single();
        userData = uData;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...complaint,
        first_name: userData?.first_name || '',
        last_name: userData?.last_name || '',
        house_no: residentData?.house_no || '',
        phone_number: residentData?.phone_number || '',
        resident_type: residentData?.resident_type || '',
      },
    });
  } catch (error) {
    logger.error('Get complaint by ID for staff error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ===== GET /api/complaints/:id — ดึงคำร้องตาม ID พร้อมข้อมูลลูกบ้าน (สำหรับ resident) =====
export const getComplaintById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;

    // ดึง resident_id ของผู้ใช้ที่ login
    const { data: residentData } = await supabase
      .from('resident')
      .select('resident_id, house_no, phone_number, resident_type')
      .eq('user_id', userId)
      .single();

    if (!residentData) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลลูกบ้าน' });
    }

    // ดึงข้อมูลคำร้อง — ตรวจสอบว่าเป็นของ resident นี้
    const { data: complaint, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('complaint_id', id)
      .eq('resident_id', residentData.resident_id)
      .single();

    if (error || !complaint) {
      return res.status(404).json({ success: false, message: 'ไม่พบคำร้องนี้' });
    }

    // ดึงชื่อ-นามสกุลจากตาราง users
    const { data: userData } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('user_id', userId)
      .single();

    res.status(200).json({
      success: true,
      data: {
        ...complaint,
        first_name: userData?.first_name || '',
        last_name: userData?.last_name || '',
        house_no: residentData.house_no || '',
        phone_number: residentData.phone_number || '',
        resident_type: residentData.resident_type || '',
      },
    });
  } catch (error) {
    logger.error('Get complaint by ID error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ===== GET /api/complaints/user-info — ดึงข้อมูลลูกบ้านสำหรับแสดงในฟอร์ม =====
export const getUserInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // ดึงจากตาราง users
    const { data: userData } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('user_id', userId)
      .single();

    // ดึงจากตาราง resident
    const { data: residentData } = await supabase
      .from('resident')
      .select('resident_id, house_no, phone_number, resident_type')
      .eq('user_id', userId)
      .single();

    res.status(200).json({
      success: true,
      data: {
        first_name: userData?.first_name || '',
        last_name: userData?.last_name || '',
        house_no: residentData?.house_no || '',
        phone_number: residentData?.phone_number || '',
        resident_type: residentData?.resident_type || '',
        resident_id: residentData?.resident_id || null,
      },
    });
  } catch (error) {
    logger.error('Get user info error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ===== POST /api/complaints — สร้างคำร้องใหม่ =====
export const createComplaint = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { subject, description, location_written, soi, intake_channel, reported_date, attachment_url } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกหัวข้อและรายละเอียด' });
    }

    // 1. ดึง resident_id
    const { data: residentData } = await supabase
      .from('resident')
      .select('resident_id')
      .eq('user_id', userId)
      .single();

    if (!residentData) {
      return res.status(400).json({ success: false, message: 'ไม่พบข้อมูลลูกบ้าน กรุณาติดต่อผู้ดูแลระบบ' });
    }

    // 2. สร้าง ticket number
    const ticketNo = generateTicketNo();

    // 3. Insert complaint
    const { data: complaintData, error: insertError } = await supabase
      .from('complaints')
      .insert({
        resident_id: residentData.resident_id,
        ticket_no: ticketNo,
        subject,
        description,
        status: 'pending',
        reported_date: reported_date || new Date().toISOString(),
        location_written: location_written || null,
        soi: soi || null,
        intake_channel: intake_channel || null,
        attachment_url: attachment_url || null,
      })
      .select('complaint_id, ticket_no')
      .single();

    if (insertError) {
      logger.error('Create complaint error:', insertError.message);
      return res.status(500).json({ success: false, message: insertError.message });
    }

    // 4. บันทึก write_complaint (junction table) — ถ้ามี
    try {
      await supabase.from('write_complaint').insert({
        user_id: userId,
        complaint_id: complaintData.complaint_id,
      });
    } catch {
      // write_complaint table อาจยังไม่มี — ไม่ block
    }

    logger.info(`Complaint created: ${ticketNo} by user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'สร้างคำร้องสำเร็จ',
      data: complaintData,
    });
  } catch (error) {
    logger.error('Create complaint error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ===== PUT /api/complaints/staff/:id/status — อัปเดตสถานะคำร้อง (สำหรับ staff/admin) =====
export const updateComplaintStatusForStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'กรุณาระบุสถานะ' });
    }

    const { data: updatedComplaint, error: updateError } = await supabase
      .from('complaints')
      .update({ status })
      .eq('complaint_id', id)
      .select()
      .single();

    if (updateError) {
      logger.error('Update complaint status error:', updateError.message);
      return res.status(500).json({ success: false, message: updateError.message });
    }

    logger.info(`Complaint status updated to ${status} for ID: ${id} by staff`);

    res.status(200).json({
      success: true,
      message: 'อัปเดตสถานะสำเร็จ',
      data: updatedComplaint,
    });
  } catch (error) {
    logger.error('Update complaint status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ===== PUT /api/complaints/:id — แก้ไขคำร้อง =====
export const updateComplaint = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;
    const { subject, description, location_written, soi, intake_channel, attachment_url } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกหัวข้อและรายละเอียด' });
    }

    // 1. ดึง resident_id
    const { data: residentData } = await supabase
      .from('resident')
      .select('resident_id')
      .eq('user_id', userId)
      .single();

    if (!residentData) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลลูกบ้าน' });
    }

    // 2. ตรวจสอบความเป็นเจ้าของและสถานะ (ให้แก้ได้เฉพาะ pending)
    const { data: complaint, error: fetchError } = await supabase
      .from('complaints')
      .select('status')
      .eq('complaint_id', id)
      .eq('resident_id', residentData.resident_id)
      .single();

    if (fetchError || !complaint) {
      return res.status(404).json({ success: false, message: 'ไม่พบคำร้องนี้' });
    }

    // Optional: จำกัดให้แก้ได้เฉพาะสถานะ pending
    // if (complaint.status !== 'pending') {
    //   return res.status(400).json({ success: false, message: 'ไม่สามารถแก้ไขคำร้องที่กำลังดำเนินการหรือเสร็จสิ้นแล้วได้' });
    // }

    // 3. Update complaint
    const { data: updatedComplaint, error: updateError } = await supabase
      .from('complaints')
      .update({
        subject,
        description,
        location_written: location_written || null,
        soi: soi || null,
        intake_channel: intake_channel || null,
        attachment_url: attachment_url || null,
      })
      .eq('complaint_id', id)
      .select()
      .single();

    if (updateError) {
      logger.error('Update complaint error:', updateError.message);
      return res.status(500).json({ success: false, message: updateError.message });
    }

    logger.info(`Complaint updated: ${id} by user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'อัปเดตคำร้องสำเร็จ',
      data: updatedComplaint,
    });
  } catch (error) {
    logger.error('Update complaint error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ===== GET /api/complaints/residents-list — ดึงรายชื่อลูกบ้านทั้งหมดสำหรับ staff เลือก =====
export const getResidentsList = async (req: Request, res: Response) => {
  try {
    // ดึงข้อมูลจากตาราง resident
    const { data: residents, error } = await supabase
      .from('resident')
      .select('resident_id, house_no, phone_number, resident_type, user_id')
      .order('house_no', { ascending: true });

    if (error) {
      logger.error('Get residents list error:', error.message);
      return res.status(500).json({ success: false, message: error.message });
    }

    // ดึงชื่อ-นามสกุลจากตาราง users
    const enrichedResidents = await Promise.all(
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

    res.status(200).json({ success: true, data: enrichedResidents });
  } catch (error) {
    logger.error('Get residents list error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ===== POST /api/complaints/staff — สร้างคำร้องโดย staff =====
// รองรับ 2 แบบ:
// แบบ 1: เลือกลูกบ้านจากระบบ → ส่ง resident_id
// แบบ 2: กรอกเอง → ส่ง manual_name, manual_house_no (resident_id = NULL)
export const createComplaintForStaff = async (req: Request, res: Response) => {
  try {
    const { resident_id, manual_name, manual_house_no, manual_phone, subject, description, location_written, soi, phase, intake_channel, reported_date, attachment_url } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกหัวข้อและรายละเอียด' });
    }

    let finalResidentId = null;
    let finalDescription = description;

    if (resident_id) {
      // แบบ 1: เลือกจากระบบ — ตรวจสอบว่า resident_id มีอยู่จริง
      const { data: residentData } = await supabase
        .from('resident')
        .select('resident_id')
        .eq('resident_id', resident_id)
        .single();

      if (!residentData) {
        return res.status(400).json({ success: false, message: 'ไม่พบข้อมูลลูกบ้านที่เลือก' });
      }
      finalResidentId = residentData.resident_id;
    } else {
      // แบบ 2: กรอกเอง — ต้องมีชื่อและบ้านเลขที่
      if (!manual_name || !manual_house_no) {
        return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อและบ้านเลขที่' });
      }
      // เก็บข้อมูลผู้ร้องไว้ใน description (ไม่แก้ DB schema)
      const contactInfo = `[ผู้ร้อง: ${manual_name} | บ้านเลขที่: ${manual_house_no}${manual_phone ? ` | โทร: ${manual_phone}` : ''}]\n\n`;
      finalDescription = contactInfo + description;
    }

    const ticketNo = generateTicketNo();

    const { data: complaintData, error: insertError } = await supabase
      .from('complaints')
      .insert({
        resident_id: finalResidentId,
        ticket_no: ticketNo,
        subject,
        description: finalDescription,
        status: 'pending',
        reported_date: reported_date || new Date().toISOString(),
        location_written: location_written || null,
        soi: soi || null,
        phase: phase || null,
        intake_channel: intake_channel || null,
        attachment_url: attachment_url || null,
      })
      .select('complaint_id, ticket_no')
      .single();

    if (insertError) {
      logger.error('Staff create complaint error:', insertError.message);
      return res.status(500).json({ success: false, message: insertError.message });
    }

    logger.info(`Complaint created by staff: ${ticketNo} ${resident_id ? `for resident ${resident_id}` : `manual: ${manual_name} (${manual_house_no})`}`);

    res.status(201).json({
      success: true,
      message: 'สร้างคำร้องสำเร็จ',
      data: complaintData,
    });
  } catch (error) {
    logger.error('Staff create complaint error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ===== POST /api/complaints/residents — สร้าง resident ใหม่โดย staff (ยังไม่มีบัญชี) =====
export const createResidentForStaff = async (req: Request, res: Response) => {
  try {
    const { house_no, first_name, last_name, phone_number, resident_type } = req.body;

    if (!house_no) {
      return res.status(400).json({ success: false, message: 'กรุณาระบุบ้านเลขที่' });
    }

    // ตรวจสอบว่ามี resident ที่ house_no ซ้ำหรือไม่
    const { data: existing } = await supabase
      .from('resident')
      .select('resident_id, house_no')
      .eq('house_no', house_no)
      .limit(1);

    if (existing && existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `บ้านเลขที่ ${house_no} มีอยู่ในระบบแล้ว กรุณาเลือกจากรายการ` 
      });
    }

    // สร้าง resident record (user_id = NULL — ยังไม่มีบัญชี)
    // เก็บชื่อ-นามสกุลไว้ในตาราง resident ชั่วคราว
    const { data: newResident, error: insertError } = await supabase
      .from('resident')
      .insert({
        user_id: null,
        house_no,
        phone_number: phone_number || null,
        resident_type: resident_type || null,
      })
      .select('resident_id, house_no, phone_number, resident_type')
      .single();

    if (insertError) {
      logger.error('Create resident for staff error:', insertError.message);
      return res.status(500).json({ success: false, message: insertError.message });
    }

    logger.info(`Resident created by staff: house_no=${house_no} (no user account yet)`);

    res.status(201).json({
      success: true,
      message: 'เพิ่มข้อมูลลูกบ้านสำเร็จ',
      data: {
        ...newResident,
        first_name: first_name || '',
        last_name: last_name || '',
      },
    });
  } catch (error) {
    logger.error('Create resident for staff error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
