import React from "react";

/* ─── Status Styles ─── */
export const STATUSES = ["paid", "manual", "completed", "pending", "no-show", "rescheduled", "cancelled"] as const;
export const CONFIRMED_STATUSES = ["paid", "manual", "completed"];

export const statusStyle = (s: string): React.CSSProperties => {
    switch (s) {
        case "completed": return { background: "rgba(72,187,120,0.15)", color: "#48bb78", border: "1px solid rgba(72,187,120,0.25)" };
        case "paid": return { background: "rgba(99,179,237,0.15)", color: "#63b3ed", border: "1px solid rgba(99,179,237,0.25)" };
        case "manual": return { background: "rgba(183,148,246,0.15)", color: "#b794f6", border: "1px solid rgba(183,148,246,0.25)" };
        case "pending": return { background: "rgba(236,201,75,0.15)", color: "#ecc94b", border: "1px solid rgba(236,201,75,0.25)" };
        case "no-show": return { background: "rgba(252,129,129,0.15)", color: "#fc8181", border: "1px solid rgba(252,129,129,0.25)" };
        case "rescheduled": return { background: "rgba(118,228,247,0.15)", color: "#76e4f7", border: "1px solid rgba(118,228,247,0.25)" };
        case "cancelled": return { background: "rgba(148,163,184,0.15)", color: "#94a3b8", border: "1px solid rgba(148,163,184,0.25)" };
        default: return { background: "rgba(236,201,75,0.15)", color: "#ecc94b", border: "1px solid rgba(236,201,75,0.25)" };
    }
};

export const statusLabel = (s: string): string => {
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

/* ─── Time Helpers ─── */
export const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
};

export const formatDateES = (dateStr: string, options?: Intl.DateTimeFormatOptions): string => {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("es-MX", options || { day: "numeric", month: "short", year: "numeric" });
};

export const formatTimeAgo = (iso: string): string => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "Ahora";
    if (diff < 3600000) return `hace ${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `hace ${Math.floor(diff / 3600000)}h`;
    return d.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
};

/* ─── CSV Export ─── */
export const exportBookingsCSV = (bookings: { customer_name: string; customer_email: string; package_name: string; service_date: string; payment_status: string; total_amount: number }[]) => {
    const headers = ["Cliente", "Email", "Paquete", "Fecha", "Estado", "Monto MXN"];
    const rows = bookings.map(b => [
        b.customer_name,
        b.customer_email,
        b.package_name,
        b.service_date,
        statusLabel(b.payment_status),
        (b.total_amount / 100).toFixed(2),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${(c || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reservas_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
};
