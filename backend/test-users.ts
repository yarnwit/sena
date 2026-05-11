import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function test() {
  const { data: users, error: err1 } = await supabase.from('users').select('*');
  console.log('Public users:', users, 'Error:', err1);

  const { data: authUsers, error: err2 } = await supabase.auth.admin.listUsers();
  console.log('Auth users:', authUsers.users, 'Error:', err2);
}

test();
