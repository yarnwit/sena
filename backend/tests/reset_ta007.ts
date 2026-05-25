import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const username = 'Ta007';
  const newPassword = 'admin1234';

  // 1. ตรวจสอบว่า user มีในระบบ
  const { data: user, error: findError } = await supabase
    .from('users')
    .select('user_id, username, role, first_name, last_name')
    .ilike('username', username)
    .single();

  if (findError || !user) {
    console.error('❌ ไม่พบ user Ta007 :', findError?.message);
    return;
  }

  console.log('✅ พบ user:', user);

  // 2. สร้าง bcrypt hash ใหม่
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newPassword, salt);

  // 3. อัปเดต password_hash และ role ให้เป็น admin
  const { error: updateError } = await supabase
    .from('users')
    .update({ password_hash: hash, role: 'admin' })
    .eq('user_id', user.user_id);

  if (updateError) {
    console.error('❌ อัปเดตไม่สำเร็จ:', updateError.message);
    return;
  }

  console.log('✅ อัปเดตสำเร็จ!');
  console.log('-----------------------------------');
  console.log('Username :', username);
  console.log('Password :', newPassword);
  console.log('Role     :', 'admin');
  console.log('-----------------------------------');
  console.log('สามารถ Login ได้เลยที่ http://localhost:3000/login');
}

main().catch(console.error);
