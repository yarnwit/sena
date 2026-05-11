import { createClient } from '@supabase/supabase-js';
import { env } from './env';

if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Admin client (service role) — used for admin.getUserById, DB queries
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Anon client — used ONLY for signInWithPassword (needs session persistence)
const anonKey = env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_KEY;
export const supabaseAnon = createClient(env.SUPABASE_URL, anonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
