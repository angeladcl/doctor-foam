import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    console.log("[reset-password] Processing reset for:", email);

    // Use anon key client — resetPasswordForEmail is a standard auth method
    // that works with the anon key (not admin API)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/restablecer-password`;
    console.log("[reset-password] Redirect URL:", redirectUrl);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      console.error("[reset-password] Error:", error.message, "| Code:", error.status);
      // Don't reveal if user exists or not
      return NextResponse.json({ success: true });
    }

    console.log("[reset-password] Reset email sent successfully for:", email);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[reset-password] Unexpected error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
