import { createServerSupabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {});

export async function POST(request: NextRequest) {
    try {
        const supabase = createServerSupabase();

        // Ensure admin is logged in (basic check, could be more robust with admin metadata)
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { bookingId } = await request.json();

        if (!bookingId) {
            return NextResponse.json({ error: "Se requiere bookingId" }, { status: 400 });
        }

        // Fetch the booking details
        const { data: booking, error: fetchError } = await supabase
            .from("bookings")
            .select("*")
            .eq("id", bookingId)
            .single();

        if (fetchError || !booking) {
            return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
        }

        if (booking.payment_status === "paid") {
            return NextResponse.json({ error: "La reserva ya está pagada" }, { status: 400 });
        }

        // Create a new Stripe Checkout Session for this existing booking
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            locale: "es",
            customer_email: booking.customer_email || undefined,
            line_items: [
                {
                    price_data: {
                        currency: "mxn",
                        product_data: {
                            name: booking.package_name || "Servicio de Limpieza",
                            description: `Pago manual | Fecha: ${booking.service_date}`,
                        },
                        unit_amount: booking.total_amount || 0,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                bookingId: booking.id, // Reference to existing
                customerName: booking.customer_name || "N/A",
                serviceDate: booking.service_date || "N/A",
            },
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/pago-exitoso?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/`,
        });

        // Update the booking with the new session ID so the webhook catches it
        await supabase
            .from("bookings")
            .update({ stripe_session_id: session.id })
            .eq("id", booking.id);

        // Send the Reminder Email
        if (booking.customer_email) {
            try {
                const { sendPaymentReminderEmail } = await import("@/lib/email");
                await sendPaymentReminderEmail({
                    customerName: booking.customer_name || "Cliente",
                    customerEmail: booking.customer_email,
                    packageName: booking.package_name || "Servicio",
                    totalAmount: booking.total_amount || 0,
                    paymentLink: session.url as string,
                });
            } catch (emailErr) {
                console.error("Failed to send payment reminder:", emailErr);
            }
        }

        return NextResponse.json({ success: true, url: session.url });

    } catch (error: any) {
        console.error("Admin checkout integration error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
