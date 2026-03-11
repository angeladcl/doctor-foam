export const dynamic = "force-dynamic";

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

        // Verify token via SQL RPC (returns user ID if valid)
        const { data: userId, error: verifyError } = await supabase.rpc("verify_reset_token", {
            user_email: email,
            token: token,
        });

        if (!userId || verifyError) {
            console.error("[verify-reset] Token invalid or expired:", verifyError?.message);
            return NextResponse.json({ error: "Enlace inválido o expirado" }, { status: 400 });
        }

        console.log("[verify-reset] Token valid for user:", userId);

        // Try GoTrue admin API first — it hashes the password correctly
        let passwordUpdated = false;
        try {
            const { error: adminError } = await supabase.auth.admin.updateUserById(userId, {
                password: newPassword,
            });
            if (!adminError) {
                passwordUpdated = true;
                console.log("[verify-reset] Password updated via GoTrue admin API");
            } else {
                console.error("[verify-reset] GoTrue admin API failed:", adminError.message);
            }
        } catch (err) {
            console.error("[verify-reset] GoTrue admin API exception:", err);
        }

        // Fallback: update via direct SQL using GoTrue's crypt function
        if (!passwordUpdated) {
            console.log("[verify-reset] Falling back to SQL password update...");
            const { data: sqlResult, error: sqlError } = await supabase.rpc("update_user_password_crypt", {
                user_email: email,
                new_password: newPassword,
            });
            if (sqlError || !sqlResult) {
                console.error("[verify-reset] SQL password update failed:", sqlError?.message);
                return NextResponse.json({ error: "Error al actualizar la contraseña" }, { status: 500 });
            }
            console.log("[verify-reset] Password updated via SQL crypt function");
        }

        // Clear the reset token
        const { error: clearError } = await supabase.rpc("clear_reset_token", {
            user_email: email,
        });
        if (clearError) {
            console.error("[verify-reset] Warning: failed to clear reset token:", clearError.message);
        }

        console.log("[verify-reset] ✅ Password updated successfully for:", email);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[verify-reset] Unexpected error:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
