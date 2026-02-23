import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/* Helper: authenticate admin from Authorization header */
async function authenticateAdmin(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return null;
    }
    const token = authHeader.split(" ")[1];
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    if (user.app_metadata?.role !== "admin") return null;
    return { supabase, user };
}

/* GET — List all bookings */
export async function GET(request: NextRequest) {
    const auth = await authenticateAdmin(request);
    if (!auth) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    const firstDay = new Date(year, month - 1, 1).toISOString().split("T")[0];
    const lastDay = new Date(year, month, 0).toISOString().split("T")[0];

    const { data, error } = await auth.supabase
        .from("bookings")
        .select("*")
        .gte("service_date", firstDay)
        .lte("service_date", lastDay)
        .neq("payment_status", "cancelled")
        .order("service_date", { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ bookings: data });
}

/* POST — Create manual booking */
export async function POST(request: NextRequest) {
    const auth = await authenticateAdmin(request);
    if (!auth) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { service_date, package_name, customer_name, customer_phone, vehicle_info, notes } = body;

    if (!service_date || !package_name || !customer_name) {
        return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    // Check if date is already occupied
    const { data: existing } = await auth.supabase
        .from("bookings")
        .select("id")
        .eq("service_date", service_date)
        .in("payment_status", ["paid", "manual"]);

    if (existing && existing.length > 0) {
        return NextResponse.json({ error: "Esta fecha ya está ocupada" }, { status: 409 });
    }

    const { data, error } = await auth.supabase
        .from("bookings")
        .insert({
            service_date,
            package_name,
            customer_name,
            customer_phone: customer_phone || "",
            vehicle_info: vehicle_info || "",
            notes: notes || "",
            payment_status: "manual",
            source: "admin",
            total_amount: 0,
            vehicle_size: "sedan",
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send admin notification for manual booking
    try {
        const { sendAdminNotification } = await import("@/lib/email");
        await sendAdminNotification({
            customerName: customer_name,
            customerEmail: "",
            customerPhone: customer_phone || "",
            packageName: package_name,
            serviceDate: service_date,
            vehicleInfo: vehicle_info || "",
            vehicleSize: "N/A",
            address: "",
            totalAmount: 0,
            paymentStatus: "manual",
            source: "admin",
        });
    } catch (emailErr) {
        console.error("Error sending admin email:", emailErr);
    }

    return NextResponse.json({ booking: data });
}

/* DELETE — Cancel a booking */
export async function DELETE(request: NextRequest) {
    const auth = await authenticateAdmin(request);
    if (!auth) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "Falta ID" }, { status: 400 });
    }

    const { error } = await auth.supabase
        .from("bookings")
        .update({ payment_status: "cancelled" })
        .eq("id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

/* PATCH — Update/reschedule a booking */
export async function PATCH(request: NextRequest) {
    const auth = await authenticateAdmin(request);
    if (!auth) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
        return NextResponse.json({ error: "Falta ID" }, { status: 400 });
    }

    // If rescheduling, check new date availability
    if (updates.service_date) {
        const { data: existing } = await auth.supabase
            .from("bookings")
            .select("id")
            .eq("service_date", updates.service_date)
            .neq("id", id)
            .in("payment_status", ["paid", "manual", "pending", "completed", "rescheduled"]);

        if (existing && existing.length > 0) {
            return NextResponse.json({ error: "La nueva fecha ya está ocupada" }, { status: 409 });
        }

        // Check if date is blocked
        const { data: blocked } = await auth.supabase
            .from("blocked_dates")
            .select("id")
            .eq("blocked_date", updates.service_date);

        if (blocked && blocked.length > 0) {
            return NextResponse.json({ error: "La nueva fecha está bloqueada" }, { status: 409 });
        }
    }

    // Only allow safe fields
    const allowedFields = [
        "service_date", "package_name", "customer_name", "customer_phone",
        "customer_email", "vehicle_info", "vehicle_size", "address",
        "notes", "payment_status",
    ];

    const safeUpdates: Record<string, string> = {};
    for (const key of allowedFields) {
        if (key in updates) {
            safeUpdates[key] = updates[key];
        }
    }

    if (Object.keys(safeUpdates).length === 0) {
        return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 });
    }

    const { data, error } = await auth.supabase
        .from("bookings")
        .update(safeUpdates)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ booking: data });
}
