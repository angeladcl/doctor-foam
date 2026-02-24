import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getAuthUser(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;
    const token = authHeader.split(" ")[1];
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user || user.app_metadata?.role !== "admin") return null;
    return user;
}

/* POST — Subscribe to push notifications (admin only) */
export async function POST(request: NextRequest) {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { subscription } = await request.json();
    if (!subscription?.endpoint || !subscription?.keys) {
        return NextResponse.json({ error: "Subscription inválida" }, { status: 400 });
    }

    // Upsert: update keys if endpoint already exists, insert otherwise
    const { error } = await supabaseAdmin
        .from("push_subscriptions")
        .upsert(
            {
                user_id: user.id,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            },
            { onConflict: "endpoint" }
        );

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}

/* DELETE — Unsubscribe from push notifications */
export async function DELETE(request: NextRequest) {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { endpoint } = await request.json();
    if (!endpoint) return NextResponse.json({ error: "Falta endpoint" }, { status: 400 });

    const { error } = await supabaseAdmin
        .from("push_subscriptions")
        .delete()
        .eq("endpoint", endpoint)
        .eq("user_id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
