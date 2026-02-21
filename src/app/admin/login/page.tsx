"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError("Credenciales incorrectas.");
            setLoading(false);
        } else {
            router.push("/admin");
        }
    };

    return (
        <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--color-bg-primary)",
        }}>
            <div style={{ width: "100%", maxWidth: "420px", padding: "1.5rem" }}>
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <Link href="/" style={{ textDecoration: "none" }}>
                        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.5rem", color: "white" }}>
                            DOCTOR <span className="gradient-text">FOAM</span>
                        </span>
                    </Link>
                    <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: "0.5rem" }}>Panel de Administración</p>
                </div>

                <form onSubmit={handleLogin} className="glass-card" style={{ padding: "2rem" }}>
                    <h2 style={{ fontSize: "1.2rem", marginBottom: "1.5rem", textAlign: "center", fontFamily: "var(--font-heading)" }}>
                        Iniciar Sesión
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
                            }}
                        />
                    </div>

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
                            }}
                        />
                    </div>

                    <button type="submit" className="btn-premium" disabled={loading}
                        style={{ width: "100%", justifyContent: "center", opacity: loading ? 0.6 : 1 }}>
                        {loading ? "Ingresando..." : "Entrar al Panel"}
                    </button>
                </form>
            </div>
        </div>
    );
}
