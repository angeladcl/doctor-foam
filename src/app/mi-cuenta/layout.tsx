"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const NAV_ITEMS = [
    { href: "/mi-cuenta", label: "Inicio", icon: "🏠" },
    { href: "/mi-cuenta/servicios", label: "Mis servicios", icon: "📋" },
    { href: "/mi-cuenta/reservar", label: "Reservar", icon: "📅" },
    { href: "/mi-cuenta/chat", label: "Chat", icon: "💬" },
    { href: "/mi-cuenta/perfil", label: "Mi perfil", icon: "👤" },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                router.push("/login");
                return;
            }
            // Only allow customer role (not admin)
            setUser(session.user);
            setLoading(false);
        };
        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) router.push("/login");
            else setUser(session.user);
        });

        return () => subscription.unsubscribe();
    }, [router]);

    // Fetch unread messages
    const fetchUnread = useCallback(async () => {
        if (!user) return;
        const { data: conv } = await supabase
            .from("chat_conversations")
            .select("id")
            .eq("customer_id", user.id)
            .single();

        if (conv) {
            const { count } = await supabase
                .from("chat_messages")
                .select("*", { count: "exact", head: true })
                .eq("conversation_id", conv.id)
                .eq("sender_role", "admin")
                .eq("read", false);
            setUnreadCount(count || 0);
        }
    }, [user]);

    useEffect(() => {
        fetchUnread();
        const interval = setInterval(fetchUnread, 15000);
        return () => clearInterval(interval);
    }, [fetchUnread]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg-primary)" }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🚗</div>
                    <p style={{ color: "#94a3b8" }}>Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "var(--color-bg-primary)", display: "flex" }}>
            {/* Mobile toggle */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                    position: "fixed", top: "1rem", left: "1rem", zIndex: 60,
                    background: "rgba(15,34,64,0.95)", border: "1px solid rgba(96,165,250,0.2)",
                    borderRadius: "0.5rem", color: "white", padding: "0.5rem 0.75rem",
                    cursor: "pointer", display: "none", fontSize: "1.2rem",
                }}
                className="portal-menu-btn"
            >
                {sidebarOpen ? "✕" : "☰"}
            </button>

            {/* Sidebar */}
            <aside
                className={`portal-sidebar ${sidebarOpen ? "open" : ""}`}
                style={{
                    width: "260px", minHeight: "100vh", background: "rgba(15,34,64,0.6)",
                    borderRight: "1px solid rgba(96,165,250,0.1)", display: "flex",
                    flexDirection: "column", position: "fixed", left: 0, top: 0, zIndex: 50,
                }}
            >
                {/* Logo */}
                <Link href="/" style={{ textDecoration: "none", padding: "1.5rem", display: "block", borderBottom: "1px solid rgba(96,165,250,0.1)" }}>
                    <h1 style={{ margin: 0, color: "white", fontSize: "1.1rem", fontFamily: "var(--font-heading)", letterSpacing: "2px" }}>
                        DOCTOR <span className="gradient-text">FOAM</span>
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "0.7rem", margin: "0.25rem 0 0" }}>Mi cuenta</p>
                </Link>

                {/* Nav */}
                <nav style={{ flex: 1, padding: "1rem 0.75rem" }}>
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                style={{
                                    display: "flex", alignItems: "center", gap: "0.75rem",
                                    padding: "0.75rem 1rem", borderRadius: "0.5rem", marginBottom: "0.25rem",
                                    textDecoration: "none", fontSize: "0.9rem", transition: "all 0.2s",
                                    background: isActive ? "rgba(59,130,246,0.15)" : "transparent",
                                    color: isActive ? "#60a5fa" : "#94a3b8",
                                    borderLeft: isActive ? "3px solid #3b82f6" : "3px solid transparent",
                                }}
                            >
                                <span>{item.icon}</span>
                                <span style={{ fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
                                {item.href === "/mi-cuenta/chat" && unreadCount > 0 && (
                                    <span style={{
                                        marginLeft: "auto", background: "#ef4444", color: "white",
                                        fontSize: "0.7rem", fontWeight: 700, padding: "0.1rem 0.4rem",
                                        borderRadius: "999px", minWidth: "18px", textAlign: "center",
                                    }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User info + logout */}
                <div style={{ padding: "1rem", borderTop: "1px solid rgba(96,165,250,0.1)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                        <div style={{
                            width: "36px", height: "36px", borderRadius: "50%",
                            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "white", fontWeight: 700, fontSize: "0.85rem",
                        }}>
                            {(user?.user_metadata?.full_name || user?.email || "?")[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1, overflow: "hidden" }}>
                            <p style={{ color: "white", fontSize: "0.8rem", margin: 0, fontWeight: 600, textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }}>
                                {user?.user_metadata?.full_name || "Cliente"}
                            </p>
                            <p style={{ color: "#64748b", fontSize: "0.7rem", margin: 0, textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }}>
                                {user?.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: "100%", padding: "0.5rem", borderRadius: "0.5rem",
                            border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.05)",
                            color: "#f87171", cursor: "pointer", fontSize: "0.8rem",
                        }}
                    >
                        Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div onClick={() => setSidebarOpen(false)} style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40,
                }} />
            )}

            {/* Main content */}
            <main style={{ flex: 1, marginLeft: "260px", padding: "2rem", minHeight: "100vh" }} className="portal-main">
                {children}
            </main>

            <style>{`
                @media (max-width: 768px) {
                    .portal-menu-btn { display: block !important; }
                    .portal-sidebar { transform: translateX(-100%); transition: transform 0.3s ease; }
                    .portal-sidebar.open { transform: translateX(0); }
                    .portal-main { margin-left: 0 !important; padding: 1rem !important; padding-top: 4rem !important; }
                }
            `}</style>
        </div>
    );
}
