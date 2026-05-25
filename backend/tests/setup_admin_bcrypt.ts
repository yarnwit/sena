import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  const username = 'admin';
  const password = 'admin1234';
  
  // 1. Generate bcrypt hash
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  
  console.log('Generated hash for password:', hash);
  
  // 2. Check if user already exists in public.users
  const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('user_id')
    .eq('username', username)
    .maybeSingle();
    
  if (checkError) {
    console.error('Error checking user:', checkError.message);
    process.exit(1);
  }
  
  if (existingUser) {
    console.log('Admin user found in database. Updating password_hash...');
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: hash, role: 'admin' })
      .eq('username', username);
      
    if (updateError) {
      console.error('Error updating admin:', updateError.message);
      process.exit(1);
    }
    console.log('Successfully updated admin user password to: admin1234');
  } else {
    console.log('Admin user not found. Creating new admin user...');
    
    // We need a UUID. Let's create one or sign up through Supabase auth.
    // However, since we want a completely local auth bypassing email confirm,
    // we can generate a random UUID and insert directly into public.users!
    const uuid = '00000000-0000-0000-0000-000000000001'; // simple constant uuid
    
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        user_id: uuid,
        username,
        password_hash: hash,
        first_name: 'System',
        last_name: 'Admin',
        role: 'admin'
      });
      
    if (insertError) {
      console.error('Error inserting admin:', insertError.message);
      process.exit(1);
    }
    console.log('Successfully created new admin user with username: admin and password: admin1234');
  }
  
  console.log('Process completed successfully. You can now login with:');
  console.log('Username: admin');
  console.log('Password: admin1234');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
