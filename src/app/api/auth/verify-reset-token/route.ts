import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
    try {
        const { token, email, newPassword } = await request.json();

        if (!token || !email || !newPassword) {
            return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Find the user
        const { data: users } = await supabase.auth.admin.listUsers();
        const user = users?.users?.find(u => u.email === email);

        if (!user) {
            return NextResponse.json({ error: "Enlace inválido o expirado" }, { status: 400 });
        }

        // Verify the token
        const storedToken = user.user_metadata?.reset_token;
        const tokenExpiry = user.user_metadata?.reset_token_expiry;

        if (!storedToken || storedToken !== token) {
            return NextResponse.json({ error: "Enlace inválido o expirado" }, { status: 400 });
        }

        if (new Date(tokenExpiry) < new Date()) {
            return NextResponse.json({ error: "El enlace ha expirado. Solicita uno nuevo." }, { status: 400 });
        }

        // Update the password
        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
            password: newPassword,
            user_metadata: {
                ...user.user_metadata,
                reset_token: null,
                reset_token_expiry: null,
            },
        });

        if (updateError) {
            console.error("[verify-reset] Failed to update password:", updateError.message);
            return NextResponse.json({ error: "Error al actualizar la contraseña" }, { status: 500 });
        }

        console.log("[verify-reset] Password updated successfully for:", email);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[verify-reset] Unexpected error:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
