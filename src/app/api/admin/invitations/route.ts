export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const getSupabaseAdmin = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const getResend = () => new Resend(process.env.RESEND_API_KEY);

async function verifyAdmin(request: NextRequest) {
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

/* GET — List invitations */
export async function GET(request: NextRequest) {
    const admin = await verifyAdmin(request);
    if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { data, error } = await getSupabaseAdmin()
        .from("invitations")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ invitations: data });
}

/* POST — Create invitation */
export async function POST(request: NextRequest) {
    const admin = await verifyAdmin(request);
    if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { email, role } = await request.json();
    if (!email || !role) return NextResponse.json({ error: "Email y rol requeridos" }, { status: 400 });
    if (!["admin", "customer"].includes(role)) {
        return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
    }

    // Check if already invited
    const { data: existing } = await getSupabaseAdmin()
        .from("invitations")
        .select("id")
        .eq("email", email.toLowerCase())
        .eq("status", "pending")
        .single();

    if (existing) {
        return NextResponse.json({ error: "Ya existe una invitación pendiente para este email" }, { status: 400 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const { error: insertError } = await getSupabaseAdmin()
        .from("invitations")
        .insert({
            email: email.toLowerCase(),
            role,
            invited_by: admin.id,
            token,
            expires_at: expiresAt.toISOString(),
        });

    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

    // Send invitation email
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://drfoam.com.mx";
    const inviteUrl = `${baseUrl}/invitacion?token=${token}&email=${encodeURIComponent(email.toLowerCase())}`;
    const roleLabel = role === "admin" ? "Administrador" : "Cliente";

    try {
        await getResend().emails.send({
            from: "Doctor Foam <info@drfoam.com.mx>",
            to: email.toLowerCase(),
            subject: `Invitación a Doctor Foam — ${roleLabel}`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 2rem; background: #0a1628; color: #e2e8f0; border-radius: 12px;">
                    <h1 style="text-align: center; font-size: 1.5rem; margin-bottom: 0.5rem;">
                        DOCTOR <span style="background: linear-gradient(135deg, #3b82f6, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">FOAM</span>
                    </h1>
                    <p style="text-align: center; color: #94a3b8; font-size: 0.9rem;">Detallado Automotriz Premium</p>
                    <hr style="border: none; border-top: 1px solid rgba(96, 165, 250, 0.15); margin: 1.5rem 0;" />
                    <p style="font-size: 1rem; line-height: 1.6;">
                        Has sido invitado como <strong style="color: #60a5fa;">${roleLabel}</strong> a la plataforma de Doctor Foam.
                    </p>
                    <p style="font-size: 0.9rem; color: #94a3b8; line-height: 1.5;">
                        Haz clic en el botón para crear tu cuenta y acceder a la plataforma.
                    </p>
                    <div style="text-align: center; margin: 2rem 0;">
                        <a href="${inviteUrl}" style="display: inline-block; padding: 0.9rem 2rem; background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 1rem;">
                            Aceptar invitación
                        </a>
                    </div>
                    <p style="font-size: 0.8rem; color: #64748b; text-align: center;">
                        Esta invitación expira en 7 días.
                    </p>
                </div>
            `,
        });
    } catch (emailErr) {
        console.error("[invitations] Email error:", emailErr);
    }

    return NextResponse.json({ success: true, message: "Invitación enviada" });
}

/* DELETE — Cancel invitation */
export async function DELETE(request: NextRequest) {
    const admin = await verifyAdmin(request);
    if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const { error } = await getSupabaseAdmin()
        .from("invitations")
        .delete()
        .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
