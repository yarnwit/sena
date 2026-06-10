import { supabase } from './backend/src/config/supabase';

async function test() {
  const { data, error } = await supabase
    .from('complaints')
    .insert({
      resident_id: null,
      ticket_no: 'TK_TEST_123',
      subject: 'Test Manual',
      description: 'Test Manual Desc',
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase Error:', error);
  } else {
    console.log('Success:', data);
  }
}

test();
