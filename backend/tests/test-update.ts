import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function test() {
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError || !users || users.length === 0) {
    console.error('List error:', listError);
    return;
  }
  const user = users[0];
  console.log('Testing update on user:', user.id);
  
  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    password: 'newpassword123'
  });
  
  if (error) {
    console.error('Update error:', error);
  } else {
    console.log('Update successful');
  }
}

test();
