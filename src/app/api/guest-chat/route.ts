import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const getSupabaseAdmin = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* GET — Messages for a guest session */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
        return NextResponse.json({ error: "Falta session_id" }, { status: 400 });
    }

    // Find or return empty
    const { data: conv } = await getSupabaseAdmin()
        .from("guest_conversations")
        .select("*")
        .eq("session_id", sessionId)
        .single();

    if (!conv) {
        return NextResponse.json({ conversation: null, messages: [] });
    }

    const { data: messages } = await getSupabaseAdmin()
        .from("guest_messages")
        .select("*")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: true });

    return NextResponse.json({ conversation: conv, messages: messages || [] });
}

/* POST — Guest sends a message */
export async function POST(request: NextRequest) {
    const body = await request.json();
    const { session_id, content, guest_name, guest_email } = body;

    if (!session_id || !content?.trim()) {
        return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
    }

    // Find or create conversation
    let { data: conv } = await getSupabaseAdmin()
        .from("guest_conversations")
        .select("*")
        .eq("session_id", session_id)
        .single();

    if (!conv) {
        const { data: newConv, error: convErr } = await getSupabaseAdmin()
            .from("guest_conversations")
            .insert({
                session_id,
                guest_name: guest_name || "Visitante",
                guest_email: guest_email || null,
            })
            .select()
            .single();

        if (convErr) return NextResponse.json({ error: convErr.message }, { status: 500 });
        conv = newConv;
    } else if (guest_name || guest_email) {
        // Update name/email if provided
        const updates: Record<string, string> = {};
        if (guest_name) updates.guest_name = guest_name;
        if (guest_email) updates.guest_email = guest_email;
        await getSupabaseAdmin()
            .from("guest_conversations")
            .update(updates)
            .eq("id", conv.id);
    }

    // Insert message
    const { data: message, error } = await getSupabaseAdmin()
        .from("guest_messages")
        .insert({
            conversation_id: conv!.id,
            sender_role: "guest",
            content: content.trim(),
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Update last_message_at
    await getSupabaseAdmin()
        .from("guest_conversations")
        .update({ last_message_at: new Date().toISOString(), status: "open" })
        .eq("id", conv!.id);

    // Email notification to admin (async)
    try {
        const { sendChatNotification } = await import("@/lib/email");
        await sendChatNotification({
            recipientEmail: process.env.ADMIN_EMAIL || "info@drfoam.com.mx",
            recipientName: "Admin",
            senderName: guest_name || "Visitante",
            messagePreview: content.trim().slice(0, 100),
        });
    } catch (emailErr) {
        console.error("Guest chat email error:", emailErr);
    }

    // Push notification to admins (async, don't block)
    try {
        const { sendPushToAdmins } = await import("@/lib/web-push");
        await sendPushToAdmins({
            title: `💬 Mensaje de ${guest_name || "Visitante"}`,
            body: content.trim().slice(0, 120),
            url: "/admin/mensajes",
        });
    } catch (pushErr) {
        console.error("Guest push notification error:", pushErr);
    }

    return NextResponse.json({ message, conversation: conv });
}
