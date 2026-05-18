import { supabase } from './src/config/supabase';

async function main() {
  const username = 'admin';
  const { data: publicUser, error: findError } = await supabase
    .from('users')
    .select('user_id, password_hash, role, first_name, last_name')
    .ilike('username', username.trim())
    .single();
    
  if (findError) {
    console.error('Error finding user:', findError);
  } else {
    console.log('User found using controller query:', publicUser);
  }
}

main().catch(console.error);
