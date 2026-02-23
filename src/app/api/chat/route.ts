import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function getAuthUser(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;
    const token = authHeader.split(" ")[1];
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return { supabase, user };
}

/* GET — Messages for a conversation */
export async function GET(request: NextRequest) {
    const auth = await getAuthUser(request);
    if (!auth) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversation_id");

    if (conversationId) {
        // Get messages for a specific conversation
        const { data: messages, error } = await auth.supabase
            .from("chat_messages")
            .select("*")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: true });

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ messages });
    }

    // Get or create conversation for current customer
    let { data: conv } = await auth.supabase
        .from("chat_conversations")
        .select("*")
        .eq("customer_id", auth.user.id)
        .single();

    if (!conv) {
        const { data: newConv, error } = await auth.supabase
            .from("chat_conversations")
            .insert({ customer_id: auth.user.id })
            .select()
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        conv = newConv;
    }

    // Get messages
    const { data: messages } = await auth.supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conv!.id)
        .order("created_at", { ascending: true });

    return NextResponse.json({ conversation: conv, messages: messages || [] });
}

/* POST — Send a message */
export async function POST(request: NextRequest) {
    const auth = await getAuthUser(request);
    if (!auth) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { content, conversation_id } = await request.json();
    if (!content?.trim()) return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });

    // Determine sender_role from JWT, never trust the request body
    const sender_role = auth.user.app_metadata?.role === "admin" ? "admin" : "customer";

    let convId = conversation_id;

    // If customer, get or create their conversation
    if (!convId) {
        let { data: conv } = await auth.supabase
            .from("chat_conversations")
            .select("id")
            .eq("customer_id", auth.user.id)
            .single();

        if (!conv) {
            const { data: newConv } = await auth.supabase
                .from("chat_conversations")
                .insert({ customer_id: auth.user.id })
                .select("id")
                .single();
            conv = newConv;
        }
        convId = conv?.id;
    }

    if (!convId) return NextResponse.json({ error: "No se pudo crear conversación" }, { status: 500 });

    // Insert message
    const { data: message, error } = await auth.supabase
        .from("chat_messages")
        .insert({
            conversation_id: convId,
            sender_id: auth.user.id,
            sender_role: sender_role || "customer",
            content: content.trim(),
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Update conversation last_message_at
    await auth.supabase
        .from("chat_conversations")
        .update({ last_message_at: new Date().toISOString(), status: "open" })
        .eq("id", convId);

    // Send email notification (async, don't block)
    try {
        const { sendChatNotification } = await import("@/lib/email");
        const role = sender_role || "customer";

        if (role === "customer") {
            // Notify admin
            await sendChatNotification({
                recipientEmail: process.env.ADMIN_EMAIL || "info@drfoam.com.mx",
                recipientName: "Admin",
                senderName: auth.user.user_metadata?.full_name || auth.user.email || "Cliente",
                messagePreview: content.trim().slice(0, 100),
            });
        }
        // Note: admin→customer notification handled in admin chat
    } catch (emailErr) {
        console.error("Chat email notification error:", emailErr);
    }

    return NextResponse.json({ message });
}

/* PATCH — Mark messages as read */
export async function PATCH(request: NextRequest) {
    const auth = await getAuthUser(request);
    if (!auth) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { conversation_id, reader_role } = await request.json();
    if (!conversation_id) return NextResponse.json({ error: "Falta conversation_id" }, { status: 400 });

    // Mark messages from the OTHER role as read
    const otherRole = reader_role === "customer" ? "admin" : "customer";
    const { error } = await auth.supabase
        .from("chat_messages")
        .update({ read: true })
        .eq("conversation_id", conversation_id)
        .eq("sender_role", otherRole)
        .eq("read", false);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
