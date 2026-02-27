"use client";

import AdminChatFAB from "@/components/AdminChatFAB";
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
    { href: "/admin/reservas", label: "Reservas", icon: "📋" },
    { href: "/admin/servicios", label: "Servicios", icon: "🛠️" },
    { href: "/admin/cuentas", label: "Liquidaciones", icon: "💰" },
    { href: "/admin/usuarios", label: "Usuarios", icon: "👥" },
    { href: "/admin/invitaciones", label: "Invitaciones", icon: "✉️" },
    { href: "/admin/mensajes", label: "Mensajes", icon: "💬", badgeKey: "unread_messages" as const },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [session, setSession] = useState<{ access_token: string } | null>(null);
    const [adminUser, setAdminUser] = useState<{ email: string; name: string; role: string } | null>(null);
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
                setAdminUser({
                    email: user.email || "",
                    name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Admin",
                    role: user.app_metadata?.role || "admin",
                });
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
                background: "#f8fafc", color: "#475569",
            }}>
                Verificando sesión...
            </div>
        );
    }

    if (!session) return null;

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex" }}>
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
                bottom: 0, zIndex: 200, background: "#ffffff",
                borderRight: "1px solid #e2e8f0",
                display: "flex", flexDirection: "column",
                transition: "left 0.3s ease",
                ...(typeof window !== "undefined" && window.innerWidth >= 768
                    ? { left: 0, position: "fixed" as const }
                    : {}),
            }}>
                {/* Logo */}
                <div style={{
                    padding: "1.5rem", borderBottom: "1px solid #e2e8f0",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                    <Link href="/" style={{ textDecoration: "none" }}>
                        <span style={{
                            fontFamily: "var(--font-heading)", fontWeight: 800,
                            fontSize: "1.1rem", color: "#0f172a",
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
                                    color: isActive ? "#2563eb" : "#475569",
                                    background: isActive ? "#eff6ff" : "transparent",
                                    border: isActive ? "1px solid #bfdbfe" : "1px solid transparent",
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

                {/* Footer — User Info */}
                <div style={{
                    padding: "1rem 0.75rem", borderTop: "1px solid #e2e8f0",
                }}>
                    {adminUser && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                            <div style={{
                                width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
                                background: "linear-gradient(135deg, #3182ce, #b794f6)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "white", fontWeight: 700, fontSize: "0.85rem",
                            }}>
                                {adminUser.name[0].toUpperCase()}
                            </div>
                            <div style={{ flex: 1, overflow: "hidden" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                    <span style={{
                                        color: "#0f172a", fontSize: "0.8rem", fontWeight: 600,
                                        textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden"
                                    }}>
                                        {adminUser.name}
                                    </span>
                                    <span style={{
                                        fontSize: "0.55rem", padding: "0.1rem 0.35rem", borderRadius: "0.25rem",
                                        background: "rgba(183, 148, 246, 0.18)", color: "#b794f6",
                                        fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
                                        fontFamily: "var(--font-heading)", flexShrink: 0,
                                    }}>
                                        Admin
                                    </span>
                                </div>
                                <p style={{
                                    color: "#475569", fontSize: "0.68rem", margin: 0,
                                    textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden"
                                }}>
                                    {adminUser.email}
                                </p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        style={{
                            width: "100%", display: "flex", alignItems: "center", gap: "0.75rem",
                            padding: "0.6rem 1rem", borderRadius: "0.5rem",
                            border: "1px solid rgba(252, 129, 129, 0.18)",
                            background: "rgba(252, 129, 129, 0.06)", color: "#fc8181",
                            cursor: "pointer", fontSize: "0.8rem",
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
                    background: "#ffffff",
                    borderBottom: "1px solid #e2e8f0",
                    padding: "0.75rem 1.5rem",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="sidebar-toggle-btn"
                        style={{
                            background: "none", border: "none", color: "#0f172a",
                            cursor: "pointer", fontSize: "1.3rem", padding: "0.25rem",
                        }}
                    >
                        ☰
                    </button>
                    <span style={{
                        fontFamily: "var(--font-heading)", fontSize: "0.85rem",
                        color: "#475569", fontWeight: 600,
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

            <AdminChatFAB />

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
                /* Sidebar nav hover */
                nav a:hover {
                    background: #f1f5f9 !important;
                    color: #0f172a !important;
                }
                /* Table row hover (global for admin pages) */
                .admin-main-content table tbody tr {
                    transition: background 0.15s ease;
                }
                .admin-main-content table tbody tr:hover {
                    background: #f8fafc !important;
                }
                /* Skeleton pulse animation */
                @keyframes skeletonPulse {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.8; }
                }
                .skeleton {
                    background: rgba(99, 179, 237, 0.07);
                    border-radius: 0.5rem;
                    animation: skeletonPulse 1.5s ease-in-out infinite;
                }
                /* Toast animations */
                @keyframes toastSlideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes toastSlideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                .toast-enter { animation: toastSlideIn 0.3s ease forwards; }
                .toast-exit { animation: toastSlideOut 0.3s ease forwards; }
                /* Login entrance animation */
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fadeInUp 0.6s ease forwards; }
                /* Gradient shimmer */
                @keyframes gradientShimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                .shimmer-text {
                    background: linear-gradient(90deg, #63b3ed, #b794f6, #63b3ed, #b794f6);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: gradientShimmer 3s linear infinite;
                }
                /* Spin animation for refresh */
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spin { animation: spin 1s linear infinite; }
                /* Mobile cards */
                @media (max-width: 767px) {
                    .admin-table-responsive thead { display: none; }
                    .admin-table-responsive tbody tr {
                        display: flex; flex-direction: column;
                        padding: 1rem; margin-bottom: 0.75rem;
                        border-radius: 0.75rem;
                        background: #ffffff !important;
                        border: 1px solid #e2e8f0 !important;
                    }
                    .admin-table-responsive tbody tr td {
                        padding: 0.3rem 0 !important; border: none !important;
                    }
                    .admin-table-responsive tbody tr td::before {
                        content: attr(data-label);
                        color: #64748b; font-size: 0.72rem; font-weight: 600;
                        text-transform: uppercase; display: block; margin-bottom: 0.15rem;
                        font-family: var(--font-heading); letter-spacing: 0.05em;
                    }
                }
            `}</style>
        </div>
    );
}
