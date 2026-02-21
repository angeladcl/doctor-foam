import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
        const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

        // Calculate first and last day of month
        const firstDay = new Date(year, month - 1, 1).toISOString().split("T")[0];
        const lastDay = new Date(year, month, 0).toISOString().split("T")[0];

        const supabase = createServerSupabase();

        // Get booked dates (paid or manual only — pending don't block)
        const { data: bookings } = await supabase
            .from("bookings")
            .select("service_date")
            .gte("service_date", firstDay)
            .lte("service_date", lastDay)
            .in("payment_status", ["paid", "manual"]);

        // Get blocked dates
        const { data: blocked } = await supabase
            .from("blocked_dates")
            .select("blocked_date")
            .gte("blocked_date", firstDay)
            .lte("blocked_date", lastDay);

        const occupiedDates = new Set<string>();

        bookings?.forEach((b) => occupiedDates.add(b.service_date));
        blocked?.forEach((b) => occupiedDates.add(b.blocked_date));

        return NextResponse.json({
            occupied: Array.from(occupiedDates),
            month,
            year,
        });
    } catch (error) {
        console.error("Availability error:", error);
        return NextResponse.json({ error: "Error al obtener disponibilidad" }, { status: 500 });
    }
}
