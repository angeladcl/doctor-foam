export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const role = searchParams.get("role") || "admin";
    const secret = searchParams.get("secret");

    if (!email) {
        return NextResponse.json({ error: "Falta el ?email=tu@email.com en la URL" }, { status: 400 });
    }

    // Pequeña medida de seguridad para que nadie más la use si no tiene el enlace exacto
    if (secret !== "doctorfoam2026") {
        return NextResponse.json({ error: "Secret key inválida (?secret=doctorfoam2026)" }, { status: 403 });
    }

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Listar usuarios (como no hay forma directa de buscar uno solo por email fácilmente)
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });

    if (usersError) {
        return NextResponse.json({ error: usersError.message }, { status: 500 });
    }

    const user = usersData.users.find(u => u.email === email.toLowerCase());

    let userId = "";

    if (!user) {
        if (searchParams.get("create") === "true") {
            const { data: newData, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: email.toLowerCase(),
                password: "Password123!",
                email_confirm: true,
                user_metadata: { full_name: "Test User" },
                app_metadata: { role }
            });
            if (createError) {
                return NextResponse.json({ error: "Fallo al crear usuario: " + createError.message }, { status: 500 });
            }
            userId = newData.user.id;
        } else {
            return NextResponse.json({ error: `Usuario ${email} no encontrado en la base de datos. Usa &create=true para crearlo.` }, { status: 404 });
        }
    } else {
        userId = user.id;
    }

    // Actualizamos su metadata para asignarle el rol
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        app_metadata: { role } // "admin" o "customer" dependiento del parámetro ?role=
    });

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
        success: true,
        message: `✅ Éxito absoluto: La app_metadata de la cuenta ${email} fue modificada. Ahora tiene el rol: ${role}. Ya puedes iniciar sesión con ese usuario para probarlo.`
    });
}
