"use client";

import { useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type AdminLayoutProps = {
    children: ReactNode;
};

const NAV_ITEMS = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/usuarios", label: "Usuarios", icon: "👥" },
    { href: "/admin/invitaciones", label: "Invitaciones", icon: "✉️" },
    { href: "/admin/mensajes", label: "Mensajes", icon: "💬", badgeKey: "unread_messages" as const },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [session, setSession] = useState<{ access_token: string } | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState(0);

    useEffect(() => {
        supabase.auth.getSession().then(async ({ data }) => {
            if (data.session) {
                // Verify admin role
                const { data: { user } } = await supabase.auth.getUser();
                if (user?.app_metadata?.role !== "admin") {
                    router.push("/");
                    setLoadingAuth(false);
                    return;
                }
                setSession(data.session);
            } else {
                router.push("/admin/login");
            }
            setLoadingAuth(false);
        });
    }, [router]);

    const fetchUnread = useCallback(async () => {
        if (!session) return;
        try {
            const res = await fetch("/api/admin/chat?unread=true", {
                headers: { Authorization: `Bearer ${session.access_token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setUnreadMessages(data.unread_count || 0);
            }
        } catch { /* silent */ }
    }, [session]);

    useEffect(() => {
        if (session) {
            fetchUnread();
            const interval = setInterval(fetchUnread, 30000);
            return () => clearInterval(interval);
        }
    }, [session, fetchUnread]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/admin/login");
    };

    if (loadingAuth) {
        return (
            <div style={{
                minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
                background: "var(--color-bg-primary)", color: "#94a3b8",
            }}>
                Verificando sesión...
            </div>
        );
    }

    if (!session) return null;

    return (
        <div style={{ minHeight: "100vh", background: "var(--color-bg-primary)", display: "flex" }}>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
                        zIndex: 150, display: "block",
                    }}
                />
            )}

            {/* Sidebar */}
            <aside style={{
                width: "260px", position: "fixed", top: 0, left: sidebarOpen ? 0 : "-260px",
                bottom: 0, zIndex: 200, background: "rgba(10, 22, 40, 0.98)",
                borderRight: "1px solid rgba(96, 165, 250, 0.1)",
                display: "flex", flexDirection: "column",
                transition: "left 0.3s ease",
                ...(typeof window !== "undefined" && window.innerWidth >= 768
                    ? { left: 0, position: "fixed" as const }
                    : {}),
            }}>
                {/* Logo */}
                <div style={{
                    padding: "1.5rem", borderBottom: "1px solid rgba(96, 165, 250, 0.08)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                    <Link href="/" style={{ textDecoration: "none" }}>
                        <span style={{
                            fontFamily: "var(--font-heading)", fontWeight: 800,
                            fontSize: "1.1rem", color: "white",
                        }}>
                            DOCTOR <span className="gradient-text">FOAM</span>
                        </span>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="sidebar-close-btn"
                        style={{
                            background: "none", border: "none", color: "#64748b",
                            cursor: "pointer", fontSize: "1.2rem", padding: "0.25rem",
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Nav items */}
                <nav style={{ flex: 1, padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                        const badge = item.badgeKey === "unread_messages" ? unreadMessages : 0;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                style={{
                                    display: "flex", alignItems: "center", gap: "0.75rem",
                                    padding: "0.75rem 1rem", borderRadius: "0.5rem",
                                    textDecoration: "none", fontSize: "0.9rem",
                                    fontFamily: "var(--font-heading)", fontWeight: 600,
                                    color: isActive ? "white" : "#94a3b8",
                                    background: isActive ? "rgba(59, 130, 246, 0.15)" : "transparent",
                                    border: isActive ? "1px solid rgba(59, 130, 246, 0.25)" : "1px solid transparent",
                                    transition: "all 0.2s",
                                }}
                            >
                                <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                                <span style={{ flex: 1 }}>{item.label}</span>
                                {badge > 0 && (
                                    <span style={{
                                        background: "rgba(239, 68, 68, 0.9)", color: "white",
                                        fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.45rem",
                                        borderRadius: "1rem", minWidth: "18px", textAlign: "center",
                                    }}>
                                        {badge > 99 ? "99+" : badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div style={{
                    padding: "1rem 0.75rem", borderTop: "1px solid rgba(96, 165, 250, 0.08)",
                }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: "100%", display: "flex", alignItems: "center", gap: "0.75rem",
                            padding: "0.75rem 1rem", borderRadius: "0.5rem",
                            border: "1px solid rgba(239, 68, 68, 0.2)",
                            background: "rgba(239, 68, 68, 0.05)", color: "#f87171",
                            cursor: "pointer", fontSize: "0.9rem",
                            fontFamily: "var(--font-heading)", fontWeight: 600,
                        }}
                    >
                        🚪 <span>Cerrar sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div style={{ flex: 1, marginLeft: "260px", minHeight: "100vh" }} className="admin-main-content">
                {/* Top bar (mobile) */}
                <div className="admin-topbar" style={{
                    position: "sticky", top: 0, zIndex: 100,
                    background: "rgba(10, 22, 40, 0.95)", backdropFilter: "blur(20px)",
                    borderBottom: "1px solid rgba(96, 165, 250, 0.1)",
                    padding: "0.75rem 1.5rem",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="sidebar-toggle-btn"
                        style={{
                            background: "none", border: "none", color: "white",
                            cursor: "pointer", fontSize: "1.3rem", padding: "0.25rem",
                        }}
                    >
                        ☰
                    </button>
                    <span style={{
                        fontFamily: "var(--font-heading)", fontSize: "0.85rem",
                        color: "#94a3b8", fontWeight: 600,
                    }}>
                        Admin Panel
                    </span>
                    <div style={{ width: "28px" }} />
                </div>

                {/* Page content */}
                <main style={{ padding: "1.5rem" }}>
                    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
                        {children}
                    </div>
                </main>
            </div>

            {/* Responsive styles */}
            <style jsx global>{`
                @media (min-width: 768px) {
                    aside { left: 0 !important; }
                    .sidebar-close-btn { display: none !important; }
                    .sidebar-toggle-btn { display: none !important; }
                    .admin-topbar { display: none !important; }
                }
                @media (max-width: 767px) {
                    .admin-main-content { margin-left: 0 !important; }
                }
            `}</style>
        </div>
    );
}
