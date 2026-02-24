"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

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
    const [pushStatus, setPushStatus] = useState<"idle" | "granted" | "denied" | "unsupported">("idle");
    const pushSubscribed = useRef(false);

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

    // ─── Combined Unread Count (customer + guest) ───
    const fetchUnread = useCallback(async () => {
        if (!session) return;
        try {
            const [customerRes, guestRes] = await Promise.all([
                fetch("/api/admin/chat?unread=true", {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                }),
                fetch("/api/admin/guest-chat?unread=true", {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                }),
            ]);
            let total = 0;
            if (customerRes.ok) {
                const d = await customerRes.json();
                total += d.unread_count || 0;
            }
            if (guestRes.ok) {
                const d = await guestRes.json();
                total += d.unread_count || 0;
            }
            setUnreadMessages(total);
        } catch { /* silent */ }
    }, [session]);

    useEffect(() => {
        if (session) {
            fetchUnread();
            const interval = setInterval(fetchUnread, 30000);
            return () => clearInterval(interval);
        }
    }, [session, fetchUnread]);

    // ─── Supabase Realtime: instant unread update on new messages ───
    useEffect(() => {
        if (!session) return;

        const channel = supabase
            .channel("admin-notifications")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "chat_messages" },
                (payload) => {
                    if (payload.new?.sender_role === "customer") {
                        setUnreadMessages((prev) => prev + 1);
                        // Play notification sound
                        try {
                            const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJaOkYGJfH1+gIyNiYKFf31+gI6NiYOFfn1/gI2OiYKFf31+gI+NiIOEf31+gJCNhoOEgH5/f5COh4OEf35+gJGNhoOEgH5/f5KOh4OEf35+gJKNhoKDgH5/f5OOiIODf35+gJSNhoKDgH5/f5SOh4KDgH5+f5WOhoKDgH5/f5aOhoKCgH5/f5iOhoKCgH5+f5iOh4KCgH5+f5mOh4KCgH5+f5qOh4KCf35+f5uOhoKCgH5+f5yOhoKBf35+f52OhoKBgH5+f5+Oh4KBf35+gKCOh4GBf35+f6GOh4GBf35+gKKOhoGBf35+f6OOhoGBgH5+f6SOhoGBgH5+f6SOh4GBf35+gKSOh4GBf35+gKWOhoGAgH5+f6WOhoGBgH5+f6WOhoGBgH5+f6aOhoGBgH5+f6aOhoGBgH5+f6eOhoGBgH5+f6eOhoGBgH5+f6eOh4GBf35+gKeOh4CAgH5+f6eOh4CAgH5+f6eOh4CAgH5+f6eOh4CAgH5+f6eOh4CAgH5+f6eOh4CAgH59f6eOh4CAgH59f6eOh4CAgH59f6eOh4CAgH59f6eOh4CAgH5+f6eOh4CAgH5+f6eOh4CAgH59f6eOh4CAgH5+f6eOhoCAgH5+f6eOhoCAgH5+f6eOhoCAgH5+f6eOhoCAgH5+f6aOhoCAgH5+f6aOhoGAf35+f6aOhoGAf35+f6aOhoGAf35+f6aOhoGAf35+f6aOhoGAf35+f6WOhoGAf35+f6WOhoGBf35+f6WOhoGBf35+f6WOh4GBf35+f6WOh4GBf35+f6WOh4GBf35+f6WOh4GAf35+f6WOh4GAf35+f6WOh4GBf35+f6WOh4GBf35+f6SOh4GBf35+f6SOh4GBf35+f6SOh4GBf35+f6SOh4GBf35+gKSOh4GBf35+gA==");
                            audio.volume = 0.3;
                            audio.play().catch(() => { });
                        } catch { /* silent */ }
                    }
                }
            )
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "guest_messages" },
                (payload) => {
                    if (payload.new?.sender_role === "guest") {
                        setUnreadMessages((prev) => prev + 1);
                        try {
                            const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJaOkYGJfH1+gIyNiYKFf31+gI6NiYOFfn1/gI2OiYKFf31+gI+NiIOEf31+gJCNhoOEgH5/f5COh4OEf35+gJGNhoOEgH5/f5KOh4OEf35+gJKNhoKDgH5/f5OOiIODf35+gJSNhoKDgH5/f5SOh4KDgH5+f5WOhoKDgH5/f5aOhoKCgH5/f5iOhoKCgH5+f5iOh4KCgH5+f5mOh4KCgH5+f5qOh4KCf35+f5uOhoKCgH5+f5yOhoKBf35+f52OhoKBgH5+f5+Oh4KBf35+gKCOh4GBf35+f6GOh4GBf35+gKKOhoGBf35+f6OOhoGBgH5+f6SOhoGBgH5+f6SOh4GBf35+gKSOh4GBf35+gKWOhoGAgH5+f6WOhoGBgH5+f6WOhoGBgH5+f6aOhoGBgH5+f6aOhoGBgH5+f6eOhoGBgH5+f6eOhoGBgH5+f6eOh4GBf35+gKeOh4CAgH5+f6eOh4CAgH5+f6eOh4CAgH5+f6eOh4CAgH5+f6eOh4CAgH5+f6eOh4CAgH59f6eOh4CAgH59f6eOh4CAgH59f6eOh4CAgH59f6eOh4CAgH5+f6eOh4CAgH5+f6eOh4CAgH59f6eOh4CAgH5+f6eOhoCAgH5+f6eOhoCAgH5+f6eOhoCAgH5+f6eOhoCAgH5+f6aOhoCAgH5+f6aOhoGAf35+f6aOhoGAf35+f6aOhoGAf35+f6aOhoGAf35+f6aOhoGAf35+f6WOhoGAf35+f6WOhoGBf35+f6WOhoGBf35+f6WOh4GBf35+f6WOh4GBf35+f6WOh4GBf35+f6WOh4GAf35+f6WOh4GAf35+f6WOh4GBf35+f6WOh4GBf35+f6SOh4GBf35+f6SOh4GBf35+f6SOh4GBf35+f6SOh4GBf35+gKSOh4GBf35+gA==");
                            audio.volume = 0.3;
                            audio.play().catch(() => { });
                        } catch { /* silent */ }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [session]);

    // ─── Push Notification Auto-Subscribe ───
    const subscribeToPush = useCallback(async () => {
        if (pushSubscribed.current || !session || !VAPID_PUBLIC_KEY) return;
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
            setPushStatus("unsupported");
            return;
        }

        const permission = Notification.permission;
        if (permission === "denied") {
            setPushStatus("denied");
            return;
        }

        if (permission === "default") {
            const result = await Notification.requestPermission();
            if (result !== "granted") {
                setPushStatus(result === "denied" ? "denied" : "idle");
                return;
            }
        }

        try {
            const reg = await navigator.serviceWorker.ready;

            // Check for existing subscription
            let subscription = await reg.pushManager.getSubscription();

            if (!subscription) {
                // Convert VAPID key from base64url to Uint8Array
                const padding = "=".repeat((4 - VAPID_PUBLIC_KEY.length % 4) % 4);
                const base64 = (VAPID_PUBLIC_KEY + padding).replace(/-/g, "+").replace(/_/g, "/");
                const rawData = atob(base64);
                const applicationServerKey = new Uint8Array(rawData.length);
                for (let i = 0; i < rawData.length; i++) {
                    applicationServerKey[i] = rawData.charCodeAt(i);
                }

                subscription = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey,
                });
            }

            // Send subscription to server
            const subJson = subscription.toJSON();
            await fetch("/api/push/subscribe", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    subscription: {
                        endpoint: subJson.endpoint,
                        keys: subJson.keys,
                    },
                }),
            });

            pushSubscribed.current = true;
            setPushStatus("granted");
        } catch (err) {
            console.error("Push subscription error:", err);
            setPushStatus("idle");
        }
    }, [session]);

    useEffect(() => {
        if (session) {
            // Small delay to not block initial render
            const timer = setTimeout(subscribeToPush, 2000);
            return () => clearTimeout(timer);
        }
    }, [session, subscribeToPush]);

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
                    <button
                        onClick={subscribeToPush}
                        title={pushStatus === "granted" ? "Notificaciones activas" : pushStatus === "denied" ? "Notificaciones bloqueadas" : "Activar notificaciones"}
                        style={{
                            background: "none", border: "none", cursor: "pointer",
                            fontSize: "1.2rem", padding: "0.25rem",
                            opacity: pushStatus === "denied" ? 0.4 : 1,
                        }}
                    >
                        {pushStatus === "granted" ? "🔔" : pushStatus === "denied" ? "🔕" : "🔔"}
                    </button>
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
