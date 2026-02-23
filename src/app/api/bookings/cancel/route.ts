import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
    try {
        // Authenticate user
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }
        const token = authHeader.split(" ")[1];
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: `Bearer ${token}` } },
        });
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { booking_id } = await request.json();
        if (!booking_id) {
            return NextResponse.json({ error: "booking_id es requerido" }, { status: 400 });
        }

        // Verify the booking belongs to this user
        const { data: booking, error: fetchError } = await supabase
            .from("bookings")
            .select("id, user_id, service_date, payment_status")
            .eq("id", booking_id)
            .single();

        if (fetchError || !booking) {
            return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
        }

        if (booking.user_id !== user.id) {
            return NextResponse.json({ error: "No autorizado para cancelar esta reserva" }, { status: 403 });
        }

        // Only allow cancelling future bookings (at least 24h before service)
        const serviceDate = new Date(booking.service_date + "T00:00:00");
        const now = new Date();
        const hoursUntilService = (serviceDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursUntilService < 24) {
            return NextResponse.json(
                { error: "Las cancelaciones deben hacerse con al menos 24 horas de anticipación" },
                { status: 400 }
            );
        }

        if (booking.payment_status === "cancelled") {
            return NextResponse.json({ error: "Esta reserva ya está cancelada" }, { status: 400 });
        }

        // Update booking status
        const { error: updateError } = await supabase
            .from("bookings")
            .update({ payment_status: "cancelled" })
            .eq("id", booking_id);

        if (updateError) {
            return NextResponse.json({ error: "Error al cancelar la reserva" }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Reserva cancelada exitosamente" });
    } catch {
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
