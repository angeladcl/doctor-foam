"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [sessionReady, setSessionReady] = useState(false);

    useEffect(() => {
        // Supabase will automatically handle the recovery token from the URL hash
        supabase.auth.onAuthStateChange((event) => {
            if (event === "PASSWORD_RECOVERY") {
                setSessionReady(true);
            }
        });
    }, []);

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

        const { error: updateError } = await supabase.auth.updateUser({
            password,
        });

        if (updateError) {
            setError("Error al actualizar la contraseña. Intenta de nuevo.");
            setLoading(false);
        } else {
            setSuccess(true);
            setTimeout(() => router.push("/mi-cuenta"), 2000);
        }
    };

    return (
        <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--color-bg-primary)", padding: "1rem",
        }}>
            <div className="glass-card" style={{ maxWidth: "420px", width: "100%", padding: "2.5rem" }}>
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <Link href="/" style={{ textDecoration: "none" }}>
                        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.5rem", color: "white", margin: 0 }}>
                            DOCTOR <span className="gradient-text">FOAM</span>
                        </h1>
                    </Link>
                    <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                        {success ? "¡Contraseña actualizada!" : sessionReady ? "Crea tu nueva contraseña" : "Verificando enlace..."}
                    </p>
                </div>

                {success ? (
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
                        <p style={{ color: "#34d399", marginBottom: "1rem" }}>Tu contraseña ha sido actualizada exitosamente.</p>
                        <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Redirigiendo a tu cuenta...</p>
                    </div>
                ) : sessionReady ? (
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
                        <div style={{ color: "#94a3b8" }}>Verificando tu enlace...</div>
                    </div>
                )}
            </div>
        </div>
    );
}
