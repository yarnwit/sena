"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseAnon = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("./env");
if (!env_1.env.SUPABASE_URL || !env_1.env.SUPABASE_SERVICE_KEY) {
    throw new Error('Missing Supabase environment variables');
}
// Admin client (service role) — used for admin.getUserById, DB queries
exports.supabase = (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});
// Anon client — used ONLY for signInWithPassword (needs session persistence)
const anonKey = env_1.env.SUPABASE_ANON_KEY || env_1.env.SUPABASE_SERVICE_KEY;
exports.supabaseAnon = (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, anonKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});
