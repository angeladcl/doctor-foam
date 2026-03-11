export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/* Helper: authenticate admin from Authorization header */
async function authenticateAdmin(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return null;
    }
    const token = authHeader.split(" ")[1];
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    if (user.app_metadata?.role !== "admin") return null;

    // Check service role key for admin-level operations
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = serviceRoleKey
        ? createClient(supabaseUrl, serviceRoleKey)
        : supabase;

    return { supabase, supabaseAdmin, user };
}

/* GET — Fetch Historical Liquidations */
export async function GET(request: NextRequest) {
    const auth = await authenticateAdmin(request);
    if (!auth) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
        const { data: liquidations, error } = await auth.supabaseAdmin
            .from("liquidations")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        return NextResponse.json({ liquidations });

    } catch (err: any) {
        console.error("[admin/liquidaciones/historial GET] Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
