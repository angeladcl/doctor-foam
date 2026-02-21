"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Booking = {
    id: string;
    service_date: string;
    package_name: string;
    payment_status: string;
    total_amount: number;
};

export default function PortalDashboard() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            setUserName(user.user_metadata?.full_name || user.email || "Cliente");

            // Fetch bookings linked to this customer
            const { data } = await supabase
                .from("bookings")
                .select("id, service_date, package_name, payment_status, total_amount")
                .eq("customer_id", user.id)
                .neq("payment_status", "cancelled")
                .order("service_date", { ascending: false })
                .limit(5);

            setBookings(data || []);
            setLoading(false);
        };
        fetchData();
    }, []);

    const today = new Date().toISOString().split("T")[0];
    const upcoming = bookings.filter((b) => b.service_date >= today);
    const past = bookings.filter((b) => b.service_date < today);

    const firstName = userName.split(" ")[0];

    return (
        <div>
            <h1 style={{ color: "white", fontFamily: "var(--font-heading)", fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                ¡Hola, {firstName}! 👋
            </h1>
            <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>Bienvenido a tu portal Doctor Foam</p>

            {/* Quick actions */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                {[
                    { href: "/mi-cuenta/reservar", icon: "📅", title: "Reservar servicio", desc: "Agenda tu próximo detallado" },
                    { href: "/mi-cuenta/servicios", icon: "📋", title: "Mis servicios", desc: `${bookings.length} servicio${bookings.length !== 1 ? "s" : ""}` },
                    { href: "/mi-cuenta/chat", icon: "💬", title: "Chat", desc: "Habla con nosotros" },
                    { href: "/mi-cuenta/perfil", icon: "👤", title: "Mi perfil", desc: "Editar datos" },
                ].map((item) => (
                    <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                        <div className="glass-card" style={{
                            padding: "1.25rem", cursor: "pointer", transition: "all 0.2s",
                            borderColor: "rgba(96,165,250,0.15)",
                        }}>
                            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{item.icon}</div>
                            <p style={{ color: "white", fontWeight: 600, fontSize: "0.9rem", margin: "0 0 0.25rem" }}>{item.title}</p>
                            <p style={{ color: "#64748b", fontSize: "0.8rem", margin: 0 }}>{item.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Upcoming services */}
            {!loading && upcoming.length > 0 && (
                <div style={{ marginBottom: "2rem" }}>
                    <h2 style={{ color: "white", fontFamily: "var(--font-heading)", fontSize: "1.1rem", marginBottom: "1rem" }}>
                        📅 Próximos servicios
                    </h2>
                    <div style={{ display: "grid", gap: "0.75rem" }}>
                        {upcoming.map((b) => (
                            <div key={b.id} className="glass-card" style={{ padding: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div>
                                    <p style={{ color: "white", fontWeight: 600, margin: "0 0 0.25rem", fontSize: "0.9rem" }}>{b.package_name}</p>
                                    <p style={{ color: "#60a5fa", fontSize: "0.8rem", margin: 0 }}>
                                        📅 {new Date(b.service_date + "T12:00:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
                                    </p>
                                </div>
                                <div style={{
                                    padding: "0.3rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600,
                                    background: b.payment_status === "paid" ? "rgba(16,185,129,0.15)" : "rgba(251,191,36,0.15)",
                                    color: b.payment_status === "paid" ? "#34d399" : "#fbbf24",
                                }}>
                                    {b.payment_status === "paid" ? "✅ Confirmado" : "⏳ Pendiente"}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Past services */}
            {!loading && past.length > 0 && (
                <div>
                    <h2 style={{ color: "white", fontFamily: "var(--font-heading)", fontSize: "1.1rem", marginBottom: "1rem" }}>
                        ✅ Servicios anteriores
                    </h2>
                    <div style={{ display: "grid", gap: "0.5rem" }}>
                        {past.slice(0, 3).map((b) => (
                            <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", borderRadius: "0.5rem", background: "rgba(15,34,64,0.3)" }}>
                                <div>
                                    <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: 0 }}>{b.package_name}</p>
                                    <p style={{ color: "#475569", fontSize: "0.75rem", margin: 0 }}>
                                        {new Date(b.service_date + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                                    </p>
                                </div>
                                <span style={{ color: "#34d399", fontWeight: 600, fontSize: "0.8rem" }}>
                                    ${(b.total_amount / 100).toLocaleString("es-MX")}
                                </span>
                            </div>
                        ))}
                        {past.length > 3 && (
                            <Link href="/mi-cuenta/servicios" style={{ color: "#60a5fa", fontSize: "0.85rem", textAlign: "center", display: "block" }}>
                                Ver todos →
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {!loading && bookings.length === 0 && (
                <div className="glass-card" style={{ padding: "2rem", textAlign: "center" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚗</div>
                    <p style={{ color: "white", fontWeight: 600, marginBottom: "0.5rem" }}>¡Bienvenido a Doctor Foam!</p>
                    <p style={{ color: "#94a3b8", marginBottom: "1.5rem", fontSize: "0.9rem" }}>Aún no tienes servicios. Reserva tu primer detallado automotriz.</p>
                    <Link href="/mi-cuenta/reservar">
                        <button className="btn-premium" style={{ fontSize: "0.9rem" }}>📅 Reservar ahora</button>
                    </Link>
                </div>
            )}
        </div>
    );
}
