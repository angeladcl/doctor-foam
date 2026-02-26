"use client";

import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [mode, setMode] = useState<"login" | "reset">("login");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError("Credenciales incorrectas.");
            setLoading(false);
        } else {
            const { data: { user }, error: refreshError } = await supabase.auth.getUser();
            if (user?.app_metadata?.role === "admin") {
                router.push("/admin");
            } else {
                // If it's a customer logging in through the admin portal
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

            if (!res.ok) {
                setError(data.error || "Error al enviar el correo de recuperación.");
            } else {
                setSuccess("Se envió un enlace de recuperación a tu correo electrónico.");
            }
        } catch {
            setError("Error de conexión. Intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (newMode: "login" | "reset") => {
        setMode(newMode);
        setError("");
        setSuccess("");
    };

    return (
        <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--color-bg-primary)",
        }}>
            <div className="animate-fade-in-up" style={{ width: "100%", maxWidth: "420px", padding: "1.5rem" }}>
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <Link href="/" style={{ textDecoration: "none" }}>
                        <Logo size="lg" />
                    </Link>
                    <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: "0.75rem" }}>Panel de Administración</p>
                </div>

                <form onSubmit={mode === "login" ? handleLogin : handleResetPassword} className="glass-card" style={{ padding: "2rem" }}>
                    <h2 style={{ fontSize: "1.2rem", marginBottom: "1.5rem", textAlign: "center", fontFamily: "var(--font-heading)" }}>
                        {mode === "login" ? "Iniciar Sesión" : "Recuperar Contraseña"}
                    </h2>

                    {error && (
                        <div style={{
                            background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)",
                            borderRadius: "0.5rem", padding: "0.75rem", marginBottom: "1rem",
                            color: "#fca5a5", fontSize: "0.85rem", textAlign: "center",
                        }}>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={{
                            background: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.3)",
                            borderRadius: "0.5rem", padding: "0.75rem", marginBottom: "1rem",
                            color: "#86efac", fontSize: "0.85rem", textAlign: "center",
                        }}>
                            {success}
                        </div>
                    )}

                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", fontFamily: "var(--font-heading)", fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.4rem" }}>
                            Email
                        </label>
                        <input
                            type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                            placeholder="admin@doctorfoam.mx"
                            style={{
                                width: "100%", padding: "0.75rem 1rem", borderRadius: "0.5rem",
                                border: "1px solid rgba(96, 165, 250, 0.2)", background: "rgba(10, 22, 40, 0.8)",
                                color: "white", fontSize: "0.95rem", outline: "none",
                                transition: "border-color 0.2s",
                            }}
                            onFocus={e => e.target.style.borderColor = "rgba(59, 130, 246, 0.5)"}
                            onBlur={e => e.target.style.borderColor = "rgba(96, 165, 250, 0.2)"}
                        />
                    </div>

                    {mode === "login" && (
                        <div style={{ marginBottom: "1.5rem" }}>
                            <label style={{ display: "block", fontFamily: "var(--font-heading)", fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.4rem" }}>
                                Contraseña
                            </label>
                            <input
                                type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                                placeholder="••••••••"
                                style={{
                                    width: "100%", padding: "0.75rem 1rem", borderRadius: "0.5rem",
                                    border: "1px solid rgba(96, 165, 250, 0.2)", background: "rgba(10, 22, 40, 0.8)",
                                    color: "white", fontSize: "0.95rem", outline: "none",
                                    transition: "border-color 0.2s",
                                }}
                                onFocus={e => e.target.style.borderColor = "rgba(59, 130, 246, 0.5)"}
                                onBlur={e => e.target.style.borderColor = "rgba(96, 165, 250, 0.2)"}
                            />
                        </div>
                    )}

                    {mode === "reset" && (
                        <p style={{ color: "#94a3b8", fontSize: "0.8rem", marginBottom: "1.5rem", textAlign: "center" }}>
                            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
                        </p>
                    )}

                    <button type="submit" className="btn-premium" disabled={loading}
                        style={{ width: "100%", justifyContent: "center", opacity: loading ? 0.6 : 1 }}>
                        {mode === "login"
                            ? (loading ? "Ingresando..." : "Entrar al Panel")
                            : (loading ? "Enviando..." : "Enviar enlace de recuperación")
                        }
                    </button>

                    <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
                        {mode === "login" ? (
                            <button
                                type="button"
                                onClick={() => switchMode("reset")}
                                style={{
                                    background: "none", border: "none", color: "#60a5fa",
                                    fontSize: "0.85rem", cursor: "pointer", textDecoration: "underline",
                                    fontFamily: "var(--font-heading)",
                                }}
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => switchMode("login")}
                                style={{
                                    background: "none", border: "none", color: "#60a5fa",
                                    fontSize: "0.85rem", cursor: "pointer", textDecoration: "underline",
                                    fontFamily: "var(--font-heading)",
                                }}
                            >
                                ← Volver al inicio de sesión
                            </button>
                        )}
                    </div>
                </form>

                <p style={{ textAlign: "center", color: "#475569", fontSize: "0.72rem", marginTop: "2rem", fontFamily: "var(--font-heading)" }}>
                    © {new Date().getFullYear()} Doctor Foam · v2.0
                </p>
            </div>
        </div>
    );
}
