"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");

    return (
        <>
            <nav className="navbar navbar-scrolled">
                <div className="navbar-inner">
                    <Link href="/" style={{ textDecoration: "none" }}>
                        <span
                            style={{
                                fontFamily: "var(--font-heading)",
                                fontWeight: 800,
                                fontSize: "1.3rem",
                                color: "white",
                            }}
                        >
                            DOCTOR <span className="gradient-text">FOAM</span>
                        </span>
                    </Link>
                </div>
            </nav>

            <main
                style={{
                    paddingTop: "8rem",
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <section className="section-padding">
                    <div className="container" style={{ maxWidth: "700px", textAlign: "center" }}>
                        {/* Success animation */}
                        <div
                            style={{
                                width: "120px",
                                height: "120px",
                                borderRadius: "50%",
                                background: "rgba(16, 185, 129, 0.1)",
                                border: "3px solid var(--color-accent-emerald)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 2rem",
                                fontSize: "3.5rem",
                                animation: "fadeInUp 0.6s ease forwards",
                            }}
                        >
                            ✓
                        </div>

                        <h1
                            style={{
                                fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                                marginBottom: "1rem",
                                animation: "fadeInUp 0.6s ease 0.1s forwards",
                                opacity: 0,
                            }}
                        >
                            ¡Pago{" "}
                            <span className="gradient-text">confirmado</span>!
                        </h1>

                        <p
                            style={{
                                color: "#94a3b8",
                                fontSize: "1.1rem",
                                lineHeight: "1.8",
                                maxWidth: "500px",
                                margin: "0 auto 2rem",
                                animation: "fadeInUp 0.6s ease 0.2s forwards",
                                opacity: 0,
                            }}
                        >
                            Tu pago ha sido procesado exitosamente. En las próximas horas, un
                            asesor de ventas de Doctor Foam se comunicará contigo por nuestro chat interno
                            para{" "}
                            <strong style={{ color: "white" }}>
                                agendar día y hora de tu servicio
                            </strong>
                            .
                        </p>

                        <div
                            className="glass-card"
                            style={{
                                padding: "2rem",
                                marginBottom: "2rem",
                                textAlign: "left",
                                animation: "fadeInUp 0.6s ease 0.3s forwards",
                                opacity: 0,
                            }}
                        >
                            <h3
                                style={{
                                    fontSize: "1rem",
                                    marginBottom: "1rem",
                                    fontFamily: "var(--font-heading)",
                                }}
                            >
                                ¿Qué sigue?
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {[
                                    {
                                        step: "1",
                                        title: "Confirmación por email",
                                        desc: "Recibirás un comprobante de pago y una factura (si la solicitaste) en tu correo electrónico.",
                                    },
                                    {
                                        step: "2",
                                        title: "Te contactamos por chat",
                                        desc: "Un asesor de Doctor Foam se comunicará contigo en máximo 4 horas hábiles.",
                                    },
                                    {
                                        step: "3",
                                        title: "Agendamos tu servicio",
                                        desc: "Coordinaremos día, hora y acceso al lugar donde atenderemos tu vehículo.",
                                    },
                                    {
                                        step: "4",
                                        title: "¡El día del servicio!",
                                        desc: "Llegamos con nuestro equipo industrial completo a la puerta de tu casa.",
                                    },
                                ].map((item) => (
                                    <div key={item.step} style={{ display: "flex", gap: "1rem" }}>
                                        <div
                                            style={{
                                                width: "36px",
                                                height: "36px",
                                                borderRadius: "50%",
                                                background:
                                                    "linear-gradient(135deg, var(--color-gold-500), var(--color-gold-400))",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "0.85rem",
                                                fontWeight: 800,
                                                color: "#0a1628",
                                                flexShrink: 0,
                                                fontFamily: "var(--font-heading)",
                                            }}
                                        >
                                            {item.step}
                                        </div>
                                        <div>
                                            <div
                                                style={{
                                                    fontWeight: 700,
                                                    color: "white",
                                                    fontSize: "0.95rem",
                                                    fontFamily: "var(--font-heading)",
                                                }}
                                            >
                                                {item.title}
                                            </div>
                                            <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                                                {item.desc}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {sessionId && (
                            <p
                                style={{
                                    color: "#475569",
                                    fontSize: "0.75rem",
                                    marginBottom: "1.5rem",
                                    animation: "fadeInUp 0.6s ease 0.4s forwards",
                                    opacity: 0,
                                }}
                            >
                                ID de transacción: {sessionId.slice(0, 20)}…
                            </p>
                        )}

                        <div
                            style={{
                                display: "flex",
                                gap: "1rem",
                                justifyContent: "center",
                                flexWrap: "wrap",
                                animation: "fadeInUp 0.6s ease 0.5s forwards",
                                opacity: 0,
                            }}
                        >
                            <Link href="/" className="btn-premium">
                                Volver al inicio
                            </Link>
                            <Link href="/mi-cuenta/chat" className="btn-outline">
                                💬 Ir al chat
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="footer">
                <div className="footer-bottom" style={{ borderTop: "none", marginTop: 0 }}>
                    <p>
                        &copy; {new Date().getFullYear()} Doctor Foam México. Todos los derechos
                        reservados.
                    </p>
                </div>
            </footer>
        </>
    );
}

export default function PagoExitosoPage() {
    return (
        <Suspense
            fallback={
                <div
                    style={{
                        minHeight: "100vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#94a3b8",
                    }}
                >
                    Cargando...
                </div>
            }
        >
            <SuccessContent />
        </Suspense>
    );
}
