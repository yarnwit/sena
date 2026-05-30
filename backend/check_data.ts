import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

async function test() {
  const { data: complaint } = await supabase.from('complaints').select('*').order('complaint_id', { ascending: false }).limit(5);
  console.log('Last 5 complaints:', JSON.stringify(complaint, null, 2));

  if (complaint && complaint.length > 0) {
    const resId = complaint[0].resident_id;
    console.log('Fetching resident_id:', resId);
    
    if (resId) {
      const { data: resident } = await supabase.from('resident').select('*').eq('resident_id', resId);
      console.log('Resident data:', JSON.stringify(resident, null, 2));
      
      if (resident && resident.length > 0 && resident[0].user_id) {
        const { data: user } = await supabase.from('users').select('*').eq('user_id', resident[0].user_id);
        console.log('User data:', JSON.stringify(user, null, 2));
      }
    }
  }
}

test();
