"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Booking = {
    id: string;
    service_date: string;
    package_name: string;
    payment_status: string;
    total_amount: number;
    vehicle_info: string;
    address: string;
    source: string;
    created_at: string;
};

export default function ServicesPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
    const [cancelling, setCancelling] = useState<string | null>(null);

    useEffect(() => {
        const fetchBookings = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("bookings")
                .select("*")
                .eq("customer_id", user.id)
                .order("service_date", { ascending: false });

            setBookings(data || []);
            setLoading(false);
        };
        fetchBookings();
    }, []);

    const today = new Date().toISOString().split("T")[0];
    const filtered = bookings.filter((b) => {
        if (filter === "upcoming") return b.service_date >= today && b.payment_status !== "cancelled";
        if (filter === "past") return b.service_date < today;
        return true;
    });

    const handleCancel = async (bookingId: string) => {
        if (!confirm("¿Estás seguro de cancelar esta reserva? Esta acción no se puede deshacer.")) return;
        setCancelling(bookingId);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const res = await fetch("/api/bookings/cancel", {
                method: "POST",
                headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ booking_id: bookingId }),
            });
            const data = await res.json();
            if (res.ok) {
                setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, payment_status: "cancelled" } : b));
            } else {
                alert(data.error || "Error al cancelar");
            }
        } catch {
            alert("Error de conexión");
        } finally {
            setCancelling(null);
        }
    };

    return (
        <div>
            <h1 style={{ color: "white", fontFamily: "var(--font-heading)", fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                📋 Mis servicios
            </h1>
            <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>Historial completo de tus servicios Doctor Foam</p>

            {/* Filter tabs */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
                {(["all", "upcoming", "past"] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: "0.5rem 1rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 600,
                            border: "1px solid", cursor: "pointer", transition: "all 0.2s",
                            background: filter === f ? "rgba(59,130,246,0.15)" : "transparent",
                            color: filter === f ? "#60a5fa" : "#64748b",
                            borderColor: filter === f ? "rgba(59,130,246,0.3)" : "rgba(96,165,250,0.1)",
                        }}
                    >
                        {f === "all" ? "Todos" : f === "upcoming" ? "Próximos" : "Anteriores"}
                    </button>
                ))}
            </div>

            {loading ? (
                <p style={{ color: "#94a3b8" }}>Cargando...</p>
            ) : filtered.length === 0 ? (
                <div className="glass-card" style={{ padding: "2rem", textAlign: "center" }}>
                    <p style={{ color: "#94a3b8" }}>No se encontraron servicios</p>
                </div>
            ) : (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                    {filtered.map((b) => {
                        const isPast = b.service_date < today;
                        return (
                            <div key={b.id} className="glass-card" style={{ padding: "1.25rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                                    <div>
                                        <p style={{ color: "white", fontWeight: 600, margin: "0 0 0.25rem", fontSize: "1rem" }}>{b.package_name}</p>
                                        <p style={{ color: "#60a5fa", fontSize: "0.85rem", margin: 0 }}>
                                            📅 {new Date(b.service_date + "T12:00:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                                        </p>
                                    </div>
                                    <div style={{
                                        padding: "0.3rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600,
                                        background: isPast ? "rgba(100,116,139,0.15)" : b.payment_status === "paid" ? "rgba(16,185,129,0.15)" : "rgba(251,191,36,0.15)",
                                        color: isPast ? "#94a3b8" : b.payment_status === "paid" ? "#34d399" : "#fbbf24",
                                    }}>
                                        {isPast ? "✅ Completado" : b.payment_status === "cancelled" ? "❌ Cancelado" : b.payment_status === "paid" ? "Confirmado" : "Pendiente"}
                                    </div>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                                    {b.vehicle_info && (
                                        <p style={{ color: "#64748b", fontSize: "0.8rem", margin: 0 }}>🚗 {b.vehicle_info}</p>
                                    )}
                                    {b.address && (
                                        <p style={{ color: "#64748b", fontSize: "0.8rem", margin: 0 }}>📍 {b.address}</p>
                                    )}
                                    <p style={{ color: "#34d399", fontSize: "0.85rem", margin: 0, fontWeight: 600 }}>
                                        💳 ${(b.total_amount / 100).toLocaleString("es-MX")} MXN
                                    </p>
                                    <p style={{ color: "#475569", fontSize: "0.75rem", margin: 0 }}>
                                        {b.source === "online" ? "🌐 En línea" : "📋 Manual"}
                                    </p>
                                </div>
                                {/* Cancel button for upcoming, non-cancelled bookings */}
                                {!isPast && b.payment_status !== "cancelled" && (
                                    <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(96,165,250,0.1)" }}>
                                        <button
                                            onClick={() => handleCancel(b.id)}
                                            disabled={cancelling === b.id}
                                            style={{
                                                padding: "0.4rem 1rem", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.3)",
                                                background: "rgba(239,68,68,0.1)", color: "#f87171", fontSize: "0.8rem",
                                                cursor: cancelling === b.id ? "wait" : "pointer", fontWeight: 600,
                                            }}
                                        >
                                            {cancelling === b.id ? "Cancelando..." : "Cancelar reserva"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
