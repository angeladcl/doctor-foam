import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    console.log("[reset-password] Processing reset for:", email);

    // Use service role client for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if user exists
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    const user = users?.users?.find(u => u.email === email);

    if (!user) {
      console.log("[reset-password] User not found, returning success anyway");
      // Don't reveal if user exists
      return NextResponse.json({ success: true });
    }

    // Generate a secure token and store it as user metadata for verification
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    // Store token in user metadata
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        reset_token: resetToken,
        reset_token_expiry: resetExpiry,
      },
    });

    if (updateError) {
      console.error("[reset-password] Failed to store reset token:", updateError.message);
      return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const resetLink = `${siteUrl}/restablecer-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    console.log("[reset-password] Sending reset email via Resend...");

    const { error: emailError } = await resend.emails.send({
      from: "Doctor Foam <info@drfoam.com.mx>",
      to: email,
      subject: "🔑 Restablecer tu contraseña — Doctor Foam",
      html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a1628;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#0f2240;">
    <div style="background:linear-gradient(135deg,#1e3a5f,#0f2240);padding:2rem;text-align:center;border-bottom:2px solid rgba(96,165,250,0.3);">
      <h1 style="margin:0;color:white;font-size:1.3rem;letter-spacing:2px;">DOCTOR <span style="background:linear-gradient(135deg,#60a5fa,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">FOAM</span></h1>
    </div>
    <div style="padding:2rem;">
      <h2 style="color:white;margin:0 0 1rem;font-size:1.2rem;">Restablecer contraseña</h2>
      <p style="color:#cbd5e1;line-height:1.6;">Recibimos tu solicitud para restablecer la contraseña de tu cuenta Doctor Foam. Haz clic en el botón para crear una nueva contraseña:</p>
      <div style="text-align:center;margin:2rem 0;">
        <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:white;text-decoration:none;padding:0.85rem 2.5rem;border-radius:8px;font-weight:600;font-size:0.95rem;">Crear nueva contraseña</a>
      </div>
      <p style="color:#64748b;font-size:0.8rem;">Si no solicitaste esto, puedes ignorar este email. El enlace expira en 1 hora.</p>
    </div>
    <div style="padding:1rem 2rem;border-top:1px solid rgba(96,165,250,0.1);text-align:center;">
      <p style="color:#475569;font-size:0.7rem;margin:0;">Doctor Foam México — Detallado Automotriz Premium</p>
    </div>
  </div>
</body>
</html>`,
    });

    if (emailError) {
      console.error("[reset-password] Resend error:", JSON.stringify(emailError));
      return NextResponse.json({ error: "Error al enviar el correo" }, { status: 500 });
    }

    console.log("[reset-password] Email sent successfully to:", email);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[reset-password] Unexpected error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
