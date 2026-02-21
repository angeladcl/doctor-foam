"use client";

import { useRouter } from "next/navigation";

export default function PortalBookingPage() {
    const router = useRouter();

    // Redirect to the main booking page which already has the full flow
    // Later we can enhance this with pre-filled data from profile
    return (
        <div>
            <h1 style={{ color: "white", fontFamily: "var(--font-heading)", fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                📅 Reservar servicio
            </h1>
            <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>Agenda tu próximo detallado automotriz</p>

            <div className="glass-card" style={{ padding: "2rem", textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚗✨</div>
                <p style={{ color: "white", fontWeight: 600, fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                    ¿Listo para tu próximo servicio?
                </p>
                <p style={{ color: "#94a3b8", marginBottom: "1.5rem", maxWidth: "400px", margin: "0 auto 1.5rem" }}>
                    Selecciona tu paquete, elige la fecha y completa tu reserva de forma segura.
                </p>
                <button
                    onClick={() => router.push("/reservar")}
                    className="btn-premium"
                    style={{ fontSize: "0.95rem" }}
                >
                    📅 Ir a reservar
                </button>
            </div>
        </div>
    );
}
