import { supabase } from '../src/config/supabase';

async function test() {
  const { data, error } = await supabase
    .from("complaints")
    .select("*")
    .limit(1);
    
  console.log("Data:", data);
  console.log("Error:", error);
}

test();
