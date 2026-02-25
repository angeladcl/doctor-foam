"use client";

import AdminLayout from "@/components/AdminLayout";
import { STATUSES, exportBookingsCSV, statusLabel, statusStyle } from "@/lib/booking-utils";
import { supabase } from "@/lib/supabase";
import type { Booking } from "@/lib/types";
import React, { useCallback, useEffect, useState } from "react";

export default function ReservasPage() {
    const [session, setSession] = useState<{ access_token: string } | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterDate, setFilterDate] = useState<"all" | "upcoming" | "past" | "today">("all");
    const [sortField, setSortField] = useState<"service_date" | "customer_name" | "created_at">("service_date");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [detailModal, setDetailModal] = useState<Booking | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState<Partial<Booking>>({});
    const [saving, setSaving] = useState(false);
    const [bulkAction, setBulkAction] = useState("");
    const [page, setPage] = useState(1);
    const PER_PAGE = 20;

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) setSession(data.session);
        });
    }, []);

    const fetchBookings = useCallback(async () => {
        if (!session) return;
        setLoading(true);
        try {
            // Fetch ALL bookings (not just current month)
            const res = await fetch("/api/admin/bookings?all=true", {
                headers: { Authorization: `Bearer ${session.access_token}` },
            });
            const data = await res.json();
            setBookings(data.bookings || []);
        } catch { /* silent */ }
        setLoading(false);
    }, [session]);

    useEffect(() => { if (session) fetchBookings(); }, [session, fetchBookings]);

    const today = new Date().toISOString().split("T")[0];

    /* Filters */
    const filtered = bookings
        .filter(b => {
            if (filterStatus !== "all" && b.payment_status !== filterStatus) return false;
            if (filterDate === "upcoming" && b.service_date < today) return false;
            if (filterDate === "past" && b.service_date >= today) return false;
            if (filterDate === "today" && b.service_date !== today) return false;
            if (search) {
                const q = search.toLowerCase();
                return b.customer_name.toLowerCase().includes(q) ||
                    b.package_name.toLowerCase().includes(q) ||
                    b.customer_email?.toLowerCase().includes(q) ||
                    b.customer_phone?.includes(q);
            }
            return true;
        })
        .sort((a, b) => {
            const mod = sortDir === "asc" ? 1 : -1;
            if (sortField === "service_date") return a.service_date.localeCompare(b.service_date) * mod;
            if (sortField === "customer_name") return a.customer_name.localeCompare(b.customer_name) * mod;
            return (a.created_at || "").localeCompare(b.created_at || "") * mod;
        });

    /* Select */
    const toggleSelect = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };
    const toggleSelectAll = () => {
        if (selected.size === filtered.length) setSelected(new Set());
        else setSelected(new Set(filtered.map(b => b.id)));
    };

    /* Bulk status change */
    const handleBulkAction = async () => {
        if (!session || !bulkAction || selected.size === 0) return;
        if (!confirm(`¿Cambiar ${selected.size} reservas a "${statusLabel(bulkAction)}"?`)) return;
        setSaving(true);
        try {
            for (const id of selected) {
                await fetch("/api/admin/bookings", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
                    body: JSON.stringify({ id, payment_status: bulkAction }),
                });
            }
            setSelected(new Set());
            setBulkAction("");
            fetchBookings();
        } catch { alert("Error en operación masiva"); }
        setSaving(false);
    };

    /* Individual edit */
    const openDetail = (b: Booking) => {
        setDetailModal(b);
        setEditMode(false);
        setEditData({});
    };
    const startEdit = () => {
        if (!detailModal) return;
        setEditData({
            customer_name: detailModal.customer_name,
            customer_phone: detailModal.customer_phone,
            customer_email: detailModal.customer_email,
            vehicle_info: detailModal.vehicle_info,
            package_name: detailModal.package_name,
            address: detailModal.address,
            notes: detailModal.notes,
            service_date: detailModal.service_date,
        });
        setEditMode(true);
    };
    const saveEdit = async () => {
        if (!session || !detailModal) return;
        setSaving(true);
        try {
            const res = await fetch("/api/admin/bookings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
                body: JSON.stringify({ id: detailModal.id, ...editData }),
            });
            const data = await res.json();
            if (data.error) { alert(data.error); setSaving(false); return; }
            setDetailModal(data.booking);
            setEditMode(false);
            fetchBookings();
        } catch { alert("Error al guardar"); }
        setSaving(false);
    };
    const changeStatus = async (newStatus: string) => {
        if (!session || !detailModal) return;
        setSaving(true);
        try {
            const res = await fetch("/api/admin/bookings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
                body: JSON.stringify({ id: detailModal.id, payment_status: newStatus }),
            });
            const data = await res.json();
            if (data.error) { alert(data.error); } else { setDetailModal(data.booking); fetchBookings(); }
        } catch { alert("Error"); }
        setSaving(false);
    };
    const cancelBooking = async () => {
        if (!session || !detailModal || !confirm("¿Cancelar esta reserva?")) return;
        try {
            await fetch(`/api/admin/bookings?id=${detailModal.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${session.access_token}` },
            });
            setDetailModal(null);
            fetchBookings();
        } catch { alert("Error"); }
    };

    const sortBy = (field: typeof sortField) => {
        if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
        else { setSortField(field); setSortDir("asc"); }
    };

    const stats = {
        total: bookings.length,
        confirmed: bookings.filter(b => ["paid", "manual", "completed"].includes(b.payment_status)).length,
        pending: bookings.filter(b => b.payment_status === "pending").length,
        cancelled: bookings.filter(b => b.payment_status === "cancelled").length,
    };

    return (
        <AdminLayout>
            <div>
                {/* Header */}
                <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                        <h1 className="gradient-text" style={{
                            fontFamily: "var(--font-heading)", fontSize: "1.8rem",
                            fontWeight: 800, marginBottom: "0.25rem",
                        }}>
                            Gestor de Reservas
                        </h1>
                        <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: 0 }}>
                            Administra todos los servicios programados
                        </p>
                    </div>
                    <button onClick={() => exportBookingsCSV(filtered)} style={{
                        padding: "0.5rem 1rem", borderRadius: "0.5rem",
                        background: "rgba(72,187,120,0.12)", border: "1px solid rgba(72,187,120,0.3)",
                        color: "#48bb78", cursor: "pointer", fontSize: "0.8rem",
                        fontWeight: 600, fontFamily: "var(--font-heading)",
                    }}>
                        📥 Exportar CSV ({filtered.length})
                    </button>
                </div>

                {/* Quick stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
                    {[
                        { label: "Total", value: stats.total, color: "#e2e8f0" },
                        { label: "Confirmados", value: stats.confirmed, color: "#48bb78" },
                        { label: "Pendientes", value: stats.pending, color: "#ecc94b" },
                        { label: "Cancelados", value: stats.cancelled, color: "#fc8181" },
                    ].map(s => (
                        <div key={s.label} style={{
                            padding: "0.75rem 1rem", borderRadius: "0.75rem",
                            background: "rgba(17,26,46,0.5)", border: "1px solid rgba(148,163,184,0.08)",
                            textAlign: "center",
                        }}>
                            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: s.color, fontFamily: "var(--font-heading)" }}>{s.value}</div>
                            <div style={{ fontSize: "0.7rem", color: "#64748b", fontFamily: "var(--font-heading)" }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filters Bar */}
                <div className="glass-card" style={{ padding: "1rem 1.25rem", marginBottom: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
                    <input
                        type="text" placeholder="🔍 Buscar cliente, paquete, email..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        style={{
                            flex: "1 1 200px", padding: "0.5rem 0.75rem", borderRadius: "0.5rem",
                            border: "1px solid rgba(96,165,250,0.15)", background: "rgba(10,22,40,0.6)",
                            color: "white", fontSize: "0.85rem", outline: "none",
                        }}
                    />
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
                        <option value="all">Todos los estados</option>
                        {STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                    </select>
                    <select value={filterDate} onChange={e => setFilterDate(e.target.value as typeof filterDate)} style={selectStyle}>
                        <option value="all">Todas las fechas</option>
                        <option value="today">Hoy</option>
                        <option value="upcoming">Próximos</option>
                        <option value="past">Anteriores</option>
                    </select>
                </div>

                {/* Bulk Actions */}
                {selected.size > 0 && (
                    <div style={{
                        padding: "0.75rem 1.25rem", borderRadius: "0.75rem", marginBottom: "1rem",
                        background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)",
                        display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap",
                    }}>
                        <span style={{ color: "#60a5fa", fontSize: "0.85rem", fontWeight: 600, fontFamily: "var(--font-heading)" }}>
                            ✓ {selected.size} seleccionada{selected.size > 1 ? "s" : ""}
                        </span>
                        <select value={bulkAction} onChange={e => setBulkAction(e.target.value)} style={{ ...selectStyle, minWidth: "160px" }}>
                            <option value="">Acción masiva...</option>
                            {STATUSES.filter(s => s !== "rescheduled").map(s => (
                                <option key={s} value={s}>Cambiar a: {statusLabel(s)}</option>
                            ))}
                        </select>
                        <button onClick={handleBulkAction} disabled={!bulkAction || saving} style={{
                            padding: "0.45rem 1rem", borderRadius: "0.5rem",
                            background: bulkAction ? "rgba(59,130,246,0.2)" : "rgba(96,165,250,0.05)",
                            border: `1px solid ${bulkAction ? "rgba(59,130,246,0.4)" : "rgba(96,165,250,0.1)"}`,
                            color: bulkAction ? "#60a5fa" : "#475569", cursor: bulkAction ? "pointer" : "default",
                            fontSize: "0.8rem", fontWeight: 600, fontFamily: "var(--font-heading)",
                        }}>
                            {saving ? "Aplicando..." : "Aplicar"}
                        </button>
                        <button onClick={() => setSelected(new Set())} style={{
                            background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "0.8rem",
                        }}>
                            Deseleccionar
                        </button>
                    </div>
                )}

                {/* Table */}
                {loading ? (
                    <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>Cargando reservas...</div>
                ) : filtered.length === 0 ? (
                    <div className="glass-card" style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                        {search || filterStatus !== "all" || filterDate !== "all" ? "Sin resultados para los filtros actuales" : "No hay reservas"}
                    </div>
                ) : (
                    <div className="glass-card" style={{ overflow: "hidden" }}>
                        <div style={{ overflowX: "auto" }}>
                            <table className="admin-table-responsive" style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid rgba(96,165,250,0.1)" }}>
                                        <th style={{ ...thStyle, width: "40px" }}>
                                            <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0}
                                                onChange={toggleSelectAll}
                                                style={{ accentColor: "#3b82f6", cursor: "pointer" }} />
                                        </th>
                                        <th style={thStyle} onClick={() => sortBy("customer_name")}>
                                            Cliente {sortField === "customer_name" && (sortDir === "asc" ? "↑" : "↓")}
                                        </th>
                                        <th style={thStyle}>Paquete</th>
                                        <th style={thStyle} onClick={() => sortBy("service_date")}>
                                            Fecha {sortField === "service_date" && (sortDir === "asc" ? "↑" : "↓")}
                                        </th>
                                        <th style={thStyle}>Estado</th>
                                        <th style={thStyle}>Monto</th>
                                        <th style={thStyle}>Origen</th>
                                        <th style={thStyle}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE).map(b => (
                                        <tr key={b.id} style={{
                                            borderBottom: "1px solid rgba(96,165,250,0.05)",
                                            background: selected.has(b.id) ? "rgba(59,130,246,0.06)" : "transparent",
                                            transition: "background 0.15s",
                                        }}>
                                            <td style={tdStyle}>
                                                <input type="checkbox" checked={selected.has(b.id)}
                                                    onChange={() => toggleSelect(b.id)}
                                                    style={{ accentColor: "#3b82f6", cursor: "pointer" }} />
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: 600, color: "white", fontSize: "0.85rem" }}>{b.customer_name}</div>
                                                <div style={{ color: "#475569", fontSize: "0.72rem" }}>{b.customer_email}</div>
                                            </td>
                                            <td style={{ ...tdStyle, color: "#94a3b8", fontSize: "0.82rem" }}>
                                                {b.package_name}
                                            </td>
                                            <td style={{ ...tdStyle, color: "#94a3b8", fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                                                {new Date(b.service_date + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                                            </td>
                                            <td style={tdStyle}>
                                                <span style={{
                                                    fontSize: "0.68rem", fontWeight: 600, padding: "0.2rem 0.5rem",
                                                    borderRadius: "0.35rem", fontFamily: "var(--font-heading)",
                                                    ...statusStyle(b.payment_status),
                                                }}>
                                                    {statusLabel(b.payment_status)}
                                                </span>
                                            </td>
                                            <td style={{ ...tdStyle, color: "#94a3b8", fontSize: "0.82rem" }}>
                                                {b.total_amount > 0 ? `$${(b.total_amount / 100).toLocaleString("es-MX")}` : "—"}
                                            </td>
                                            <td style={{ ...tdStyle, fontSize: "0.78rem", color: "#64748b" }}>
                                                {b.source === "online" ? "🌐" : "👤"}
                                            </td>
                                            <td style={tdStyle}>
                                                <button onClick={() => openDetail(b)} style={{
                                                    padding: "0.3rem 0.6rem", borderRadius: "0.4rem", fontSize: "0.75rem",
                                                    background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)",
                                                    color: "#60a5fa", cursor: "pointer", fontWeight: 600,
                                                }}>
                                                    Ver
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid rgba(96,165,250,0.08)", color: "#475569", fontSize: "0.78rem", fontFamily: "var(--font-heading)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span>{filtered.length} reserva{filtered.length !== 1 ? "s" : ""}</span>
                            {filtered.length > PER_PAGE && (
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{
                                        padding: "0.25rem 0.5rem", borderRadius: "0.35rem", border: "1px solid rgba(96,165,250,0.15)",
                                        background: page === 1 ? "transparent" : "rgba(59,130,246,0.1)",
                                        color: page === 1 ? "#334155" : "#60a5fa", cursor: page === 1 ? "default" : "pointer", fontSize: "0.75rem",
                                    }}>← Ant.</button>
                                    <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                                        Pág. {page} de {Math.ceil(filtered.length / PER_PAGE)}
                                    </span>
                                    <button disabled={page >= Math.ceil(filtered.length / PER_PAGE)} onClick={() => setPage(p => p + 1)} style={{
                                        padding: "0.25rem 0.5rem", borderRadius: "0.35rem", border: "1px solid rgba(96,165,250,0.15)",
                                        background: page >= Math.ceil(filtered.length / PER_PAGE) ? "transparent" : "rgba(59,130,246,0.1)",
                                        color: page >= Math.ceil(filtered.length / PER_PAGE) ? "#334155" : "#60a5fa",
                                        cursor: page >= Math.ceil(filtered.length / PER_PAGE) ? "default" : "pointer", fontSize: "0.75rem",
                                    }}>Sig. →</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Detail/Edit Modal */}
                {detailModal && (
                    <div style={overlayStyle}>
                        <div className="glass-card" style={{ maxWidth: "580px", width: "92%", padding: "2rem", maxHeight: "90vh", overflowY: "auto" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                                <h3 style={{ fontFamily: "var(--font-heading)", margin: 0, fontSize: "1.1rem" }}>
                                    🔧 Gestión de Reserva
                                </h3>
                                <button onClick={() => { setDetailModal(null); setEditMode(false); }} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.3rem" }}>✕</button>
                            </div>

                            {/* Status badge */}
                            <div style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                                <span style={{
                                    fontSize: "0.75rem", fontWeight: 600, padding: "0.3rem 0.75rem",
                                    borderRadius: "1rem", fontFamily: "var(--font-heading)",
                                    ...statusStyle(detailModal.payment_status),
                                }}>
                                    {statusLabel(detailModal.payment_status)}
                                </span>
                                <span style={{ color: "#64748b", fontSize: "0.75rem" }}>
                                    {detailModal.source === "online" ? "🌐 En línea" : "👤 Admin"}
                                </span>
                                {detailModal.total_amount > 0 && (
                                    <span style={{ color: "#94a3b8", fontSize: "0.8rem", fontWeight: 600 }}>
                                        ${(detailModal.total_amount / 100).toLocaleString("es-MX")} MXN
                                    </span>
                                )}
                            </div>

                            {editMode ? (
                                <div style={{ display: "grid", gap: "0.6rem", marginBottom: "1.25rem" }}>
                                    {[
                                        { key: "customer_name", label: "Cliente" },
                                        { key: "customer_phone", label: "Teléfono" },
                                        { key: "customer_email", label: "Email" },
                                        { key: "vehicle_info", label: "Vehículo" },
                                        { key: "address", label: "Dirección" },
                                        { key: "service_date", label: "Fecha", type: "date" },
                                    ].map(f => (
                                        <div key={f.key} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <label style={{ color: "#64748b", fontSize: "0.8rem", width: "80px", flexShrink: 0 }}>{f.label}</label>
                                            <input
                                                type={f.type || "text"}
                                                value={(editData as Record<string, string>)[f.key] || ""}
                                                onChange={e => setEditData({ ...editData, [f.key]: e.target.value })}
                                                style={inputStyle}
                                            />
                                        </div>
                                    ))}
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <label style={{ color: "#64748b", fontSize: "0.8rem", width: "80px", flexShrink: 0 }}>Paquete</label>
                                        <select value={editData.package_name || ""} onChange={e => setEditData({ ...editData, package_name: e.target.value })} style={inputStyle}>
                                            <option value="Industrial Deep Interior">Industrial Deep Interior</option>
                                            <option value="Signature Detail">Signature Detail</option>
                                            <option value="Ceramic Coating">Ceramic Coating</option>
                                            <option value="Ceramic + Graphene Shield">Ceramic + Graphene Shield</option>
                                            <option value="Foam Maintenance">Foam Maintenance</option>
                                        </select>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                                        <label style={{ color: "#64748b", fontSize: "0.8rem", width: "80px", flexShrink: 0, marginTop: "0.5rem" }}>Notas</label>
                                        <textarea value={editData.notes || ""} onChange={e => setEditData({ ...editData, notes: e.target.value })}
                                            style={{ ...inputStyle, minHeight: "50px", resize: "vertical" as const }} />
                                    </div>
                                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                                        <button onClick={() => setEditMode(false)} style={{ ...btnStyle, flex: 1, background: "rgba(15,34,64,0.6)", color: "#94a3b8" }}>Cancelar</button>
                                        <button onClick={saveEdit} disabled={saving} className="btn-premium" style={{ flex: 1, justifyContent: "center", fontSize: "0.85rem", opacity: saving ? 0.6 : 1 }}>
                                            {saving ? "Guardando..." : "💾 Guardar"}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: "grid", gap: "0.4rem", marginBottom: "1.25rem" }}>
                                    {[
                                        { label: "Cliente", value: detailModal.customer_name },
                                        { label: "Servicio", value: detailModal.package_name },
                                        { label: "Fecha", value: new Date(detailModal.service_date + "T12:00:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) },
                                        { label: "Vehículo", value: detailModal.vehicle_info || "—" },
                                        { label: "Tamaño", value: detailModal.vehicle_size || "—" },
                                        { label: "Dirección", value: detailModal.address || "—" },
                                        { label: "Teléfono", value: detailModal.customer_phone || "—" },
                                        { label: "Email", value: detailModal.customer_email || "—" },
                                        { label: "Notas", value: detailModal.notes || "—" },
                                    ].map(item => (
                                        <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "0.35rem 0", borderBottom: "1px solid rgba(96,165,250,0.06)" }}>
                                            <span style={{ color: "#64748b", fontSize: "0.82rem" }}>{item.label}</span>
                                            <span style={{ color: "white", fontSize: "0.82rem", fontWeight: 500, textAlign: "right", maxWidth: "62%" }}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Status change */}
                            {!editMode && (
                                <div style={{ marginBottom: "1.25rem" }}>
                                    <label style={{ color: "#64748b", fontSize: "0.78rem", marginBottom: "0.4rem", display: "block", fontFamily: "var(--font-heading)" }}>Cambiar estado</label>
                                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                                        {[
                                            { value: "completed", label: "✅ Completado" },
                                            { value: "paid", label: "💰 Pagado" },
                                            { value: "manual", label: "🟣 Manual" },
                                            { value: "pending", label: "⏳ Pendiente" },
                                            { value: "no-show", label: "❌ No-show" },
                                        ].map(st => (
                                            <button key={st.value} onClick={() => changeStatus(st.value)}
                                                disabled={detailModal.payment_status === st.value || saving}
                                                style={{
                                                    padding: "0.3rem 0.6rem", borderRadius: "0.5rem", fontSize: "0.72rem",
                                                    fontWeight: 600, cursor: detailModal.payment_status === st.value ? "default" : "pointer",
                                                    ...statusStyle(detailModal.payment_status === st.value ? st.value : ""),
                                                    ...(detailModal.payment_status === st.value ? statusStyle(st.value) : { background: "rgba(15,34,64,0.4)", color: "#64748b", border: "1px solid rgba(96,165,250,0.1)" }),
                                                    transition: "all 0.2s",
                                                }}>
                                                {st.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action buttons */}
                            {!editMode && (
                                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                    <button onClick={() => { setDetailModal(null); }} style={{ ...btnStyle, flex: 2, background: "rgba(15,34,64,0.6)", color: "#94a3b8" }}>Cerrar</button>
                                    <button onClick={startEdit} style={{ ...btnStyle, flex: 1, background: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)" }}>✏️ Editar</button>
                                    <button onClick={cancelBooking} style={{ ...btnStyle, flex: 1, background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}>🚫 Cancelar</button>
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
    background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 200, padding: "1rem",
};
const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.6rem 0.75rem", borderRadius: "0.5rem",
    border: "1px solid rgba(96,165,250,0.2)", background: "rgba(10,22,40,0.8)",
    color: "white", fontSize: "0.85rem", outline: "none",
};
const btnStyle: React.CSSProperties = {
    padding: "0.7rem 1rem", borderRadius: "0.5rem", border: "1px solid rgba(96,165,250,0.15)",
    cursor: "pointer", fontSize: "0.85rem", fontFamily: "var(--font-heading)", fontWeight: 600,
};
const selectStyle: React.CSSProperties = {
    padding: "0.5rem 0.75rem", borderRadius: "0.5rem",
    border: "1px solid rgba(96,165,250,0.15)", background: "rgba(10,22,40,0.6)",
    color: "#94a3b8", fontSize: "0.82rem", outline: "none", cursor: "pointer",
};
const thStyle: React.CSSProperties = {
    padding: "0.75rem 1rem", textAlign: "left",
    fontSize: "0.72rem", fontWeight: 700, color: "#64748b",
    textTransform: "uppercase", fontFamily: "var(--font-heading)",
    letterSpacing: "0.05em", cursor: "pointer", whiteSpace: "nowrap",
};
const tdStyle: React.CSSProperties = {
    padding: "0.75rem 1rem",
};
