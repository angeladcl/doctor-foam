import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/* ─── Client-side Supabase (browser) ─── */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* ─── Server-side Supabase (API routes — uses service role for full access) ─── */
export function createServerSupabase() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        // Fallback to anon key if service role not set
        return createClient(supabaseUrl, supabaseAnonKey);
    }
    return createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false },
    });
}
