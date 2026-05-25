/**
 * ทดสอบว่า runtime environment ของ backend โหลด env ได้ไหม
 * และ Supabase query ทำงานได้จริงไหม
 */
import dotenv from 'dotenv';
import path from 'path';

// โหลด .env เหมือนกับ env.ts ของ backend
dotenv.config({ path: path.join(__dirname, '../.env') });

import { createClient } from '@supabase/supabase-js';

async function main() {
  console.log('=== Environment Check ===');
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ loaded' : '❌ missing');
  console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✅ loaded' : '❌ missing');

  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_KEY!;

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log('\n=== Query Test (ilike Ta007) ===');
  const { data, error } = await supabase
    .from('users')
    .select('user_id, username, role, first_name, last_name')
    .ilike('username', 'Ta007')
    .single();

  if (error) {
    console.error('❌ Query error:', error.message, error.code, error.hint);
  } else {
    console.log('✅ User found:', data);
  }

  console.log('\n=== All Users ===');
  const { data: allUsers, error: allErr } = await supabase
    .from('users')
    .select('username, role');

  if (allErr) {
    console.error('❌ Cannot list users:', allErr.message);
  } else {
    console.log('Users:', allUsers);
  }
}

main().catch(console.error);
