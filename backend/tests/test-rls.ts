import { supabase } from '../src/config/supabase';

async function testRLS() {
  const { data, error } = await supabase.rpc('get_policies');
  if (error) {
     // fallback if rpc not defined, just query pg_policies using custom query if we can, 
     // but service role can't execute raw SQL via REST easily. Let's just create a small node script with pg package if available.
  }
  
}
testRLS();
