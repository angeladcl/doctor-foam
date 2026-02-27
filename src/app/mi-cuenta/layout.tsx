"use client";

import InstallPrompt from "@/components/InstallPrompt";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

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
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🚗</div>
                    <p style={{ color: "#64748b" }}>Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex" }}>
            {/* Mobile toggle */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                    position: "fixed", top: "1rem", left: "1rem", zIndex: 60,
                    background: "white", border: "1px solid #e2e8f0",
                    borderRadius: "0.5rem", color: "#0f172a", padding: "0.5rem 0.75rem",
                    cursor: "pointer", display: "none", fontSize: "1.2rem",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}
                className="portal-menu-btn"
            >
                {sidebarOpen ? "✕" : "☰"}
            </button>

            {/* Sidebar */}
            <aside
                className={`portal-sidebar ${sidebarOpen ? "open" : ""}`}
                style={{
                    width: "260px", minHeight: "100vh", background: "white",
                    borderRight: "1px solid #e2e8f0", display: "flex",
                    flexDirection: "column", position: "fixed", left: 0, top: 0, zIndex: 50,
                }}
            >
                {/* Logo */}
                <Link href="/" style={{ textDecoration: "none", padding: "1.5rem", display: "block", borderBottom: "1px solid #e2e8f0" }}>
                    <h1 style={{ margin: 0, color: "#0f172a", fontSize: "1.1rem", fontFamily: "var(--font-heading)", letterSpacing: "2px" }}>
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
                                    background: isActive ? "#eff6ff" : "transparent",
                                    color: isActive ? "#2563eb" : "#475569",
                                    borderLeft: isActive ? "3px solid #3b82f6" : "3px solid transparent",
                                }}
                            >
                                <span>{item.icon}</span>
                                <span style={{ fontWeight: isActive ? 600 : 500 }}>{item.label}</span>
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
                <div style={{ padding: "1rem", borderTop: "1px solid #e2e8f0" }}>
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
                            <p style={{ color: "#0f172a", fontSize: "0.8rem", margin: 0, fontWeight: 600, textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }}>
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
                            border: "1px solid rgba(239,68,68,0.2)", background: "#fef2f2",
                            color: "#ef4444", cursor: "pointer", fontSize: "0.8rem",
                            fontWeight: 500
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

            <InstallPrompt />

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
