import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerSupabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {});

/* ─── Updated packages (aligned with homepage) ─── */
const PACKAGES: Record<
    string,
    { name: string; priceBase: number; description: string }
> = {
    "deep-interior": {
        name: "Industrial Deep Interior",
        priceBase: 349900, // $3,499 MXN in centavos
        description:
            "Lavado a base de inyección y extracción, vapor seco industrial a 180°C, aspirado de alta potencia, hidratación de pieles, sanitización con ozono.",
    },
    "signature-detail": {
        name: "Signature Detail",
        priceBase: 950000, // $9,500 MXN
        description:
            "Industrial Deep Interior completo + corrección de pintura en 2 etapas + sellador cerámico express. Técnicos certificados IDA.",
    },
    "ceramic-coating": {
        name: "Ceramic Coating",
        priceBase: 1499900, // $14,999 MXN
        description:
            "Signature Detail + recubrimiento cerámico profesional de larga duración + certificado Doctor Foam.",
    },
    "graphene-upgrade": {
        name: "Ceramic Coating + Graphene Shield",
        priceBase: 1799900, // $17,999 MXN
        description:
            "Signature Detail + recubrimiento de grafeno 5-7 años + PPF en zonas de alto impacto + certificado Doctor Foam.",
    },
    "foam-maintenance": {
        name: "Foam Maintenance",
        priceBase: 180000, // $1,800 MXN
        description:
            "Foam cannon industrial, descontaminación química, barra de arcilla, sellador UV. Mantenimiento para clientes existentes.",
    },
    membresia: {
        name: "Membresía Doctor Foam",
        priceBase: 116000, // $1,160 MXN/mes
        description:
            "Foam Maintenance bimestral + 10% descuento en cualquier paquete. Por cliente, independientemente del vehículo.",
    },
};

/* ─── Vehicle size coefficients ─── */
const SIZE_COEFFICIENTS: Record<string, number> = {
    "sedan-2filas": 1.0,
    "pickup-3filas": 1.15,
};

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

        // Calculate price with vehicle size coefficient
        const coefficient = SIZE_COEFFICIENTS[vehicleSize] || 1.0;
        const totalCentavos = Math.round(pkg.priceBase * coefficient);
        const vehicleSizeLabel = vehicleSize === "pickup-3filas" ? "Pick Up / SUV 3 filas" : "Sedán / SUV 2 filas";
        const isSubscription = packageId === "membresia";

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: isSubscription ? "subscription" : "payment",
            locale: "es",
            customer_email: customerEmail,
            line_items: [
                {
                    price_data: {
                        currency: "mxn",
                        product_data: {
                            name: pkg.name,
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
