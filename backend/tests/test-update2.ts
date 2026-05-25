import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function test() {
  const { data, error } = await supabase.auth.admin.updateUserById('9c6e9fed-ed77-4e57-a3bd-8c707c4ac1cf', {password: '123456'});
  console.log('Result:', data);
  console.log('Error:', error);
}
test();
