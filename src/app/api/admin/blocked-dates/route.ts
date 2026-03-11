export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function authenticateAdmin(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;
    const token = authHeader.split(" ")[1];
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    if (user.app_metadata?.role !== "admin") return null;
    return { supabase, user };
}

/* GET — List blocked dates */
export async function GET(request: NextRequest) {
    const auth = await authenticateAdmin(request);
    if (!auth) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    const firstDay = new Date(year, month - 1, 1).toISOString().split("T")[0];
    const lastDay = new Date(year, month, 0).toISOString().split("T")[0];

    const { data, error } = await auth.supabase
        .from("blocked_dates")
        .select("*")
        .gte("blocked_date", firstDay)
        .lte("blocked_date", lastDay)
        .order("blocked_date", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ blocked_dates: data });
}

/* POST — Block a date */
export async function POST(request: NextRequest) {
    const auth = await authenticateAdmin(request);
    if (!auth) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { blocked_date, reason } = await request.json();
    if (!blocked_date) return NextResponse.json({ error: "Falta fecha" }, { status: 400 });

    const { data, error } = await auth.supabase
        .from("blocked_dates")
        .insert({ blocked_date, reason: reason || "Bloqueado por admin" })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ blocked_date: data });
}

/* DELETE — Unblock a date */
export async function DELETE(request: NextRequest) {
    const auth = await authenticateAdmin(request);
    if (!auth) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Falta ID" }, { status: 400 });

    const { error } = await auth.supabase
        .from("blocked_dates")
        .delete()
        .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
