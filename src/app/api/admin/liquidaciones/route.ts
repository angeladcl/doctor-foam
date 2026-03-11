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

/* GET — Fetch Pending Liquidations Info */
export async function GET(request: NextRequest) {
    const auth = await authenticateAdmin(request);
    if (!auth) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
        // 1. Get all pending AND completed bookings.
        // Even if they are still "ejecutado", if liquidation_status is pending, we can optionally fetch them 
        // depending on the UI needs. The prompt says "completed services that have liquidation_status === pending".
        const { data: bookings, error: bookingsError } = await auth.supabase
            .from("bookings")
            .select("*")
            .eq("liquidation_status", "pending")
            .eq("payment_status", "completed");

        if (bookingsError) throw bookingsError;

        // 2. Fetch admins with profit_share_pct > 0
        const { data: profiles, error: profilesError } = await auth.supabaseAdmin
            .from("admin_profiles")
            .select("id, display_role, profit_share_pct")
            .gt("profit_share_pct", 0);

        if (profilesError) throw profilesError;

        // Ensure we join with auth.users to get names (auth.users doesn't have name directly if not queried from server layer, 
        // but let's query the specific users endpoint or rely on user metadata).
        // Since we need names, let's fetch users via auth admin API.
        const { data: usersData, error: usersError } = await auth.supabaseAdmin.auth.admin.listUsers();
        if (usersError) throw usersError;

        const admins = profiles.map(p => {
            const userObj = usersData.users.find(u => u.id === p.id);
            return {
                user_id: p.id,
                name: userObj?.user_metadata?.name || userObj?.email || "Administrador",
                display_role: p.display_role,
                profit_share_pct: Number(p.profit_share_pct)
            };
        });

        // 3. Calculate Totals
        let total_sold = 0;
        let total_expenses = 0;

        for (const b of bookings || []) {
            total_sold += Number(b.total_amount) / 100; // Assuming total_amount is in cents as standard in project 
            total_expenses += Number(b.expenses || 0);
        }

        const total_profit = total_sold - total_expenses;

        // 4. Calculate Splits
        const partner_splits = admins.map(admin => {
            return {
                user_id: admin.user_id,
                name: admin.name,
                display_role: admin.display_role,
                percentage: admin.profit_share_pct,
                amount: Number((total_profit * (admin.profit_share_pct / 100)).toFixed(2))
            };
        });

        return NextResponse.json({
            pending_bookings: bookings,
            totals: {
                total_sold,
                total_expenses,
                total_profit
            },
            partner_splits
        });

    } catch (err: any) {
        console.error("[admin/liquidaciones GET] Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/* POST — Execute Mass Liquidation */
export async function POST(request: NextRequest) {
    const auth = await authenticateAdmin(request);
    if (!auth) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { booking_ids, totals, partner_splits } = body;

        if (!booking_ids || booking_ids.length === 0) {
            return NextResponse.json({ error: "No hay servicios seleccionados para liquidar" }, { status: 400 });
        }

        // 1. Create a row in liquidations table
        const { data: liquidation, error: liqError } = await auth.supabaseAdmin
            .from("liquidations")
            .insert({
                total_sold: totals.total_sold,
                total_expenses: totals.total_expenses,
                total_profit: totals.total_profit,
                partner_splits: partner_splits
            })
            .select()
            .single();

        if (liqError) throw liqError;

        // 2. Update all pending bookings to "liquidated" and attach the liquidation_id
        const { error: updateError } = await auth.supabaseAdmin
            .from("bookings")
            .update({
                liquidation_status: "liquidated",
                liquidation_id: liquidation.id
            })
            .in("id", booking_ids);

        if (updateError) {
            // Rollback liquidation record ideally, but for now just throw
            throw updateError;
        }

        return NextResponse.json({ success: true, liquidation });

    } catch (err: any) {
        console.error("[admin/liquidaciones POST] Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
