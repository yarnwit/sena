import { supabase } from '../src/config/supabase';

async function main() {
  // Test exact query like the controller does
  const username = 'Boss1';
  const { data, error } = await supabase
    .from('users')
    .select('user_id, password_hash, role, first_name, last_name')
    .eq('username', username)
    .single();

  console.log('Controller query result:', data, 'error:', error?.message);

  // Also list all usernames to see what's stored
  const { data: all } = await supabase.from('users').select('username');
  console.log('All usernames in DB:', all?.map(u => `"${u.username}"`));
}

main();
