"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
    const [profile, setProfile] = useState({ full_name: "", phone: "", default_address: "", default_vehicle: "" });
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setEmail(user.email || "");

            const { data } = await supabase
                .from("customer_profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (data) {
                setProfile({
                    full_name: data.full_name || "",
                    phone: data.phone || "",
                    default_address: data.default_address || "",
                    default_vehicle: data.default_vehicle || "",
                });
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from("customer_profiles")
            .upsert({
                id: user.id,
                ...profile,
            });

        if (!error) {
            // Also update user metadata
            await supabase.auth.updateUser({
                data: { full_name: profile.full_name },
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        }
        setSaving(false);
    };

    if (loading) return <p style={{ color: "#94a3b8" }}>Cargando...</p>;

    const inputStyle = {
        width: "100%", padding: "0.75rem 1rem", borderRadius: "0.5rem",
        border: "1px solid rgba(96, 165, 250, 0.2)", background: "rgba(10, 22, 40, 0.8)",
        color: "white", fontSize: "0.9rem", outline: "none" as const,
    };

    return (
        <div>
            <h1 style={{ color: "white", fontFamily: "var(--font-heading)", fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                👤 Mi perfil
            </h1>
            <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>Administra tu información personal</p>

            <div className="glass-card" style={{ maxWidth: "600px", padding: "2rem" }}>
                <form onSubmit={handleSave}>
                    <div style={{ display: "grid", gap: "1.25rem" }}>
                        <div>
                            <label style={{ color: "#94a3b8", fontSize: "0.8rem", fontFamily: "var(--font-heading)", display: "block", marginBottom: "0.3rem" }}>Email</label>
                            <input type="email" value={email} disabled style={{ ...inputStyle, opacity: 0.5, cursor: "not-allowed" }} />
                            <p style={{ color: "#475569", fontSize: "0.7rem", margin: "0.25rem 0 0" }}>El email no se puede cambiar</p>
                        </div>

                        <div>
                            <label style={{ color: "#94a3b8", fontSize: "0.8rem", fontFamily: "var(--font-heading)", display: "block", marginBottom: "0.3rem" }}>Nombre completo</label>
                            <input type="text" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} placeholder="Tu nombre" style={inputStyle} />
                        </div>

                        <div>
                            <label style={{ color: "#94a3b8", fontSize: "0.8rem", fontFamily: "var(--font-heading)", display: "block", marginBottom: "0.3rem" }}>Teléfono</label>
                            <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="55 1234 5678" style={inputStyle} />
                        </div>

                        <div>
                            <label style={{ color: "#94a3b8", fontSize: "0.8rem", fontFamily: "var(--font-heading)", display: "block", marginBottom: "0.3rem" }}>Dirección predeterminada</label>
                            <input type="text" value={profile.default_address} onChange={(e) => setProfile({ ...profile, default_address: e.target.value })} placeholder="Calle, número, colonia, alcaldía" style={inputStyle} />
                        </div>

                        <div>
                            <label style={{ color: "#94a3b8", fontSize: "0.8rem", fontFamily: "var(--font-heading)", display: "block", marginBottom: "0.3rem" }}>Vehículo principal</label>
                            <input type="text" value={profile.default_vehicle} onChange={(e) => setProfile({ ...profile, default_vehicle: e.target.value })} placeholder="Marca, modelo, año, color" style={inputStyle} />
                        </div>
                    </div>

                    {success && (
                        <div style={{ marginTop: "1rem", padding: "0.75rem", borderRadius: "0.5rem", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#34d399", fontSize: "0.85rem" }}>
                            ✅ Perfil actualizado correctamente
                        </div>
                    )}

                    <button type="submit" disabled={saving} className="btn-premium" style={{ marginTop: "1.5rem", width: "100%", justifyContent: "center" }}>
                        {saving ? "Guardando..." : "Guardar cambios"}
                    </button>
                </form>
            </div>
        </div>
    );
}
