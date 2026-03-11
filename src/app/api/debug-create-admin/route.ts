export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create admin
    const { data: adminData, error: adminErr } = await supabaseAdmin.auth.admin.createUser({
        email: "test_admin@doctorfoam.mx",
        password: "password123",
        email_confirm: true,
        user_metadata: { full_name: "Test Admin" },
        app_metadata: { role: "admin" }
    });

    // Create customer
    const { data: customerData, error: customerErr } = await supabaseAdmin.auth.admin.createUser({
        email: "test_cliente@doctorfoam.mx",
        password: "password123",
        email_confirm: true,
        user_metadata: { full_name: "Test Cliente" }
    });

    return NextResponse.json({
        adminData, adminErr,
        customerData, customerErr
    });
}
