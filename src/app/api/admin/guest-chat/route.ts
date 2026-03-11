export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const getSupabaseAdmin = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function authenticateAdmin(request: NextRequest) {
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

/* GET — List all guest conversations (admin only) */
export async function GET(request: NextRequest) {
    const user = await authenticateAdmin(request);
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);

    // Unread count only
    if (searchParams.get("unread") === "true") {
        const { count } = await getSupabaseAdmin()
            .from("guest_messages")
            .select("*", { count: "exact", head: true })
            .eq("sender_role", "guest")
            .eq("read", false);
        return NextResponse.json({ unread_count: count || 0 });
    }

    // Get specific conversation messages
    const convId = searchParams.get("conversation_id");
    if (convId) {
        const { data: messages, error } = await getSupabaseAdmin()
            .from("guest_messages")
            .select("*")
            .eq("conversation_id", convId)
            .order("created_at", { ascending: true });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ messages: messages || [] });
    }

    // List all conversations with unread counts
    const { data: conversations, error } = await getSupabaseAdmin()
        .from("guest_conversations")
        .select("*")
        .order("last_message_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const enriched = await Promise.all(
        (conversations || []).map(async (conv) => {
            const { count: unreadCount } = await getSupabaseAdmin()
                .from("guest_messages")
                .select("*", { count: "exact", head: true })
                .eq("conversation_id", conv.id)
                .eq("sender_role", "guest")
                .eq("read", false);

            return {
                ...conv,
                customer_name: conv.guest_name || "Visitante",
                customer_email: conv.guest_email || "",
                unread_count: unreadCount || 0,
            };
        })
    );

    return NextResponse.json({ conversations: enriched });
}

/* POST — Admin replies to a guest conversation */
export async function POST(request: NextRequest) {
    const user = await authenticateAdmin(request);
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { conversation_id, content } = await request.json();
    if (!conversation_id || !content?.trim()) {
        return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
    }

    const { data: message, error } = await getSupabaseAdmin()
        .from("guest_messages")
        .insert({
            conversation_id,
            sender_role: "admin",
            content: content.trim(),
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Update last_message_at
    await getSupabaseAdmin()
        .from("guest_conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversation_id);

    return NextResponse.json({ message });
}

/* PATCH — Mark guest messages as read */
export async function PATCH(request: NextRequest) {
    const user = await authenticateAdmin(request);
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { conversation_id } = await request.json();
    if (!conversation_id) return NextResponse.json({ error: "Falta conversation_id" }, { status: 400 });

    const { error } = await getSupabaseAdmin()
        .from("guest_messages")
        .update({ read: true })
        .eq("conversation_id", conversation_id)
        .eq("sender_role", "guest")
        .eq("read", false);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
