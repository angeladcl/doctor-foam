"use client";

import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CustomerLoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState<"login" | "reset">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError("Email o contraseña incorrectos");
            setLoading(false);
        } else {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.app_metadata?.role === "admin") {
                await supabase.auth.signOut();
                setError("Acceso denegado. Para entrar al panel debes usar el link de Panel Administrativo.");
                setLoading(false);
            } else {
                router.push("/mi-cuenta");
            }
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (data.error) {
                setError(data.error);
            } else {
                setSuccess("Te enviamos un email con instrucciones para restablecer tu contraseña.");
            }
        } catch {
            setError("Error de conexión");
        }
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--color-bg-primary)", padding: "1rem",
        }}>
            <div className="glass-card" style={{ maxWidth: "420px", width: "100%", padding: "2.5rem" }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <Link href="/" style={{ textDecoration: "none" }}>
                        <Logo size="lg" />
                    </Link>
                    <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                        {mode === "login" ? "Inicia sesión en tu cuenta" : "Restablecer contraseña"}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={mode === "login" ? handleLogin : handleResetPassword}>
                    <div style={{ display: "grid", gap: "1rem", marginBottom: "1.5rem" }}>
                        <div>
                            <label style={{ color: "#94a3b8", fontSize: "0.8rem", fontFamily: "var(--font-heading)", display: "block", marginBottom: "0.3rem" }}>Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                style={{
                                    width: "100%", padding: "0.75rem 1rem", borderRadius: "0.5rem",
                                    border: "1px solid rgba(96, 165, 250, 0.2)", background: "rgba(10, 22, 40, 0.8)",
                                    color: "white", fontSize: "0.9rem", outline: "none",
                                }}
                            />
                        </div>

                        {mode === "login" && (
                            <div>
                                <label style={{ color: "#94a3b8", fontSize: "0.8rem", fontFamily: "var(--font-heading)", display: "block", marginBottom: "0.3rem" }}>Contraseña</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    style={{
                                        width: "100%", padding: "0.75rem 1rem", borderRadius: "0.5rem",
                                        border: "1px solid rgba(96, 165, 250, 0.2)", background: "rgba(10, 22, 40, 0.8)",
                                        color: "white", fontSize: "0.9rem", outline: "none",
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {error && (
                        <div style={{ padding: "0.75rem", borderRadius: "0.5rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#f87171", fontSize: "0.85rem", marginBottom: "1rem" }}>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={{ padding: "0.75rem", borderRadius: "0.5rem", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", color: "#34d399", fontSize: "0.85rem", marginBottom: "1rem" }}>
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-premium"
                        style={{ width: "100%", justifyContent: "center", fontSize: "0.9rem" }}
                    >
                        {loading ? "Procesando..." : mode === "login" ? "Iniciar sesión" : "Enviar instrucciones"}
                    </button>
                </form>

                {/* Toggle login/reset */}
                <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
                    {mode === "login" ? (
                        <button onClick={() => { setMode("reset"); setError(""); setSuccess(""); }}
                            style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", fontSize: "0.85rem" }}>
                            ¿Olvidaste tu contraseña?
                        </button>
                    ) : (
                        <button onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
                            style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", fontSize: "0.85rem" }}>
                            ← Volver al login
                        </button>
                    )}
                </div>

                {/* Divider */}
                <div style={{ borderTop: "1px solid rgba(96, 165, 250, 0.1)", marginTop: "1.5rem", paddingTop: "1rem", textAlign: "center" }}>
                    <p style={{ color: "#475569", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
                        ¿Aún no tienes cuenta? <Link href="/reservar" style={{ color: "#60a5fa" }}>Reserva tu primer servicio</Link> y se creará automáticamente.
                    </p>
                    <Link href="/admin/login" style={{ color: "#475569", fontSize: "0.75rem", textDecoration: "none", opacity: 0.7, transition: "opacity 0.2s" }} onMouseEnter={e => e.currentTarget.style.opacity = "1"} onMouseLeave={e => e.currentTarget.style.opacity = "0.7"}>
                        Acceso Administradores
                    </Link>
                </div>
            </div>
        </div>
    );
}
