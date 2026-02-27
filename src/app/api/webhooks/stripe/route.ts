import { createServerSupabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY || "", {});
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const sig = request.headers.get("stripe-signature");

        let event: Stripe.Event;

        if (endpointSecret && endpointSecret !== "whsec_placeholder" && sig) {
            try {
                event = getStripe().webhooks.constructEvent(body, sig, endpointSecret);
            } catch (err) {
                console.error("Webhook signature verification failed:", err);
                return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
            }
        } else {
            event = JSON.parse(body) as Stripe.Event;
        }

        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;
            const supabase = createServerSupabase();

            if (session.id) {
                // 1. Update booking status to paid
                const { data: booking, error } = await supabase
                    .from("bookings")
                    .update({ payment_status: "paid" })
                    .eq("stripe_session_id", session.id)
                    .select()
                    .single();

                if (error) {
                    console.error("Error updating booking:", error);
                } else if (booking) {
                    console.log(`Booking confirmed for session ${session.id}`);

                    // 2. Auto-create customer account if doesn't exist
                    let customerId: string | null = null;

                    if (booking.customer_email) {
                        // Check if user already exists
                        const { data: existingUsers } = await supabase.auth.admin.listUsers();
                        const existingUser = existingUsers?.users?.find(
                            (u) => u.email === booking.customer_email
                        );

                        if (existingUser) {
                            customerId = existingUser.id;
                        } else {
                            // Create new customer account
                            const tempPassword = `DF${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
                            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                                email: booking.customer_email,
                                password: tempPassword,
                                email_confirm: true,
                                user_metadata: {
                                    full_name: booking.customer_name,
                                    role: "customer",
                                },
                            });

                            if (newUser?.user) {
                                customerId = newUser.user.id;

                                // Create customer profile
                                await supabase.from("customer_profiles").insert({
                                    id: newUser.user.id,
                                    full_name: booking.customer_name || "",
                                    phone: booking.customer_phone || "",
                                    default_address: booking.address || "",
                                    default_vehicle: booking.vehicle_info || "",
                                });

                                // Send welcome email with password setup link
                                try {
                                    const { data: linkData } = await supabase.auth.admin.generateLink({
                                        type: "recovery",
                                        email: booking.customer_email,
                                        options: {
                                            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/restablecer-password`,
                                        },
                                    });

                                    if (linkData?.properties?.action_link) {
                                        const { sendWelcomeEmail } = await import("@/lib/email");
                                        await sendWelcomeEmail({
                                            customerName: booking.customer_name,
                                            customerEmail: booking.customer_email,
                                            setupPasswordLink: linkData.properties.action_link,
                                        });
                                    }
                                } catch (welcomeErr) {
                                    console.error("Error sending welcome email:", welcomeErr);
                                }
                            } else {
                                console.error("Error creating customer:", createError);
                            }
                        }

                        // Link booking to customer
                        if (customerId) {
                            await supabase
                                .from("bookings")
                                .update({ customer_id: customerId })
                                .eq("id", booking.id);
                        }
                    }

                    // 3. Send confirmation emails
                    try {
                        const { sendBookingEmails } = await import("@/lib/email");
                        await sendBookingEmails({
                            customerName: booking.customer_name,
                            customerEmail: booking.customer_email,
                            customerPhone: booking.customer_phone || "",
                            packageName: booking.package_name,
                            serviceDate: booking.service_date,
                            vehicleInfo: booking.vehicle_info || "",
                            vehicleSize: booking.vehicle_size || "",
                            address: booking.address || "",
                            totalAmount: booking.total_amount || 0,
                            paymentStatus: "paid",
                            source: "online",
                        });
                    } catch (emailErr) {
                        console.error("Error sending emails:", emailErr);
                    }

                    // 4. Send Push Notification to Admins and Customer
                    try {
                        const { sendPushToAdmins, sendPushNotification } = await import("@/lib/web-push");

                        // Notify Admins
                        await sendPushToAdmins({
                            title: "💰 ¡Nueva Venta Exclusiva!",
                            body: `Se ha confirmado el pago de ${booking.customer_name} por $${((booking.total_amount || 0) / 100).toFixed(2)} MXN.`,
                            url: "/admin/reservas",
                        });

                        // Notify Customer
                        if (customerId) {
                            await sendPushNotification(customerId, {
                                title: "✅ ¡Reserva Confirmada!",
                                body: `Tu cita para ${booking.package_name} ha sido agendada con éxito.`,
                                url: "/mi-cuenta/servicios",
                            });
                        }
                    } catch (pushErr) {
                        console.error("Error sending push to admins/customer:", pushErr);
                    }
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json({ error: "Webhook error" }, { status: 500 });
    }
}
