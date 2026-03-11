export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const getSupabaseAdmin = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyAdmin(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return false;
    const token = authHeader.split(" ")[1];
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return false;
    return user.app_metadata?.role === "admin";
}

export async function GET(request: NextRequest) {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") || "all";

    try {
        // Get all users from auth
        const { data: { users }, error } = await getSupabaseAdmin().auth.admin.listUsers({ perPage: 1000 });
        if (error) throw error;

        let filtered = users || [];

        if (role === "admin") {
            filtered = filtered.filter(u => u.app_metadata?.role === "admin");
        } else if (role === "customer") {
            filtered = filtered.filter(u => u.app_metadata?.role !== "admin");
        }

        // Get customer profiles
        const { data: profiles } = await getSupabaseAdmin()
            .from("customer_profiles")
            .select("*");

        // Get admin profiles (profit share + display role)
        const { data: adminProfiles } = await getSupabaseAdmin()
            .from("admin_profiles")
            .select("*");

        const profileMap = new Map((profiles || []).map(p => [p.id, p]));
        const adminProfileMap = new Map((adminProfiles || []).map(p => [p.id, p]));

        const result = filtered.map(u => ({
            id: u.id,
            email: u.email,
            name: u.user_metadata?.name || u.user_metadata?.full_name || profileMap.get(u.id)?.full_name || "—",
            phone: profileMap.get(u.id)?.phone || u.phone || "—",
            role: u.app_metadata?.role || "customer",
            display_role: adminProfileMap.get(u.id)?.display_role || "Administrador",
            profit_share_pct: adminProfileMap.get(u.id)?.profit_share_pct ?? 0,
            created_at: u.created_at,
            last_sign_in: u.last_sign_in_at,
        }));

        return NextResponse.json({ users: result });
    } catch (err) {
        console.error("[admin/users] Error:", err);
        return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    try {
        const body = await request.json();
        const { user_id, display_role, profit_share_pct } = body;

        if (!user_id) {
            return NextResponse.json({ error: "user_id requerido" }, { status: 400 });
        }

        // Validate display_role
        const validRoles = ["Administrador", "Operador", "Proveedor"];
        if (display_role && !validRoles.includes(display_role)) {
            return NextResponse.json({ error: "Rol no válido" }, { status: 400 });
        }

        // Validate percentage
        if (profit_share_pct !== undefined) {
            const pct = Number(profit_share_pct);
            if (isNaN(pct) || pct < 0 || pct > 100) {
                return NextResponse.json({ error: "Porcentaje debe ser entre 0 y 100" }, { status: 400 });
            }
        }

        // Upsert admin profile
        const updateData: Record<string, unknown> = { id: user_id, updated_at: new Date().toISOString() };
        if (display_role) updateData.display_role = display_role;
        if (profit_share_pct !== undefined) updateData.profit_share_pct = Number(profit_share_pct);

        const { error } = await getSupabaseAdmin()
            .from("admin_profiles")
            .upsert(updateData, { onConflict: "id" });

        if (error) {
            console.error("[admin/users PATCH] Supabase error:", error);
            // Si la tabla no existe, Supabase devuelve un relation "admin_profiles" does not exist.
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("[admin/users PATCH] Error:", err);
        return NextResponse.json({ error: err.message || "Error al actualizar usuario" }, { status: 500 });
    }
}
