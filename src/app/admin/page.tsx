"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AdminLayout from "@/components/AdminLayout";

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
    const [searchQuery, setSearchQuery] = useState("");

    /* Service manager states */
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState<Partial<Booking>>({});
    const [rescheduleDate, setRescheduleDate] = useState("");
    const [showReschedule, setShowReschedule] = useState(false);
    const [saving, setSaving] = useState(false);

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

    /* Open detail modal */
    const openDetail = (booking: Booking) => {
        setShowDetailModal(booking);
        setEditMode(false);
        setShowReschedule(false);
        setEditData({});
        setRescheduleDate("");
    };

    /* Start edit mode */
    const startEdit = () => {
        if (!showDetailModal) return;
        setEditData({
            customer_name: showDetailModal.customer_name,
            customer_phone: showDetailModal.customer_phone,
            customer_email: showDetailModal.customer_email,
            vehicle_info: showDetailModal.vehicle_info,
            package_name: showDetailModal.package_name,
            address: showDetailModal.address,
            notes: showDetailModal.notes,
        });
        setEditMode(true);
    };

    /* Save edits */
    const handleSaveEdit = async () => {
        if (!session || !showDetailModal) return;
        setSaving(true);
        try {
            const res = await fetch("/api/admin/bookings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
                body: JSON.stringify({ id: showDetailModal.id, ...editData }),
            });
            const data = await res.json();
            if (data.error) { alert(data.error); setSaving(false); return; }
            setShowDetailModal(data.booking);
            setEditMode(false);
            fetchData();
        } catch { alert("Error al guardar"); }
        setSaving(false);
    };

    /* Reschedule */
    const handleReschedule = async () => {
        if (!session || !showDetailModal || !rescheduleDate) return;
        setSaving(true);
        try {
            const res = await fetch("/api/admin/bookings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
                body: JSON.stringify({ id: showDetailModal.id, service_date: rescheduleDate }),
            });
            const data = await res.json();
            if (data.error) { alert(data.error); setSaving(false); return; }
            setShowDetailModal(data.booking);
            setShowReschedule(false);
            setRescheduleDate("");
            fetchData();
        } catch { alert("Error al reprogramar"); }
        setSaving(false);
    };

    /* Change status */
    const handleStatusChange = async (newStatus: string) => {
        if (!session || !showDetailModal) return;
        setSaving(true);
        try {
            const res = await fetch("/api/admin/bookings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
                body: JSON.stringify({ id: showDetailModal.id, payment_status: newStatus }),
            });
            const data = await res.json();
            if (data.error) { alert(data.error); setSaving(false); return; }
            setShowDetailModal(data.booking);
            fetchData();
        } catch { alert("Error al cambiar estado"); }
        setSaving(false);
    };

    /* ─── Status helpers ─── */
    const statusStyle = (s: string): React.CSSProperties => {
        switch (s) {
            case "completed": return { background: "rgba(16,185,129,0.15)", color: "#34d399" };
            case "paid": return { background: "rgba(59,130,246,0.15)", color: "#60a5fa" };
            case "manual": return { background: "rgba(168,85,247,0.15)", color: "#a78bfa" };
            case "pending": return { background: "rgba(245,158,11,0.15)", color: "#fbbf24" };
            case "no-show": return { background: "rgba(239,68,68,0.15)", color: "#f87171" };
            case "rescheduled": return { background: "rgba(6,182,212,0.15)", color: "#22d3ee" };
            case "cancelled": return { background: "rgba(100,116,139,0.15)", color: "#94a3b8" };
            default: return { background: "rgba(245,158,11,0.15)", color: "#fbbf24" };
        }
    };
    const statusLabel = (s: string): string => {
        switch (s) {
            case "completed": return "✅ Completado";
            case "paid": return "💰 Pagado";
            case "manual": return "🟣 Manual";
            case "pending": return "⏳ Pendiente";
            case "no-show": return "❌ No-show";
            case "rescheduled": return "🔄 Reprogramado";
            case "cancelled": return "🚫 Cancelado";
            default: return "⏳ " + s;
        }
    };

    if (loadingAuth) {
        return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>Verificando sesión...</div>;
    }

    /* Stats */
    const totalBookings = bookings.length;
    const paidBookings = bookings.filter((b) => b.payment_status === "paid").length;
    const totalRevenue = bookings.filter((b) => b.payment_status === "paid").reduce((sum, b) => sum + b.total_amount, 0) / 100;
    const nextBooking = bookings.filter((b) => b.service_date >= new Date().toISOString().split("T")[0]).sort((a, b) => a.service_date.localeCompare(b.service_date))[0];

    /* Top package */
    const packageCounts: Record<string, number> = {};
    bookings.forEach((b) => { packageCounts[b.package_name] = (packageCounts[b.package_name] || 0) + 1; });
    const topPackage = Object.entries(packageCounts).sort((a, b) => b[1] - a[1])[0];

    /* Filtered bookings for list */
    const filteredBookings = searchQuery
        ? bookings.filter((b) =>
            b.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.package_name.toLowerCase().includes(searchQuery.toLowerCase()))
        : bookings;

    return (
        <AdminLayout>
            <div>

                {/* Stats Row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                    {[
                        { label: "Reservas este mes", value: totalBookings, icon: "📅" },
                        { label: "Pagadas", value: paidBookings, icon: "✅" },
                        { label: "Ingresos", value: `$${totalRevenue.toLocaleString("es-MX")}`, icon: "💰" },
                        { label: "Próximo servicio", value: nextBooking ? new Date(nextBooking.service_date + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" }) : "—", icon: "🗓️" },
                        { label: "Top Paquete", value: topPackage ? topPackage[0].split(" ").slice(0, 2).join(" ") : "—", icon: "🏆" },
                    ].map((stat) => (
                        <div key={stat.label} className="glass-card" style={{ padding: "1.25rem", textAlign: "center" }}>
                            <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>{stat.icon}</div>
                            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.3rem", color: "white" }}>{stat.value}</div>
                            <div style={{ color: "#64748b", fontSize: "0.75rem", fontFamily: "var(--font-heading)" }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                <div className="admin-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
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
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", gap: "0.75rem" }}>
                            <h2 style={{ fontSize: "1.1rem", margin: 0, fontFamily: "var(--font-heading)", whiteSpace: "nowrap" }}>Reservas del mes</h2>
                            <input
                                type="text"
                                placeholder="🔍 Buscar cliente o paquete..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: "100%", maxWidth: "220px", padding: "0.45rem 0.75rem",
                                    borderRadius: "0.5rem", border: "1px solid rgba(96, 165, 250, 0.2)",
                                    background: "rgba(10, 22, 40, 0.6)", color: "white", fontSize: "0.8rem",
                                    outline: "none",
                                }}
                            />
                        </div>
                        {filteredBookings.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>{searchQuery ? "Sin resultados" : "No hay reservas este mes"}</div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {filteredBookings.map((b) => (
                                    <button
                                        key={b.id}
                                        onClick={() => openDetail(b)}
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
                                <input placeholder="Teléfono" value={newBooking.customer_phone} onChange={(e) => setNewBooking({ ...newBooking, customer_phone: e.target.value })} style={modalInputStyle} />
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

                {/* ─── Service Manager Modal ─── */}
                {showDetailModal && (
                    <div style={overlayStyle}>
                        <div className="glass-card" style={{ maxWidth: "560px", width: "92%", padding: "2rem", maxHeight: "90vh", overflowY: "auto" }}>
                            {/* Header */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                                <h3 style={{ fontFamily: "var(--font-heading)", margin: 0, fontSize: "1.1rem" }}>🔧 Gestión de Servicio</h3>
                                <button onClick={() => { setShowDetailModal(null); setEditMode(false); setShowReschedule(false); }} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.3rem" }}>✕</button>
                            </div>

                            {/* Status badge */}
                            <div style={{ marginBottom: "1.25rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                                    <span style={{
                                        fontSize: "0.75rem", fontWeight: 600, padding: "0.3rem 0.75rem",
                                        borderRadius: "1rem", fontFamily: "var(--font-heading)",
                                        ...statusStyle(showDetailModal.payment_status),
                                    }}>
                                        {statusLabel(showDetailModal.payment_status)}
                                    </span>
                                    <span style={{ color: "#64748b", fontSize: "0.75rem" }}>
                                        {showDetailModal.source === "online" ? "🌐 En línea" : "👤 Admin"}
                                    </span>
                                    {showDetailModal.total_amount > 0 && (
                                        <span style={{ color: "#94a3b8", fontSize: "0.8rem", fontWeight: 600 }}>
                                            ${(showDetailModal.total_amount / 100).toLocaleString("es-MX")} MXN
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Edit mode fields */}
                            {editMode ? (
                                <div style={{ display: "grid", gap: "0.6rem", marginBottom: "1.25rem" }}>
                                    {[
                                        { key: "customer_name", label: "Cliente", placeholder: "Nombre del cliente" },
                                        { key: "customer_phone", label: "Teléfono", placeholder: "Teléfono" },
                                        { key: "customer_email", label: "Email", placeholder: "Email" },
                                        { key: "vehicle_info", label: "Vehículo", placeholder: "Marca, modelo, color" },
                                        { key: "address", label: "Dirección", placeholder: "Dirección" },
                                    ].map(field => (
                                        <div key={field.key} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <label style={{ color: "#64748b", fontSize: "0.8rem", width: "80px", flexShrink: 0 }}>{field.label}</label>
                                            <input
                                                value={(editData as Record<string, string>)[field.key] || ""}
                                                onChange={e => setEditData({ ...editData, [field.key]: e.target.value })}
                                                placeholder={field.placeholder}
                                                style={modalInputStyle}
                                            />
                                        </div>
                                    ))}
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <label style={{ color: "#64748b", fontSize: "0.8rem", width: "80px", flexShrink: 0 }}>Paquete</label>
                                        <select
                                            value={editData.package_name || ""}
                                            onChange={e => setEditData({ ...editData, package_name: e.target.value })}
                                            style={modalInputStyle}
                                        >
                                            <option value="Industrial Deep Interior">Industrial Deep Interior</option>
                                            <option value="Signature Detail">Signature Detail</option>
                                            <option value="Ceramic Coating">Ceramic Coating</option>
                                            <option value="Ceramic + Graphene Shield">Ceramic + Graphene Shield</option>
                                            <option value="Foam Maintenance">Foam Maintenance</option>
                                        </select>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                                        <label style={{ color: "#64748b", fontSize: "0.8rem", width: "80px", flexShrink: 0, marginTop: "0.5rem" }}>Notas</label>
                                        <textarea
                                            value={editData.notes || ""}
                                            onChange={e => setEditData({ ...editData, notes: e.target.value })}
                                            placeholder="Notas"
                                            style={{ ...modalInputStyle, minHeight: "50px", resize: "vertical" as const }}
                                        />
                                    </div>
                                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                                        <button onClick={() => setEditMode(false)} style={{ ...modalBtnStyle, flex: 1, background: "rgba(15,34,64,0.6)", color: "#94a3b8" }}>Cancelar</button>
                                        <button onClick={handleSaveEdit} disabled={saving} className="btn-premium" style={{ flex: 1, justifyContent: "center", fontSize: "0.85rem", opacity: saving ? 0.6 : 1 }}>
                                            {saving ? "Guardando..." : "💾 Guardar"}
                                        </button>
                                    </div>
                                </div>
                            ) : showReschedule ? (
                                /* Reschedule mode */
                                <div style={{ marginBottom: "1.25rem" }}>
                                    <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                                        Fecha actual: <strong style={{ color: "white" }}>
                                            {new Date(showDetailModal.service_date + "T12:00:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
                                        </strong>
                                    </p>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                                        <label style={{ color: "#64748b", fontSize: "0.85rem" }}>Nueva fecha:</label>
                                        <input
                                            type="date"
                                            value={rescheduleDate}
                                            onChange={e => setRescheduleDate(e.target.value)}
                                            min={new Date().toISOString().split("T")[0]}
                                            style={{ ...modalInputStyle, maxWidth: "200px" }}
                                        />
                                    </div>
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        <button onClick={() => setShowReschedule(false)} style={{ ...modalBtnStyle, flex: 1, background: "rgba(15,34,64,0.6)", color: "#94a3b8" }}>Cancelar</button>
                                        <button onClick={handleReschedule} disabled={!rescheduleDate || saving} style={{
                                            ...modalBtnStyle, flex: 1,
                                            background: rescheduleDate ? "rgba(6,182,212,0.15)" : "rgba(96,165,250,0.05)",
                                            color: rescheduleDate ? "#22d3ee" : "#475569",
                                            border: `1px solid ${rescheduleDate ? "rgba(6,182,212,0.4)" : "rgba(96,165,250,0.1)"}`,
                                            opacity: saving ? 0.6 : 1,
                                        }}>
                                            {saving ? "Moviendo..." : "📅 Confirmar"}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Read-only details */
                                <div style={{ display: "grid", gap: "0.4rem", marginBottom: "1.25rem" }}>
                                    {[
                                        { label: "Cliente", value: showDetailModal.customer_name },
                                        { label: "Servicio", value: showDetailModal.package_name },
                                        { label: "Fecha", value: new Date(showDetailModal.service_date + "T12:00:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) },
                                        { label: "Vehículo", value: showDetailModal.vehicle_info || "—" },
                                        { label: "Tamaño", value: showDetailModal.vehicle_size || "—" },
                                        { label: "Dirección", value: showDetailModal.address || "—" },
                                        { label: "Teléfono", value: showDetailModal.customer_phone || "—" },
                                        { label: "Email", value: showDetailModal.customer_email || "—" },
                                        { label: "Notas", value: showDetailModal.notes || "—" },
                                    ].map((item) => (
                                        <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "0.35rem 0", borderBottom: "1px solid rgba(96,165,250,0.06)" }}>
                                            <span style={{ color: "#64748b", fontSize: "0.82rem" }}>{item.label}</span>
                                            <span style={{ color: "white", fontSize: "0.82rem", fontWeight: 500, textAlign: "right", maxWidth: "62%" }}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* ─── Status Change ─── */}
                            {!editMode && !showReschedule && (
                                <div style={{ marginBottom: "1.25rem" }}>
                                    <label style={{ color: "#64748b", fontSize: "0.78rem", marginBottom: "0.4rem", display: "block", fontFamily: "var(--font-heading)" }}>Cambiar estado</label>
                                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                                        {[
                                            { value: "completed", label: "✅ Completado", bg: "rgba(16,185,129,0.12)", color: "#34d399", border: "rgba(16,185,129,0.3)" },
                                            { value: "paid", label: "💰 Pagado", bg: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "rgba(59,130,246,0.3)" },
                                            { value: "manual", label: "🟣 Manual", bg: "rgba(168,85,247,0.12)", color: "#a78bfa", border: "rgba(168,85,247,0.3)" },
                                            { value: "pending", label: "⏳ Pendiente", bg: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "rgba(245,158,11,0.3)" },
                                            { value: "no-show", label: "❌ No-show", bg: "rgba(239,68,68,0.12)", color: "#f87171", border: "rgba(239,68,68,0.3)" },
                                            { value: "rescheduled", label: "🔄 Reprog.", bg: "rgba(6,182,212,0.12)", color: "#22d3ee", border: "rgba(6,182,212,0.3)" },
                                        ].map(st => (
                                            <button
                                                key={st.value}
                                                onClick={() => handleStatusChange(st.value)}
                                                disabled={showDetailModal.payment_status === st.value || saving}
                                                style={{
                                                    padding: "0.3rem 0.6rem", borderRadius: "0.5rem", fontSize: "0.72rem",
                                                    fontWeight: 600, cursor: showDetailModal.payment_status === st.value ? "default" : "pointer",
                                                    background: showDetailModal.payment_status === st.value ? st.bg : "rgba(15,34,64,0.4)",
                                                    color: showDetailModal.payment_status === st.value ? st.color : "#64748b",
                                                    border: `1px solid ${showDetailModal.payment_status === st.value ? st.border : "rgba(96,165,250,0.1)"}`,
                                                    transition: "all 0.2s",
                                                    opacity: showDetailModal.payment_status === st.value ? 1 : 0.8,
                                                }}
                                            >
                                                {st.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ─── Action Buttons ─── */}
                            {!editMode && !showReschedule && (
                                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                    <button onClick={() => { setShowDetailModal(null); setEditMode(false); setShowReschedule(false); }} style={{ ...modalBtnStyle, flex: 2, background: "rgba(15,34,64,0.6)", color: "#94a3b8" }}>Cerrar</button>
                                    <button onClick={startEdit} style={{ ...modalBtnStyle, flex: 1, background: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)" }}>✏️ Editar</button>
                                    <button onClick={() => setShowReschedule(true)} style={{ ...modalBtnStyle, flex: 1, background: "rgba(6,182,212,0.12)", color: "#22d3ee", border: "1px solid rgba(6,182,212,0.3)" }}>📅 Reprogramar</button>
                                    <button onClick={() => handleCancelBooking(showDetailModal.id)} style={{ ...modalBtnStyle, flex: 1, background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}>🚫 Cancelar</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
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
