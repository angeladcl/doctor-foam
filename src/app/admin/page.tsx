"use client";

import UnifiedDashboardLayout from "@/components/UnifiedDashboardLayout";
import { getGreeting } from "@/lib/booking-utils";
import type { BlockedDate, Booking } from "@/lib/types";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

/* Types imported from @/lib/types */

/* ─── Calendar Component (Admin version) ─── */
/* Confirmed statuses that occupy a calendar slot */
const CONFIRMED_STATUSES = ["paid", "manual", "completed"];

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

    const bookedDates = new Set(bookings.filter((b) => CONFIRMED_STATUSES.includes(b.payment_status)).map((b) => b.service_date));
    const pendingDates = new Set(bookings.filter((b) => b.payment_status === "pending").map((b) => b.service_date));
    const blockedSet = new Set(blockedDates.map((b) => b.blocked_date));

    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) days.push(<div key={`e-${i}`} />);

    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(currentYear, currentMonth, d);
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const isBooked = bookedDates.has(dateStr);
        const hasPending = pendingDates.has(dateStr);
        const isBlocked = blockedSet.has(dateStr);
        const isSunday = date.getDay() === 0;
        const isPast = date < today;
        const isToday = date.getTime() === today.getTime();

        let bg = "#ffffff";
        let color = "#475569";
        let border = "1px solid #cbd5e1";
        let type: "booked" | "blocked" | "free" = "free";

        if (isBooked) {
            bg = "#eff6ff";
            border = "2px solid #3b82f6";
            color = "#2563eb";
            type = "booked";
        } else if (isBlocked) {
            bg = "#fef2f2";
            border = "1px solid #fca5a5";
            color = "#ef4444";
            type = "blocked";
        } else if (isPast || isSunday) {
            bg = "#f8fafc";
            color = "#94a3b8";
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
                {hasPending && !isBooked && <span style={{ position: "absolute", bottom: "3px", left: "50%", transform: "translateX(-50%)", width: "6px", height: "6px", borderRadius: "50%", background: "#fbbf24" }} />}
            </button>
        );
    }

    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <button type="button" onClick={() => {
                    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
                    else setCurrentMonth(currentMonth - 1);
                }} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: "1.2rem", padding: "0.5rem" }}>←</button>
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "#0f172a", fontSize: "1.1rem" }}>
                    {monthNames[currentMonth]} {currentYear}
                </span>
                <button type="button" onClick={() => {
                    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
                    else setCurrentMonth(currentMonth + 1);
                }} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: "1.2rem", padding: "0.5rem" }}>→</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.25rem", marginBottom: "0.5rem" }}>
                {dayNames.map((dn) => (
                    <div key={dn} style={{ textAlign: "center", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", padding: "0.25rem" }}>{dn}</div>
                ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.3rem" }}>
                {days}
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", fontSize: "0.75rem", color: "#475569", flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#eff6ff", border: "1px solid #3b82f6" }} /> Confirmado
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#fef2f2", border: "1px solid #fca5a5" }} /> Bloqueado
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#ffffff", border: "1px solid #cbd5e1" }} /> Disponible
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f59e0b" }} /> Pendiente pago
                </span>
            </div>
        </div>
    );
}

export default function AdminDashboardPage() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);

    /* Modal states */
    const [showAddModal, setShowAddModal] = useState(false);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState<Booking | null>(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [listTab, setListTab] = useState<"confirmed" | "pending">("confirmed");
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [mySharePct, setMySharePct] = useState<number>(0);

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
        setHasMounted(true);
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    /* Fetch admin profile for revenue share */
    useEffect(() => {
        if (!session?.user?.id) return;
        (async () => {
            try {
                const res = await fetch("/api/admin/users?role=admin");
                if (res.ok) {
                    const data = await res.json();
                    const me = (data.users || []).find((u: { id: string }) => u.id === session.user.id);
                    if (me) setMySharePct(me.profit_share_pct ?? 0);
                }
            } catch { /* silent */ }
        })();
    }, [session]);

    /* Fetch data */
    const fetchData = useCallback(async () => {
        if (!session) return;
        setLoadingData(true);
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        try {
            const [bookingsRes, blockedRes] = await Promise.all([
                fetch(`/api/admin/bookings?month=${month}&year=${year}`),
                fetch(`/api/admin/blocked-dates?month=${month}&year=${year}`),
            ]);

            const bookingsData = await bookingsRes.json();
            const blockedData = await blockedRes.json();

            setBookings(bookingsData.bookings || []);
            setBlockedDates(blockedData.blocked_dates || []);
            setLastUpdated(new Date());
        } catch (err) {
            console.error("Error fetching data:", err);
        }
        setLoadingData(false);
        setRefreshing(false);
    }, [session]);

    useEffect(() => {
        if (session) {
            fetchData();
            const interval = setInterval(() => { setRefreshing(true); fetchData(); }, 60000);
            return () => clearInterval(interval);
        }
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
                headers: { "Content-Type": "application/json" },
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
                headers: { "Content-Type": "application/json" },
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
                headers: { "Content-Type": "application/json" },
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
                headers: { "Content-Type": "application/json" },
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
                headers: { "Content-Type": "application/json" },
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
            default: return "⏳ " + (s || "Sin estado");
        }
    };

    if (status === "loading" || status === "unauthenticated" || !hasMounted) {
        return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}>Cargando panel...</div>;
    }

    /* Stats */
    const confirmedBookings = bookings.filter((b) => CONFIRMED_STATUSES.includes(b.payment_status));
    const pendingBookings = bookings.filter((b) => b.payment_status === "pending");
    const totalRevenue = confirmedBookings.filter((b) => b.payment_status === "paid").reduce((sum, b) => sum + b.total_amount, 0) / 100;
    const nextBooking = confirmedBookings.filter((b) => b.service_date && b.service_date >= new Date().toISOString().split("T")[0]).sort((a, b) => (a.service_date || "").localeCompare(b.service_date || ""))[0];

    /* Top package */
    const packageCounts: Record<string, number> = {};
    confirmedBookings.forEach((b) => { packageCounts[b.package_name] = (packageCounts[b.package_name] || 0) + 1; });
    const topPackage = Object.entries(packageCounts).sort((a, b) => b[1] - a[1])[0];

    /* Revenue share — weekly amount for logged-in admin */
    const weeklyRevenue = totalRevenue / 4;
    const myWeeklyShare = weeklyRevenue * (mySharePct / 100);

    /* Filtered bookings for list based on active tab */
    const tabBookings = listTab === "confirmed" ? confirmedBookings : pendingBookings;
    const filteredBookings = searchQuery
        ? tabBookings.filter((b) =>
            b.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.package_name.toLowerCase().includes(searchQuery.toLowerCase()))
        : tabBookings;

    /* Chart Data Preparation */
    // 1. Revenue over time (Last 7 Days)
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split("T")[0];
    });

    const revenueData = last7Days.map(dateStr => {
        const dayBookings = confirmedBookings.filter(b => b.service_date === dateStr && b.payment_status === "paid");
        const revenue = dayBookings.reduce((sum, b) => sum + b.total_amount, 0) / 100;
        return {
            date: new Date(dateStr + "T12:00:00").toLocaleDateString("es-MX", { weekday: "short", day: "numeric" }),
            ingresos: revenue
        };
    });

    // 2. Bookings by Package
    const chartPackageData = Object.entries(packageCounts).map(([name, count]) => ({
        name: name.split(" ").slice(0, 2).join(" "), // Shorten name
        reservas: count
    })).sort((a, b) => b.reservas - a.reservas);

    return (
        <UnifiedDashboardLayout requiredRole="admin">
            <div>

                {/* Admin Header */}
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginBottom: "2rem", flexWrap: "wrap", gap: "1rem",
                }}>
                    <div>
                        <h1 style={{
                            color: "#0f172a", fontSize: "1.5rem", margin: "0 0 0.25rem",
                            fontFamily: "var(--font-heading)", fontWeight: 800,
                        }}>
                            {getGreeting()} 👋
                        </h1>
                        <p style={{ color: "#475569", fontSize: "0.85rem", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                            <span style={{
                                padding: "0.15rem 0.5rem", borderRadius: "0.3rem",
                                background: "rgba(183,148,246,0.15)", color: "#9333ea",
                                fontSize: "0.7rem", fontWeight: 700, fontFamily: "var(--font-heading)",
                            }}>
                                🛡️ Administrador
                            </span>
                            Doctor Foam — {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        {lastUpdated && (
                            <span style={{ color: "#64748b", fontSize: "0.7rem", fontFamily: "var(--font-heading)" }}>
                                {refreshing && <span className="spin" style={{ display: "inline-block", marginRight: "0.3rem" }}>🔄</span>}
                                {!refreshing && `Actualizado ${lastUpdated.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}`}
                            </span>
                        )}
                        <button onClick={() => { setRefreshing(true); fetchData(); }} style={{
                            padding: "0.4rem 0.75rem", borderRadius: "0.5rem",
                            background: "#f8fafc", border: "1px solid #cbd5e1",
                            color: "#475569", cursor: "pointer", fontSize: "0.85rem",
                        }}>
                            ↻
                        </button>
                        <Link href="/admin/reservas" style={{
                            padding: "0.5rem 1rem", borderRadius: "0.5rem",
                            background: "#eff6ff", border: "1px solid #bfdbfe",
                            color: "#2563eb", textDecoration: "none", fontSize: "0.8rem",
                            fontWeight: 600, fontFamily: "var(--font-heading)",
                        }}>
                            📋 Ver todas las reservas
                        </Link>
                    </div>
                </div>

                {/* Stats Row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                    {[
                        { label: "Agenda confirmada", value: confirmedBookings.length, icon: "📅", gradient: "linear-gradient(135deg, #3182ce, #63b3ed)" },
                        { label: "Pendientes de pago", value: pendingBookings.length, icon: "⏳", gradient: "linear-gradient(135deg, #d69e2e, #ecc94b)" },
                        { label: "Ingresos", value: `$${totalRevenue.toLocaleString("es-MX")}`, icon: "💰", gradient: "linear-gradient(135deg, #2f855a, #48bb78)" },
                        { label: "Próximo servicio", value: nextBooking ? new Date(nextBooking.service_date + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" }) : "—", icon: "🗓️", gradient: "linear-gradient(135deg, #805ad5, #b794f6)" },
                        { label: "Top Paquete", value: topPackage ? topPackage[0].split(" ").slice(0, 2).join(" ") : "—", icon: "🏆", gradient: "linear-gradient(135deg, #c53030, #fc8181)" },
                        { label: `Tu parte (${mySharePct}%)`, value: `$${myWeeklyShare.toLocaleString("es-MX", { maximumFractionDigits: 0 })}`, icon: "🤝", gradient: "linear-gradient(135deg, #805ad5, #b794f6)" },
                    ].map((stat) => (
                        <div key={stat.label} className="glass-card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                            <div style={{
                                width: "44px", height: "44px", borderRadius: "0.75rem", flexShrink: 0,
                                background: stat.gradient,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "1.2rem", boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            }}>
                                {stat.icon}
                            </div>
                            <div>
                                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.2rem", color: "#0f172a" }}>{stat.value}</div>
                                <div style={{ color: "#475569", fontSize: "0.72rem", fontFamily: "var(--font-heading)" }}>{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Dashboards Row */}
                <div className="admin-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
                    <div className="glass-card" style={{ padding: "1.5rem", height: "350px" }}>
                        <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem", fontFamily: "var(--font-heading)" }}>📈 Tendencia de Ingresos</h2>
                        {loadingData && !refreshing ? (
                            <div className="skeleton" style={{ width: "100%", height: "250px" }} />
                        ) : (
                            <ResponsiveContainer width="100%" height="85%">
                                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `$${value}`} />
                                    <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "none", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }} formatter={(value: any) => [`$${Number(value).toLocaleString("es-MX")}`, 'Ingresos'] as any} />
                                    <Area type="monotone" dataKey="ingresos" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                    <div className="glass-card" style={{ padding: "1.5rem", height: "350px" }}>
                        <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem", fontFamily: "var(--font-heading)" }}>📊 Distribución por Paquete</h2>
                        {loadingData && !refreshing ? (
                            <div className="skeleton" style={{ width: "100%", height: "250px" }} />
                        ) : (
                            <ResponsiveContainer width="100%" height="85%">
                                <BarChart data={chartPackageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                                    <Tooltip cursor={{ fill: 'rgba(99, 179, 237, 0.1)' }} contentStyle={{ borderRadius: "0.5rem", border: "none", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }} formatter={(value: any) => [value, 'Reservas'] as any} />
                                    <Bar dataKey="reservas" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="admin-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                    {/* Calendar */}
                    <div className="glass-card" style={{ padding: "1.5rem" }}>
                        <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem", fontFamily: "var(--font-heading)" }}>Calendario</h2>
                        {loadingData && !refreshing ? (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.3rem" }}>
                                {Array.from({ length: 35 }).map((_, i) => (
                                    <div key={i} className="skeleton" style={{ height: "36px" }} />
                                ))}
                            </div>
                        ) : (
                            <AdminCalendar bookings={bookings} blockedDates={blockedDates} onDayClick={handleDayClick} />
                        )}
                    </div>

                    {/* Bookings List */}
                    <div className="glass-card" style={{ padding: "1.5rem", maxHeight: "600px", overflowY: "auto" }}>
                        {/* Tabs: Agenda Confirmada / Solicitudes Pendientes */}
                        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                            {([
                                { key: "confirmed" as const, label: `📅 Agenda (${confirmedBookings.length})` },
                                { key: "pending" as const, label: `⏳ Pendientes (${pendingBookings.length})` },
                            ]).map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => { setListTab(tab.key); setSearchQuery(""); }}
                                    style={{
                                        padding: "0.45rem 0.85rem", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 600,
                                        fontFamily: "var(--font-heading)", cursor: "pointer", transition: "all 0.2s",
                                        border: `1px solid ${listTab === tab.key ? (tab.key === "confirmed" ? "#bfdbfe" : "#fde68a") : "#e2e8f0"}`,
                                        background: listTab === tab.key ? (tab.key === "confirmed" ? "#eff6ff" : "#fef3c7") : "transparent",
                                        color: listTab === tab.key ? (tab.key === "confirmed" ? "#2563eb" : "#d97706") : "#475569",
                                    }}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", gap: "0.75rem" }}>
                            <h2 style={{ fontSize: "1rem", margin: 0, fontFamily: "var(--font-heading)", whiteSpace: "nowrap", color: "#0f172a" }}>
                                {listTab === "confirmed" ? "Servicios confirmados" : "Esperando pago"}
                            </h2>
                            <input
                                type="text"
                                placeholder="🔍 Buscar..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: "100%", maxWidth: "180px", padding: "0.4rem 0.65rem",
                                    borderRadius: "0.5rem", border: "1px solid #cbd5e1",
                                    background: "#ffffff", color: "#0f172a", fontSize: "0.8rem",
                                    outline: "none",
                                }}
                            />
                        </div>
                        {loadingData && !refreshing ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="skeleton" style={{ height: "90px" }} />
                                ))}
                            </div>
                        ) : filteredBookings.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                                {searchQuery ? "Sin resultados" : listTab === "confirmed" ? "No hay servicios confirmados" : "No hay solicitudes pendientes"}
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {filteredBookings.map((b) => {
                                    const isConfirmed = CONFIRMED_STATUSES.includes(b.payment_status);
                                    return (
                                        <button
                                            key={b.id}
                                            onClick={() => openDetail(b)}
                                            style={{
                                                padding: "1rem", borderRadius: "0.75rem", cursor: "pointer",
                                                border: `1px solid ${isConfirmed ? "#e2e8f0" : "#fef3c7"}`,
                                                textAlign: "left",
                                                background: isConfirmed ? "#ffffff" : "#fffbeb",
                                                color: "#0f172a",
                                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{b.customer_name}</div>
                                                <div style={{ color: "#475569", fontSize: "0.8rem" }}>{b.package_name}</div>
                                                <div style={{ color: "#64748b", fontSize: "0.75rem" }}>
                                                    {b.service_date ? new Date(b.service_date + "T12:00:00").toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" }) : "Fecha pendiente"}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <span style={{
                                                    fontSize: "0.7rem", fontWeight: 600, padding: "0.25rem 0.5rem",
                                                    borderRadius: "1rem", fontFamily: "var(--font-heading)",
                                                    background: b.payment_status === "paid" ? "rgba(16, 185, 129, 0.15)" : b.payment_status === "manual" ? "rgba(168, 85, 247, 0.15)" : b.payment_status === "completed" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                                                    color: b.payment_status === "paid" ? "#34d399" : b.payment_status === "manual" ? "#a78bfa" : b.payment_status === "completed" ? "#34d399" : "#fbbf24",
                                                }}>
                                                    {statusLabel(b.payment_status)}
                                                </span>
                                                {b.total_amount > 0 && (
                                                    <div style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                                                        ${(b.total_amount / 100).toLocaleString("es-MX")}
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── Add Booking Modal ─── */}
                {showAddModal && (
                    <div style={overlayStyle}>
                        <div className="glass-card" style={{ maxWidth: "500px", width: "90%", padding: "2rem" }}>
                            <h3 style={{ fontFamily: "var(--font-heading)", marginBottom: "0.5rem" }}>Agregar servicio manual</h3>
                            <p style={{ color: "#475569", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
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
                                <button onClick={() => setShowAddModal(false)} style={{ ...modalBtnStyle, flex: 1, background: "#f8fafc", color: "#475569" }}>Cancelar</button>
                                <button onClick={() => { setShowAddModal(false); setShowBlockModal(true); }} style={{ ...modalBtnStyle, flex: 1, background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" }}>Bloquear día</button>
                                <button onClick={handleAddBooking} className="btn-premium" style={{ flex: 1, justifyContent: "center", fontSize: "0.85rem" }}>Guardar</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── Block Date Modal ─── */}
                {showBlockModal && (
                    <div style={overlayStyle}>
                        <div className="glass-card" style={{ maxWidth: "400px", width: "90%", padding: "2rem" }}>
                            <h3 style={{ fontFamily: "var(--font-heading)", marginBottom: "0.5rem", color: "#ef4444" }}>🚫 Bloquear día</h3>
                            <p style={{ color: "#475569", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
                                {selectedDate && new Date(selectedDate + "T12:00:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
                            </p>
                            <input placeholder="Motivo (opcional)" value={blockReason} onChange={(e) => setBlockReason(e.target.value)} style={{ ...modalInputStyle, marginBottom: "1.5rem" }} />
                            <div style={{ display: "flex", gap: "0.75rem" }}>
                                <button onClick={() => setShowBlockModal(false)} style={{ ...modalBtnStyle, flex: 1, background: "#f8fafc", color: "#475569" }}>Cancelar</button>
                                <button onClick={handleBlockDate} style={{ ...modalBtnStyle, flex: 1, background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" }}>Bloquear</button>
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
                                <h3 style={{ fontFamily: "var(--font-heading)", margin: 0, fontSize: "1.1rem" }}>
                                    {CONFIRMED_STATUSES.includes(showDetailModal.payment_status) ? "🔧 Gestión de Servicio" : "📋 Solicitud Pendiente"}
                                </h3>
                                <button onClick={() => { setShowDetailModal(null); setEditMode(false); setShowReschedule(false); }} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.3rem" }}>✕</button>
                            </div>

                            {/* Warning banner for pending */}
                            {showDetailModal.payment_status === "pending" && (
                                <div style={{
                                    padding: "0.75rem 1rem", borderRadius: "0.5rem", marginBottom: "1rem",
                                    background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.25)",
                                    display: "flex", alignItems: "center", gap: "0.5rem",
                                }}>
                                    <span style={{ fontSize: "1.1rem" }}>⚠️</span>
                                    <span style={{ color: "#fbbf24", fontSize: "0.8rem", fontWeight: 500 }}>
                                        Pago no confirmado — no ocupa lugar en la agenda
                                    </span>
                                </div>
                            )}

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
                                        <span style={{ color: "#475569", fontSize: "0.8rem", fontWeight: 600 }}>
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
                                        <button onClick={() => setEditMode(false)} style={{ ...modalBtnStyle, flex: 1, background: "#f8fafc", color: "#475569" }}>Cancelar</button>
                                        <button onClick={handleSaveEdit} disabled={saving} className="btn-premium" style={{ flex: 1, justifyContent: "center", fontSize: "0.85rem", opacity: saving ? 0.6 : 1 }}>
                                            {saving ? "Guardando..." : "💾 Guardar"}
                                        </button>
                                    </div>
                                </div>
                            ) : showReschedule ? (
                                /* Reschedule options */
                                <div style={{ marginBottom: "1.25rem" }}>
                                    <p style={{ color: "#475569", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                                        Fecha actual: <strong style={{ color: "#0f172a" }}>
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
                                        <button onClick={() => setShowReschedule(false)} style={{ ...modalBtnStyle, flex: 1, background: "#f8fafc", color: "#475569" }}>Cancelar</button>
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
                                        { label: "Fecha", value: showDetailModal.service_date ? new Date(showDetailModal.service_date + "T12:00:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Sin fecha asignada" },
                                        { label: "Vehículo", value: showDetailModal.vehicle_info || "—" },
                                        { label: "Tamaño", value: showDetailModal.vehicle_size || "—" },
                                        { label: "Dirección", value: showDetailModal.address || "—" },
                                        { label: "Teléfono", value: showDetailModal.customer_phone || "—" },
                                        { label: "Email", value: showDetailModal.customer_email || "—" },
                                        { label: "Notas", value: showDetailModal.notes || "—" },
                                    ].map((item) => (
                                        <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "0.35rem 0", borderBottom: "1px solid #e2e8f0" }}>
                                            <span style={{ color: "#475569", fontSize: "0.82rem" }}>{item.label}</span>
                                            <span style={{ color: "#0f172a", fontSize: "0.82rem", fontWeight: 500, textAlign: "right", maxWidth: "62%" }}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* ─── Status Change (only for confirmed bookings) ─── */}
                            {!editMode && !showReschedule && CONFIRMED_STATUSES.includes(showDetailModal.payment_status) && (
                                <div style={{ marginBottom: "1.25rem" }}>
                                    <label style={{ color: "#64748b", fontSize: "0.78rem", marginBottom: "0.4rem", display: "block", fontFamily: "var(--font-heading)" }}>Cambiar estado</label>
                                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                                        {[
                                            { value: "completed", label: "✅ Completado", bg: "rgba(16,185,129,0.12)", color: "#34d399", border: "rgba(16,185,129,0.3)" },
                                            { value: "paid", label: "💰 Pagado", bg: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "rgba(59,130,246,0.3)" },
                                            { value: "manual", label: "🟣 Manual", bg: "rgba(168,85,247,0.12)", color: "#a78bfa", border: "rgba(168,85,247,0.3)" },
                                            { value: "no-show", label: "❌ No-show", bg: "rgba(239,68,68,0.12)", color: "#f87171", border: "rgba(239,68,68,0.3)" },
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
                                    <button onClick={() => { setShowDetailModal(null); setEditMode(false); setShowReschedule(false); }} style={{ ...modalBtnStyle, flex: 2, background: "#f8fafc", color: "#475569" }}>Cerrar</button>
                                    <button onClick={startEdit} style={{ ...modalBtnStyle, flex: 1, background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" }}>✏️ Editar</button>
                                    {/* Reschedule only for confirmed */}
                                    {CONFIRMED_STATUSES.includes(showDetailModal.payment_status) && (
                                        <button onClick={() => setShowReschedule(true)} style={{ ...modalBtnStyle, flex: 1, background: "#ecfeff", color: "#0891b2", border: "1px solid #a5f3fc" }}>📅 Reprogramar</button>
                                    )}
                                    <button onClick={() => handleCancelBooking(showDetailModal.id)} style={{ ...modalBtnStyle, flex: 1, background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" }}>🚫 Cancelar</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </UnifiedDashboardLayout>
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
    border: "1px solid #cbd5e1", background: "#ffffff",
    color: "#0f172a", fontSize: "0.9rem", outline: "none",
};

const modalBtnStyle: React.CSSProperties = {
    padding: "0.75rem 1rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1",
    cursor: "pointer", fontSize: "0.85rem", fontFamily: "var(--font-heading)", fontWeight: 600,
};
