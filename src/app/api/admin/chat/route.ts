import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const getSupabaseAdmin = () => createClient(
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
    if (!user) return null;
    return user;
}

export async function GET(request: NextRequest) {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);

    // Unread count for badge
    if (searchParams.get("unread") === "true") {
        const { count, error } = await getSupabaseAdmin()
            .from("chat_messages")
            .select("*", { count: "exact", head: true })
            .eq("sender_role", "customer")
            .eq("read", false);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ unread_count: count || 0 });
    }

    // List all conversations with customer info and unread count
    const { data: conversations, error } = await getSupabaseAdmin()
        .from("chat_conversations")
        .select("*")
        .order("last_message_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Enrich with customer info and unread count
    const enriched = await Promise.all(
        (conversations || []).map(async (conv) => {
            // Get customer profile
            const { data: profile } = await getSupabaseAdmin()
                .from("customer_profiles")
                .select("full_name")
                .eq("id", conv.customer_id)
                .single();

            // Get customer email from auth
            let customerEmail = "";
            try {
                const { data: { user: cUser } } = await getSupabaseAdmin().auth.admin.getUserById(conv.customer_id);
                customerEmail = cUser?.email || "";
            } catch { /* silent */ }

            // Count unread messages
            const { count: unreadCount } = await getSupabaseAdmin()
                .from("chat_messages")
                .select("*", { count: "exact", head: true })
                .eq("conversation_id", conv.id)
                .eq("sender_role", "customer")
                .eq("read", false);

            return {
                ...conv,
                customer_name: profile?.full_name || customerEmail?.split("@")[0] || "Cliente",
                customer_email: customerEmail,
                unread_count: unreadCount || 0,
            };
        })
    );

    return NextResponse.json({ conversations: enriched });
}
