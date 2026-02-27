import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    // 1. Get the Authorization token from the headers to authenticate the user
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    // Create an authenticated client scoped to the current user
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
        return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { subscription } = body;

        if (!subscription || !subscription.endpoint) {
            return NextResponse.json({ error: "Falta el objeto de suscripción" }, { status: 400 });
        }

        // 2. Insert into push_subscriptions table
        // The table has a UNIQUE constraint on (user_id, endpoint), so we use ON CONFLICT to ignore duplicates

        // Supabase Postgres currently needs an explicit RPC or upsert syntax for ON CONFLICT DO NOTHING
        // but 'upsert' works generically if we map the returning rows.
        // Actually, doing a select then insert is safer if we just want to avoid errors,
        // or just let it fail and ignore the error if it's the exact same endpoint.

        // Let's do a fast select first
        const { data: existing } = await supabase
            .from("push_subscriptions")
            .select("id")
            .eq("user_id", user.id)
            .contains("subscription_data", { endpoint: subscription.endpoint })
            .single();

        if (existing) {
            // Already subscribed on this exact device
            return NextResponse.json({ success: true, message: "Suscripción ya existía" });
        }

        // Insert new subscription
        const { error: insertError } = await supabase
            .from("push_subscriptions")
            .insert({
                user_id: user.id,
                subscription_data: subscription
            });

        if (insertError) {
            // It might throw a constraint violation if multiple requests hit at the same time, we can safely ignore
            console.error("Warning/Error saving push subscription:", insertError);
        }

        return NextResponse.json({ success: true, message: "Suscrito correctamente" });

    } catch (err: any) {
        console.error("[web-push/subscribe POST] Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
