import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase";

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
    return user;
}

/* GET — List all conversations with customer info + unread counts */
export async function GET(request: NextRequest) {
    const user = await authenticateAdmin(request);
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const supabase = createServerSupabase();

    // Get all conversations
    const { data: convs, error } = await supabase
        .from("chat_conversations")
        .select("*")
        .order("last_message_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Enrich with customer info and unread counts
    const enriched = await Promise.all(
        (convs || []).map(async (conv) => {
            // Get customer profile
            const { data: profile } = await supabase
                .from("customer_profiles")
                .select("full_name")
                .eq("id", conv.customer_id)
                .single();

            // Get customer email from auth
            const { data: authUser } = await supabase.auth.admin.getUserById(conv.customer_id);

            // Count unread messages from customer
            const { count } = await supabase
                .from("chat_messages")
                .select("*", { count: "exact", head: true })
                .eq("conversation_id", conv.id)
                .eq("sender_role", "customer")
                .eq("read", false);

            return {
                ...conv,
                customer_name: profile?.full_name || authUser?.user?.user_metadata?.full_name || "Cliente",
                customer_email: authUser?.user?.email || "",
                unread_count: count || 0,
            };
        })
    );

    return NextResponse.json({ conversations: enriched });
}
