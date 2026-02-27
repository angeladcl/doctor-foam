import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const getSupabaseAdmin = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const { token, email, name, password } = await request.json();

        if (!token || !email || !name || !password) {
            return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
        }

        // Verify invitation
        const { data: invitation, error: invError } = await getSupabaseAdmin()
            .from("invitations")
            .select("*")
            .eq("token", token)
            .eq("email", email.toLowerCase())
            .eq("status", "pending")
            .single();

        if (invError || !invitation) {
            return NextResponse.json({ error: "Invitación inválida o ya utilizada" }, { status: 400 });
        }

        // Check expiration
        if (new Date(invitation.expires_at) < new Date()) {
            await getSupabaseAdmin()
                .from("invitations")
                .update({ status: "expired" })
                .eq("id", invitation.id);
            return NextResponse.json({ error: "La invitación ha expirado" }, { status: 400 });
        }

        // Create user via GoTrue
        const { data: newUser, error: createError } = await getSupabaseAdmin().auth.admin.createUser({
            email: email.toLowerCase(),
            password,
            email_confirm: true,
            user_metadata: { name, full_name: name },
            app_metadata: { role: invitation.role },
        });

        if (createError) {
            if (createError.message?.includes("already been registered")) {
                return NextResponse.json({ error: "Este email ya está registrado" }, { status: 400 });
            }
            console.error("[accept-invitation] Create user error:", createError);
            return NextResponse.json({ error: "Error al crear la cuenta" }, { status: 500 });
        }

        // If customer, create customer profile
        if (invitation.role === "customer" && newUser.user) {
            await getSupabaseAdmin()
                .from("customer_profiles")
                .upsert({
                    id: newUser.user.id,
                    full_name: name,
                });
        }

        // Mark invitation as accepted
        await getSupabaseAdmin()
            .from("invitations")
            .update({ status: "accepted" })
            .eq("id", invitation.id);

        return NextResponse.json({
            success: true,
            role: invitation.role,
            message: invitation.role === "admin"
                ? "Cuenta de administrador creada. Puedes iniciar sesión."
                : "Cuenta creada exitosamente.",
        });
    } catch (error) {
        console.error("[accept-invitation] Error:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
