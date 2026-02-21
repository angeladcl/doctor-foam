"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Booking = {
    id: string;
    service_date: string;
    package_name: string;
    vehicle_size: string;
    total_amount: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    address: string;
    vehicle_info: string;
    payment_status: string;
    source: string;
    notes: string;
};

type BlockedDate = {
    id: string;
    blocked_date: string;
    reason: string;
};

/* ─── Calendar Component (Admin version) ─── */
function AdminCalendar({
    bookings,
    blockedDates,
    onDayClick,
}: {
    bookings: Booking[];
    blockedDates: BlockedDate[];
    onDayClick: (date: string, type: "booked" | "blocked" | "free") => void;
}) {
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ];
    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    const bookedDates = new Set(bookings.map((b) => b.service_date));
    const blockedSet = new Set(blockedDates.map((b) => b.blocked_date));

    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) days.push(<div key={`e-${i}`} />);

    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(currentYear, currentMonth, d);
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const isBooked = bookedDates.has(dateStr);
        const isBlocked = blockedSet.has(dateStr);
        const isSunday = date.getDay() === 0;
        const isPast = date < today;
        const isToday = date.getTime() === today.getTime();

        let bg = "rgba(15, 34, 64, 0.4)";
        let color = "#e2e8f0";
        let border = "1px solid rgba(96, 165, 250, 0.1)";
        let type: "booked" | "blocked" | "free" = "free";

        if (isBooked) {
            bg = "rgba(59, 130, 246, 0.2)";
            border = "2px solid rgba(59, 130, 246, 0.5)";
            color = "#60a5fa";
            type = "booked";
        } else if (isBlocked) {
            bg = "rgba(239, 68, 68, 0.15)";
            border = "1px solid rgba(239, 68, 68, 0.3)";
            color = "#f87171";
            type = "blocked";
        } else if (isPast || isSunday) {
            bg = "rgba(15, 23, 42, 0.3)";
            color = "#475569";
        }

        days.push(
            <button
                key={d}
                type="button"
                onClick={() => !isPast && !isSunday && onDayClick(dateStr, type)}
                disabled={isPast || isSunday}
                style={{
                    width: "100%", aspectRatio: "1", border, borderRadius: "0.5rem", background: bg,
                    color, cursor: isPast || isSunday ? "not-allowed" : "pointer",
                    fontWeight: isToday ? 800 : 400, fontSize: "0.9rem",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative" as const, transition: "all 0.2s",
                }}
            >
                {d}
                {isBooked && <span style={{ position: "absolute", top: "3px", right: "5px", fontSize: "0.6rem" }}>📅</span>}
                {isBlocked && <span style={{ position: "absolute", top: "3px", right: "5px", fontSize: "0.6rem" }}>🚫</span>}
            </button>
        );
    }

    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <button type="button" onClick={() => {
                    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
                    else setCurrentMonth(currentMonth - 1);
                }} style={{ background: "none", border: "none", color: "#e2e8f0", cursor: "pointer", fontSize: "1.2rem", padding: "0.5rem" }}>←</button>
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "white", fontSize: "1.1rem" }}>
                    {monthNames[currentMonth]} {currentYear}
                </span>
                <button type="button" onClick={() => {
                    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
                    else setCurrentMonth(currentMonth + 1);
                }} style={{ background: "none", border: "none", color: "#e2e8f0", cursor: "pointer", fontSize: "1.2rem", padding: "0.5rem" }}>→</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.25rem", marginBottom: "0.5rem" }}>
                {dayNames.map((dn) => (
                    <div key={dn} style={{ textAlign: "center", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", padding: "0.25rem" }}>{dn}</div>
                ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.3rem" }}>
                {days}
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", fontSize: "0.75rem", color: "#94a3b8", flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "rgba(59, 130, 246, 0.3)", border: "1px solid rgba(59,130,246,0.5)" }} /> Reservado
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "rgba(239, 68, 68, 0.2)" }} /> Bloqueado
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "rgba(15, 34, 64, 0.4)", border: "1px solid rgba(96,165,250,0.1)" }} /> Disponible
                </span>
            </div>
        </div>
    );
}

export default function AdminDashboardPage() {
    const router = useRouter();
    const [session, setSession] = useState<{ access_token: string } | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
    const [loadingData, setLoadingData] = useState(false);

    /* Modal states */
    const [showAddModal, setShowAddModal] = useState(false);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState<Booking | null>(null);
    const [selectedDate, setSelectedDate] = useState("");

    /* New booking form */
    const [newBooking, setNewBooking] = useState({
        customer_name: "",
        package_name: "Foam Maintenance",
        customer_phone: "",
        vehicle_info: "",
        notes: "",
    });

    const [blockReason, setBlockReason] = useState("");

    /* Check auth */
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) {
                setSession(data.session);
            } else {
                router.push("/admin/login");
            }
            setLoadingAuth(false);
        });
    }, [router]);

    /* Fetch data */
    const fetchData = useCallback(async () => {
        if (!session) return;
        setLoadingData(true);
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        try {
            const [bookingsRes, blockedRes] = await Promise.all([
                fetch(`/api/admin/bookings?month=${month}&year=${year}`, {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                }),
                fetch(`/api/admin/blocked-dates?month=${month}&year=${year}`, {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                }),
            ]);

            const bookingsData = await bookingsRes.json();
            const blockedData = await blockedRes.json();

            setBookings(bookingsData.bookings || []);
            setBlockedDates(blockedData.blocked_dates || []);
        } catch (err) {
            console.error("Error fetching data:", err);
        }
        setLoadingData(false);
    }, [session]);

    useEffect(() => {
        if (session) fetchData();
    }, [session, fetchData]);

    /* Handle calendar day click */
    const handleDayClick = (date: string, type: "booked" | "blocked" | "free") => {
        setSelectedDate(date);
        if (type === "booked") {
            const booking = bookings.find((b) => b.service_date === date);
            if (booking) setShowDetailModal(booking);
        } else if (type === "blocked") {
            // Show option to unblock
            if (confirm(`¿Desbloquear el día ${date}?`)) {
                const bd = blockedDates.find((b) => b.blocked_date === date);
                if (bd) handleUnblock(bd.id);
            }
        } else {
            // Free day - show options
            setShowAddModal(true);
        }
    };

    /* Add manual booking */
    const handleAddBooking = async () => {
        if (!session || !newBooking.customer_name) return;
        try {
            const res = await fetch("/api/admin/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
                body: JSON.stringify({ service_date: selectedDate, ...newBooking }),
            });
            const data = await res.json();
            if (data.error) { alert(data.error); return; }
            setShowAddModal(false);
            setNewBooking({ customer_name: "", package_name: "Foam Maintenance", customer_phone: "", vehicle_info: "", notes: "" });
            fetchData();
        } catch { alert("Error al agregar servicio"); }
    };

    /* Block a date */
    const handleBlockDate = async () => {
        if (!session) return;
        try {
            await fetch("/api/admin/blocked-dates", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
                body: JSON.stringify({ blocked_date: selectedDate, reason: blockReason }),
            });
            setShowBlockModal(false);
            setBlockReason("");
            fetchData();
        } catch { alert("Error al bloquear fecha"); }
    };

    /* Unblock a date */
    const handleUnblock = async (id: string) => {
        if (!session) return;
        try {
            await fetch(`/api/admin/blocked-dates?id=${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${session.access_token}` },
            });
            fetchData();
        } catch { alert("Error al desbloquear fecha"); }
    };

    /* Cancel booking */
    const handleCancelBooking = async (id: string) => {
        if (!session || !confirm("¿Cancelar esta reserva?")) return;
        try {
            await fetch(`/api/admin/bookings?id=${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${session.access_token}` },
            });
            setShowDetailModal(null);
            fetchData();
        } catch { alert("Error al cancelar"); }
    };

    /* Logout */
    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/admin/login");
    };

    if (loadingAuth) {
        return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>Verificando sesión...</div>;
    }

    /* Stats */
    const totalBookings = bookings.length;
    const paidBookings = bookings.filter((b) => b.payment_status === "paid").length;
    const totalRevenue = bookings.filter((b) => b.payment_status === "paid").reduce((sum, b) => sum + b.total_amount, 0) / 100;
    const nextBooking = bookings.filter((b) => b.service_date >= new Date().toISOString().split("T")[0]).sort((a, b) => a.service_date.localeCompare(b.service_date))[0];

    return (
        <div style={{ minHeight: "100vh", background: "var(--color-bg-primary)" }}>
            {/* Navbar */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
                background: "rgba(10, 22, 40, 0.95)", backdropFilter: "blur(20px)",
                borderBottom: "1px solid rgba(96, 165, 250, 0.1)", padding: "0.75rem 1.5rem",
                display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
                <Link href="/" style={{ textDecoration: "none" }}>
                    <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.2rem", color: "white" }}>
                        DOCTOR <span className="gradient-text">FOAM</span>
                    </span>
                </Link>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span style={{ fontFamily: "var(--font-heading)", fontSize: "0.8rem", color: "#64748b" }}>Admin Panel</span>
                    <button onClick={handleLogout} style={{
                        background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)",
                        color: "#f87171", padding: "0.4rem 1rem", borderRadius: "0.5rem",
                        cursor: "pointer", fontSize: "0.8rem", fontFamily: "var(--font-heading)",
                    }}>
                        Salir
                    </button>
                </div>
            </nav>

            <main style={{ paddingTop: "5rem", paddingBottom: "3rem" }}>
                <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem" }}>

                    {/* Stats Row */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                        {[
                            { label: "Reservas este mes", value: totalBookings, icon: "📅" },
                            { label: "Pagadas", value: paidBookings, icon: "✅" },
                            { label: "Ingresos", value: `$${totalRevenue.toLocaleString("es-MX")}`, icon: "💰" },
                            { label: "Próximo servicio", value: nextBooking ? new Date(nextBooking.service_date + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" }) : "—", icon: "🗓️" },
                        ].map((stat) => (
                            <div key={stat.label} className="glass-card" style={{ padding: "1.25rem", textAlign: "center" }}>
                                <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>{stat.icon}</div>
                                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.3rem", color: "white" }}>{stat.value}</div>
                                <div style={{ color: "#64748b", fontSize: "0.75rem", fontFamily: "var(--font-heading)" }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                        {/* Calendar */}
                        <div className="glass-card" style={{ padding: "1.5rem" }}>
                            <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem", fontFamily: "var(--font-heading)" }}>Calendario</h2>
                            {loadingData ? (
                                <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>Cargando...</div>
                            ) : (
                                <AdminCalendar bookings={bookings} blockedDates={blockedDates} onDayClick={handleDayClick} />
                            )}
                        </div>

                        {/* Bookings List */}
                        <div className="glass-card" style={{ padding: "1.5rem", maxHeight: "600px", overflowY: "auto" }}>
                            <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem", fontFamily: "var(--font-heading)" }}>Reservas del mes</h2>
                            {bookings.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>No hay reservas este mes</div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                    {bookings.map((b) => (
                                        <button
                                            key={b.id}
                                            onClick={() => setShowDetailModal(b)}
                                            style={{
                                                padding: "1rem", borderRadius: "0.75rem", cursor: "pointer",
                                                border: "1px solid rgba(96, 165, 250, 0.15)", textAlign: "left",
                                                background: "rgba(15, 34, 64, 0.4)", color: "white",
                                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{b.customer_name}</div>
                                                <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>{b.package_name}</div>
                                                <div style={{ color: "#64748b", fontSize: "0.75rem" }}>
                                                    {new Date(b.service_date + "T12:00:00").toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" })}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <span style={{
                                                    fontSize: "0.7rem", fontWeight: 600, padding: "0.25rem 0.5rem",
                                                    borderRadius: "1rem", fontFamily: "var(--font-heading)",
                                                    background: b.payment_status === "paid" ? "rgba(16, 185, 129, 0.15)" : b.payment_status === "manual" ? "rgba(168, 85, 247, 0.15)" : "rgba(245, 158, 11, 0.15)",
                                                    color: b.payment_status === "paid" ? "#34d399" : b.payment_status === "manual" ? "#a78bfa" : "#fbbf24",
                                                }}>
                                                    {b.payment_status === "paid" ? "Pagado" : b.payment_status === "manual" ? "Manual" : "Pendiente"}
                                                </span>
                                                {b.total_amount > 0 && (
                                                    <div style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                                                        ${(b.total_amount / 100).toLocaleString("es-MX")}
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* ─── Add Booking Modal ─── */}
            {showAddModal && (
                <div style={overlayStyle}>
                    <div className="glass-card" style={{ maxWidth: "500px", width: "90%", padding: "2rem" }}>
                        <h3 style={{ fontFamily: "var(--font-heading)", marginBottom: "0.5rem" }}>Agregar servicio manual</h3>
                        <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
                            Fecha: {selectedDate && new Date(selectedDate + "T12:00:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
                        </p>
                        <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1.5rem" }}>
                            <input placeholder="Nombre del cliente *" value={newBooking.customer_name} onChange={(e) => setNewBooking({ ...newBooking, customer_name: e.target.value })} style={modalInputStyle} />
                            <select value={newBooking.package_name} onChange={(e) => setNewBooking({ ...newBooking, package_name: e.target.value })} style={modalInputStyle}>
                                <option value="Industrial Deep Interior">Industrial Deep Interior</option>
                                <option value="Signature Detail">Signature Detail</option>
                                <option value="Ceramic Coating">Ceramic Coating</option>
                                <option value="Ceramic + Graphene Shield">Ceramic + Graphene Shield</option>
                                <option value="Foam Maintenance">Foam Maintenance</option>
                            </select>
                            <input placeholder="Teléfono / WhatsApp" value={newBooking.customer_phone} onChange={(e) => setNewBooking({ ...newBooking, customer_phone: e.target.value })} style={modalInputStyle} />
                            <input placeholder="Vehículo (marca, modelo, color)" value={newBooking.vehicle_info} onChange={(e) => setNewBooking({ ...newBooking, vehicle_info: e.target.value })} style={modalInputStyle} />
                            <textarea placeholder="Notas" value={newBooking.notes} onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })} style={{ ...modalInputStyle, minHeight: "60px", resize: "vertical" as const }} />
                        </div>
                        <div style={{ display: "flex", gap: "0.75rem" }}>
                            <button onClick={() => setShowAddModal(false)} style={{ ...modalBtnStyle, flex: 1, background: "rgba(15, 34, 64, 0.6)", color: "#94a3b8" }}>Cancelar</button>
                            <button onClick={() => { setShowAddModal(false); setShowBlockModal(true); }} style={{ ...modalBtnStyle, flex: 1, background: "rgba(239, 68, 68, 0.15)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.3)" }}>Bloquear día</button>
                            <button onClick={handleAddBooking} className="btn-premium" style={{ flex: 1, justifyContent: "center", fontSize: "0.85rem" }}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Block Date Modal ─── */}
            {showBlockModal && (
                <div style={overlayStyle}>
                    <div className="glass-card" style={{ maxWidth: "400px", width: "90%", padding: "2rem" }}>
                        <h3 style={{ fontFamily: "var(--font-heading)", marginBottom: "0.5rem", color: "#f87171" }}>🚫 Bloquear día</h3>
                        <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
                            {selectedDate && new Date(selectedDate + "T12:00:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
                        </p>
                        <input placeholder="Motivo (opcional)" value={blockReason} onChange={(e) => setBlockReason(e.target.value)} style={{ ...modalInputStyle, marginBottom: "1.5rem" }} />
                        <div style={{ display: "flex", gap: "0.75rem" }}>
                            <button onClick={() => setShowBlockModal(false)} style={{ ...modalBtnStyle, flex: 1, background: "rgba(15, 34, 64, 0.6)", color: "#94a3b8" }}>Cancelar</button>
                            <button onClick={handleBlockDate} style={{ ...modalBtnStyle, flex: 1, background: "rgba(239, 68, 68, 0.2)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.4)" }}>Bloquear</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Booking Detail Modal ─── */}
            {showDetailModal && (
                <div style={overlayStyle}>
                    <div className="glass-card" style={{ maxWidth: "500px", width: "90%", padding: "2rem" }}>
                        <h3 style={{ fontFamily: "var(--font-heading)", marginBottom: "1rem" }}>Detalle de reserva</h3>
                        <div style={{ display: "grid", gap: "0.5rem", marginBottom: "1.5rem" }}>
                            {[
                                { label: "Cliente", value: showDetailModal.customer_name },
                                { label: "Servicio", value: showDetailModal.package_name },
                                { label: "Fecha", value: new Date(showDetailModal.service_date + "T12:00:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) },
                                { label: "Vehículo", value: showDetailModal.vehicle_info || "—" },
                                { label: "Tamaño", value: showDetailModal.vehicle_size || "—" },
                                { label: "Dirección", value: showDetailModal.address || "—" },
                                { label: "Teléfono", value: showDetailModal.customer_phone || "—" },
                                { label: "Email", value: showDetailModal.customer_email || "—" },
                                { label: "Monto", value: showDetailModal.total_amount > 0 ? `$${(showDetailModal.total_amount / 100).toLocaleString("es-MX")} MXN` : "Manual" },
                                { label: "Estado", value: showDetailModal.payment_status === "paid" ? "✅ Pagado" : showDetailModal.payment_status === "manual" ? "🟣 Manual" : "⏳ Pendiente" },
                                { label: "Origen", value: showDetailModal.source === "online" ? "En línea" : "Admin" },
                                { label: "Notas", value: showDetailModal.notes || "—" },
                            ].map((item) => (
                                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: "1px solid rgba(96,165,250,0.08)" }}>
                                    <span style={{ color: "#64748b", fontSize: "0.85rem" }}>{item.label}</span>
                                    <span style={{ color: "white", fontSize: "0.85rem", fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: "flex", gap: "0.75rem" }}>
                            <button onClick={() => setShowDetailModal(null)} style={{ ...modalBtnStyle, flex: 2, background: "rgba(15, 34, 64, 0.6)", color: "#94a3b8" }}>Cerrar</button>
                            {showDetailModal.customer_phone && (
                                <a href={`https://wa.me/${showDetailModal.customer_phone.replace(/\D/g, "")}?text=Hola ${showDetailModal.customer_name}, soy de Doctor Foam.`} target="_blank" rel="noopener noreferrer" style={{ ...modalBtnStyle, flex: 1, background: "rgba(37, 211, 102, 0.15)", color: "#25d366", textDecoration: "none", textAlign: "center", border: "1px solid rgba(37,211,102,0.3)" }}>
                                    WhatsApp
                                </a>
                            )}
                            <button onClick={() => handleCancelBooking(showDetailModal.id)} style={{ ...modalBtnStyle, flex: 1, background: "rgba(239, 68, 68, 0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const overlayStyle: React.CSSProperties = {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(8px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 200, padding: "1rem",
};

const modalInputStyle: React.CSSProperties = {
    width: "100%", padding: "0.75rem 1rem", borderRadius: "0.5rem",
    border: "1px solid rgba(96, 165, 250, 0.2)", background: "rgba(10, 22, 40, 0.8)",
    color: "white", fontSize: "0.9rem", outline: "none",
};

const modalBtnStyle: React.CSSProperties = {
    padding: "0.75rem 1rem", borderRadius: "0.5rem", border: "1px solid rgba(96, 165, 250, 0.15)",
    cursor: "pointer", fontSize: "0.85rem", fontFamily: "var(--font-heading)", fontWeight: 600,
};
