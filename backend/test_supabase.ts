import { supabase } from './src/config/supabase';

async function run() {
  const { data, error } = await supabase
    .from('complaints')
    .update({ status: 'approved', petition: '' })
    .eq('complaint_id', 181)
    .select()
    .single();

  console.log('Data:', data);
  console.log('Error:', error);
}
run();
