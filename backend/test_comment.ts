import { supabase } from './src/config/supabase';

async function run() {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      complaint_id: 181,
      user_id: 'e3bb780b-0442-4f16-86c5-4ceb05536de0', // assuming valid user
      content: 'Test comment'
    })
    .select()
    .single();

  console.log('Data:', data);
  console.log('Error:', error);
}
run();
