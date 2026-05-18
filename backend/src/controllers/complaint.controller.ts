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

// ===== GET /api/complaints/:id — ดึงคำร้องตาม ID พร้อมข้อมูลลูกบ้าน =====
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
