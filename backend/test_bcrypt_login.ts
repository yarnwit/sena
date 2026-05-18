import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

async function main() {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', 'admin')
    .single();
    
  if (error || !user) {
    console.error('User not found:', error?.message);
    return;
  }
  
  console.log('User found:', user);
  const match = await bcrypt.compare('admin1234', user.password_hash);
  console.log('Bcrypt comparison with "admin1234":', match);
}

main().catch(console.error);
