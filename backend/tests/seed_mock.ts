import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log('🌱 เริ่มทำการจำลองข้อมูล (Mock Data) ลง Database...');

  const password = '123456';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  // 1. สร้าง Staff User: Bosszaza
  const staffId = crypto.randomUUID();
  const { data: staff, error: staffError } = await supabase.from('users').upsert({
    user_id: staffId,
    username: 'Bosszaza',
    password_hash: hash,
    first_name: 'บอส',
    last_name: 'ซ่าซ่า',
    role: 'staff'
  }, { onConflict: 'username' }).select().single();

  if (staffError) {
    console.error('❌ สร้าง Bosszaza ไม่สำเร็จ:', staffError.message);
  } else {
    console.log('✅ สร้างเจ้าหน้าที่ (Staff): Bosszaza สำเร็จ');
  }

  // 2. สร้าง Resident User: Te_Trax
  const residentUserId = crypto.randomUUID();
  const { data: residentUser, error: resUserErr } = await supabase.from('users').upsert({
    user_id: residentUserId,
    username: 'Te_Trax',
    password_hash: hash,
    first_name: 'ไดโนเสาร์',
    last_name: 'พี่เต้',
    role: 'resident'
  }, { onConflict: 'username' }).select().single();

  let residentId = null;

  if (resUserErr) {
    console.error('❌ สร้าง Te_Trax ไม่สำเร็จ:', resUserErr.message);
  } else {
    console.log('✅ สร้างลูกบ้าน (User): Te_Trax สำเร็จ');
    
    // สร้างข้อมูลในตาราง resident
    const { data: residentInfo, error: resInfoErr } = await supabase.from('resident').insert({
      user_id: residentUser.user_id,
      house_no: '88/134',
      phone_number: '0764571657',
      resident_type: 'เจ้าของบ้าน'
    }).select().single();

    if (resInfoErr) {
      console.error('❌ สร้างข้อมูล Resident Detail ไม่สำเร็จ:', resInfoErr.message);
    } else {
      console.log('✅ สร้างข้อมูลรายละเอียดลูกบ้าน สำเร็จ');
      residentId = residentInfo.resident_id;
    }
  }

  // 3. สร้างเรื่องร้องเรียน
  if (residentId) {
    // ลบเรื่องร้องเรียนเก่าที่มีหัวข้อ dffg ถ้ามี
    await supabase.from('complaints').delete().eq('subject', 'dffg');

    const { error: compError } = await supabase.from('complaints').insert([
      {
        resident_id: residentId,
        ticket_no: 'TK260530-2686',
        subject: 'dffg',
        status: 'pending',
        description: 'a',
        location_written: 'นิติบุคคล',
        intake_channel: 'แอปพลิเคชัน (Mobile)',
        petition: ''
      },
      {
        resident_id: residentId,
        ticket_no: 'TK260530-9999',
        subject: 'หลังคาพัง',
        status: 'pending',
        description: 'มีน้ำรั่วจากหลังคา',
        location_written: 'นิติบุคคล',
        intake_channel: 'แอปพลิเคชัน (Mobile)',
        petition: ''
      }
    ]);

    if (compError) {
      console.error('❌ สร้างเรื่องร้องเรียนไม่สำเร็จ:', compError.message);
    } else {
      console.log('✅ สร้างเรื่องร้องเรียน "dffg" (สถานะ pending) สำเร็จ');
    }
  }

  console.log('🎉 รัน Script จำลองข้อมูลเสร็จสิ้น! คุณสามารถกลับไปทดสอบ Playwright ได้แล้ว');
}

main();
