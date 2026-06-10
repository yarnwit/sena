import { ComplaintService } from './backend/src/services/complaint.service';
import { supabase } from './backend/src/config/supabase';

async function run() {
  try {
    const res = await ComplaintService.createComplaintForStaff({
      subject: 'Test subject',
      description: 'Test desc',
      manual_name: 'John Doe',
      manual_house_no: '999/99',
    }, 'dummy-user-id');
    console.log('Success:', res);
  } catch (err) {
    console.error('Error:', err);
  }
}
run();
