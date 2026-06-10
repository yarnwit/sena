import { supabase } from './src/config/supabase';

async function run() {
  const { data, error } = await supabase
    .rpc('get_tables_query', { query: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';` })
  
  if (error) {
     console.log('rpc failed, trying direct REST with pg_catalog or something');
     const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/?apikey=${process.env.SUPABASE_KEY}`);
     const json = await res.json();
     console.log(json);
  } else {
     console.log(data);
  }
}
run();
