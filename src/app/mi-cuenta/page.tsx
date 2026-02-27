"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useState } from "react";

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
    const [isMember, setIsMember] = useState(false);

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

            // Check if user is a member
            const { data: memberData } = await supabase
                .from("bookings")
                .select("id")
                .eq("customer_id", user.id)
                .neq("payment_status", "cancelled")
                .ilike("package_name", "%Membres%");

            setIsMember(!!(memberData && memberData.length > 0));

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
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                <h1 style={{ color: "#0f172a", fontFamily: "var(--font-heading)", fontSize: "1.5rem", margin: 0 }}>
                    ¡Hola, {firstName}! 👋
                </h1>
                {isMember && (
                    <span style={{
                        background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "white",
                        padding: "0.2rem 0.75rem", borderRadius: "2rem", fontSize: "0.75rem",
                        fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px",
                        boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)"
                    }}>
                        Miembro
                    </span>
                )}
            </div>
            <p style={{ color: "#64748b", marginBottom: "2rem" }}>Bienvenido a tu portal Doctor Foam</p>

            {/* Quick actions */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                {[
                    { href: "/mi-cuenta/reservar", icon: "📅", title: "Reservar servicio", desc: "Agenda tu próximo detallado" },
                    { href: "/mi-cuenta/servicios", icon: "📋", title: "Mis servicios", desc: `${bookings.length} servicio${bookings.length !== 1 ? "s" : ""}` },
                    { href: "/mi-cuenta/chat", icon: "💬", title: "Chat", desc: "Habla con nosotros" },
                    { href: "/mi-cuenta/perfil", icon: "👤", title: "Mi perfil", desc: "Editar datos" },
                ].map((item) => (
                    <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                        <div style={{
                            padding: "1.25rem", cursor: "pointer", transition: "all 0.2s",
                            backgroundColor: "white", borderRadius: "0.75rem",
                            border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                        }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.transform = "none"; }}
                        >
                            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{item.icon}</div>
                            <p style={{ color: "#0f172a", fontWeight: 600, fontSize: "0.9rem", margin: "0 0 0.25rem" }}>{item.title}</p>
                            <p style={{ color: "#64748b", fontSize: "0.8rem", margin: 0 }}>{item.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Upcoming services */}
            {!loading && upcoming.length > 0 && (
                <div style={{ marginBottom: "2rem" }}>
                    <h2 style={{ color: "#0f172a", fontFamily: "var(--font-heading)", fontSize: "1.1rem", marginBottom: "1rem" }}>
                        📅 Próximos servicios
                    </h2>
                    <div style={{ display: "grid", gap: "0.75rem" }}>
                        {upcoming.map((b) => (
                            <div key={b.id} style={{
                                padding: "1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between",
                                backgroundColor: "white", borderRadius: "0.75rem",
                                border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                            }}>
                                <div>
                                    <p style={{ color: "#0f172a", fontWeight: 600, margin: "0 0 0.25rem", fontSize: "0.95rem" }}>{b.package_name}</p>
                                    <p style={{ color: "#3b82f6", fontSize: "0.85rem", margin: 0, fontWeight: 500 }}>
                                        📅 {new Date(b.service_date + "T12:00:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
                                    </p>
                                </div>
                                <div style={{
                                    padding: "0.3rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600,
                                    background: b.payment_status === "paid" ? "#dcfce7" : "#fef3c7",
                                    color: b.payment_status === "paid" ? "#16a34a" : "#d97706",
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
                    <h2 style={{ color: "#0f172a", fontFamily: "var(--font-heading)", fontSize: "1.1rem", marginBottom: "1rem" }}>
                        ✅ Servicios anteriores
                    </h2>
                    <div style={{ display: "grid", gap: "0.5rem" }}>
                        {past.slice(0, 3).map((b) => (
                            <div key={b.id} style={{
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                padding: "0.75rem 1rem", borderRadius: "0.5rem", background: "white", border: "1px solid #e2e8f0"
                            }}>
                                <div>
                                    <p style={{ color: "#334155", fontWeight: 500, fontSize: "0.85rem", margin: 0 }}>{b.package_name}</p>
                                    <p style={{ color: "#64748b", fontSize: "0.75rem", margin: 0 }}>
                                        {new Date(b.service_date + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                                    </p>
                                </div>
                                <span style={{ color: "#10b981", fontWeight: 600, fontSize: "0.8rem" }}>
                                    ${(b.total_amount / 100).toLocaleString("es-MX")}
                                </span>
                            </div>
                        ))}
                        {past.length > 3 && (
                            <Link href="/mi-cuenta/servicios" style={{ color: "#2563eb", fontSize: "0.85rem", textAlign: "center", display: "block", marginTop: "0.5rem", fontWeight: 500 }}>
                                Ver todos →
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {!loading && bookings.length === 0 && (
                <div style={{
                    padding: "3rem 2rem", textAlign: "center", backgroundColor: "white",
                    borderRadius: "1rem", border: "1px dashed #cbd5e1"
                }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚗</div>
                    <p style={{ color: "#0f172a", fontWeight: 600, marginBottom: "0.5rem" }}>¡Bienvenido a Doctor Foam!</p>
                    <p style={{ color: "#64748b", marginBottom: "1.5rem", fontSize: "0.9rem" }}>Aún no tienes servicios. Reserva tu primer detallado automotriz.</p>
                    <Link href="/mi-cuenta/reservar">
                        <button className="btn-premium" style={{ fontSize: "0.9rem", margin: "0 auto" }}>📅 Reservar ahora</button>
                    </Link>
                </div>
            )}
        </div>
    );
}
