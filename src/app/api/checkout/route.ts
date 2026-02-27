import { PACKAGES, calculatePrice, getVehicleSizeLabel } from "@/lib/packages";
import { createServerSupabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY || "", {});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            packageId,
            vehicleSize = "sedan-2filas",
            serviceDate,
            customerName,
            customerEmail,
            customerPhone,
            address,
            vehicleBrand,
            vehicleModel,
            vehicleYear,
            vehicleColor,
            rfc,
            razonSocial,
            needsFactura,
        } = body;

        // Validate package
        const pkg = PACKAGES[packageId];
        if (!pkg) {
            return NextResponse.json({ error: "Paquete no válido" }, { status: 400 });
        }

        // Validate date is provided
        if (!serviceDate) {
            return NextResponse.json({ error: "Selecciona una fecha de servicio" }, { status: 400 });
        }

        // Check date availability
        const supabase = createServerSupabase();
        const { data: existingBookings } = await supabase
            .from("bookings")
            .select("id")
            .eq("service_date", serviceDate)
            .in("payment_status", ["paid", "manual"]);

        const { data: blockedDates } = await supabase
            .from("blocked_dates")
            .select("id")
            .eq("blocked_date", serviceDate);

        if ((existingBookings && existingBookings.length > 0) || (blockedDates && blockedDates.length > 0)) {
            return NextResponse.json({ error: "La fecha seleccionada ya no está disponible" }, { status: 409 });
        }

        // Check for membership discount
        let isMember = false;
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: memberData } = await supabase
                .from("bookings")
                .select("id")
                .eq("customer_id", user.id)
                .neq("payment_status", "cancelled")
                .ilike("package_name", "%Membres%");

            if (memberData && memberData.length > 0) {
                isMember = true;
            }
        }

        // Calculate price with vehicle size coefficient
        let totalCentavos = calculatePrice(packageId, vehicleSize);
        const isSubscription = !!pkg.isSubscription;
        if (isMember && !isSubscription) {
            totalCentavos = Math.round(totalCentavos * 0.9);
        }

        const vehicleSizeLabel = getVehicleSizeLabel(vehicleSize);

        // Create Stripe Checkout Session
        const session = await getStripe().checkout.sessions.create({
            payment_method_types: ["card"],
            mode: isSubscription ? "subscription" : "payment",
            locale: "es",
            customer_email: customerEmail,
            line_items: [
                {
                    price_data: {
                        currency: "mxn",
                        product_data: {
                            name: pkg.name + (isMember && !isSubscription ? " (10% Desc. Miembro)" : ""),
                            description: `${pkg.description} | ${vehicleSizeLabel} | Fecha: ${serviceDate}`,
                            metadata: { packageId, vehicleSize },
                        },
                        unit_amount: totalCentavos,
                        ...(isSubscription ? { recurring: { interval: "month" as const } } : {}),
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                customerName,
                customerPhone,
                address: address || "Por definir",
                vehicleInfo: `${vehicleBrand} ${vehicleModel} ${vehicleYear} ${vehicleColor}`,
                vehicleSize,
                serviceDate,
                needsFactura: needsFactura ? "sí" : "no",
                rfc: rfc || "N/A",
                razonSocial: razonSocial || "N/A",
            },
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/pago-exitoso?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/reservar?paquete=${packageId}&cancelled=true`,
        });

        // Create pending booking in Supabase
        await supabase.from("bookings").insert({
            service_date: serviceDate,
            package_name: pkg.name,
            vehicle_size: vehicleSizeLabel,
            total_amount: totalCentavos,
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone,
            address: address || "Por definir",
            vehicle_info: `${vehicleBrand} ${vehicleModel} ${vehicleYear} ${vehicleColor}`,
            stripe_session_id: session.id,
            payment_status: "pending",
            source: "online",
        });

        return NextResponse.json({ url: session.url });
    } catch (error: unknown) {
        console.error("Stripe checkout error:", error);
        const message =
            error instanceof Error ? error.message : "Error al crear sesión de pago";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
