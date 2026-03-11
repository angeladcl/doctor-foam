export const dynamic = "force-dynamic";

import { createServerSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    // Vercel Cron sends a Bearer token or specific header. 
    // You can protect this route with process.env.CRON_SECRET
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // If a secret is defined in Vercel, mandate it
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const supabase = createServerSupabase();

        // Calculate tomorrow's date string in Mexico timezone, or simply UTC depending on server setup.
        // Doing simple math for 24h ahead:
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split("T")[0]; // YYYY-MM-DD

        // Find bookings scheduled for tomorrow
        const { data: bookings, error: bookingsErr } = await supabase
            .from("bookings")
            .select("*")
            .eq("service_date", tomorrowStr)
            .in("payment_status", ["paid", "manual"]);

        if (bookingsErr) {
            console.error("Cron Error fetching bookings:", bookingsErr);
            return NextResponse.json({ error: "DB Error" }, { status: 500 });
        }

        if (!bookings || bookings.length === 0) {
            return NextResponse.json({ message: "No bookings for tomorrow." });
        }

        // Send notifications
        let emailsSent = 0;
        let pushesSent = 0;

        for (const booking of bookings) {
            if (booking.customer_email) {
                // 1. Email Reminder
                try {
                    const { sendServiceReminder } = await import("@/lib/email");
                    await sendServiceReminder({
                        customerName: booking.customer_name || "Cliente",
                        customerEmail: booking.customer_email,
                        packageName: booking.package_name || "Servicio",
                        serviceDate: booking.service_date,
                        address: booking.address || "Por definir",
                    });
                    emailsSent++;
                } catch (emailErr) {
                    console.error(`Email error for booking ${booking.id}:`, emailErr);
                }

                // 2. Push Notification to Customer (if registered)
                if (booking.customer_id) {
                    try {
                        const { sendPushNotification } = await import("@/lib/web-push");
                        await sendPushNotification(booking.customer_id, {
                            title: "⏰ ¡Tu servicio es mañana!",
                            body: `Hola ${booking.customer_name?.split(" ")[0] || "Cliente"}, te recordamos que tu servicio de ${booking.package_name} está agendado para mañana.`,
                            url: "/mi-cuenta",
                        });
                        pushesSent++;
                    } catch (pushErr) {
                        console.error(`Push Error for customer ${booking.customer_id}:`, pushErr);
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            dateProcessed: tomorrowStr,
            remindersSent: { emails: emailsSent, pushes: pushesSent }
        });

    } catch (error: any) {
        console.error("Cron processing error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
