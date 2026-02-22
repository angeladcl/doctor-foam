"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [tokenValid, setTokenValid] = useState(false);

    const token = searchParams.get("token");
    const email = searchParams.get("email");

    useEffect(() => {
        if (token && email) {
            setTokenValid(true);
        }
    }, [token, email]);

    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }
        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/auth/verify-reset-token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, email, newPassword: password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Error al actualizar la contraseña");
                setLoading(false);
                return;
            }

            setSuccess(true);
            setTimeout(() => router.push("/admin/login"), 3000);
        } catch {
            setError("Error de conexión. Intenta de nuevo.");
            setLoading(false);
        }
    };

    return (
        <div className="glass-card" style={{ maxWidth: "420px", width: "100%", padding: "2.5rem" }}>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <Link href="/" style={{ textDecoration: "none" }}>
                    <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.5rem", color: "white", margin: 0 }}>
                        DOCTOR <span className="gradient-text">FOAM</span>
                    </h1>
                </Link>
                <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                    {success ? "¡Contraseña actualizada!" : tokenValid ? "Crea tu nueva contraseña" : "Enlace inválido"}
                </p>
            </div>

            {success ? (
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
                    <p style={{ color: "#34d399", marginBottom: "1rem" }}>Tu contraseña ha sido actualizada exitosamente.</p>
                    <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Redirigiendo al login...</p>
                </div>
            ) : tokenValid ? (
                <form onSubmit={handleSetPassword}>
                    <div style={{ display: "grid", gap: "1rem", marginBottom: "1.5rem" }}>
                        <div>
                            <label style={{ color: "#94a3b8", fontSize: "0.8rem", fontFamily: "var(--font-heading)", display: "block", marginBottom: "0.3rem" }}>Nueva contraseña</label>
                            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres"
                                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "0.5rem", border: "1px solid rgba(96, 165, 250, 0.2)", background: "rgba(10, 22, 40, 0.8)", color: "white", fontSize: "0.9rem", outline: "none" }} />
                        </div>
                        <div>
                            <label style={{ color: "#94a3b8", fontSize: "0.8rem", fontFamily: "var(--font-heading)", display: "block", marginBottom: "0.3rem" }}>Confirmar contraseña</label>
                            <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repite la contraseña"
                                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "0.5rem", border: "1px solid rgba(96, 165, 250, 0.2)", background: "rgba(10, 22, 40, 0.8)", color: "white", fontSize: "0.9rem", outline: "none" }} />
                        </div>
                    </div>

                    {error && (
                        <div style={{ padding: "0.75rem", borderRadius: "0.5rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#f87171", fontSize: "0.85rem", marginBottom: "1rem" }}>{error}</div>
                    )}

                    <button type="submit" disabled={loading} className="btn-premium" style={{ width: "100%", justifyContent: "center" }}>
                        {loading ? "Guardando..." : "Guardar nueva contraseña"}
                    </button>
                </form>
            ) : (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
                    <p style={{ color: "#f87171", marginBottom: "1rem" }}>Enlace inválido o expirado.</p>
                    <Link href="/admin/login" style={{ color: "#60a5fa", textDecoration: "none", fontSize: "0.9rem" }}>
                        Volver al login →
                    </Link>
                </div>
            )}
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--color-bg-primary)", padding: "1rem",
        }}>
            <Suspense fallback={
                <div className="glass-card" style={{ maxWidth: "420px", width: "100%", padding: "2.5rem", textAlign: "center" }}>
                    <p style={{ color: "#94a3b8" }}>Cargando...</p>
                </div>
            }>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
