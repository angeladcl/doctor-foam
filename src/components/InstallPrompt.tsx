"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [visible, setVisible] = useState(false);
    const [installed, setInstalled] = useState(false);

    // Push Notification State
    const [pushPermission, setPushPermission] = useState<string>("default");

    useEffect(() => {
        // Check if already dismissed
        if (localStorage.getItem("pwa-install-dismissed")) {
            // Even if PWA is dismissed, check if we need push permissions
            checkPushPermission();
            return;
        }

        // Check if already installed (standalone mode)
        if (window.matchMedia("(display-mode: standalone)").matches) {
            checkPushPermission();
            return;
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Brief delay for smoother UX
            setTimeout(() => setVisible(true), 2000);
        };

        window.addEventListener("beforeinstallprompt", handler);
        checkPushPermission(); // Also check push
        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const checkPushPermission = () => {
        if ("Notification" in window) {
            setPushPermission(Notification.permission);
            if (Notification.permission === "default" && !localStorage.getItem("pwa-install-dismissed")) {
                setTimeout(() => setVisible(true), 2000);
            }
        }
    };

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setInstalled(true);

            // Ask for push if they haven't yet
            if (pushPermission === "default") {
                await requestPushPermission();
            } else {
                setTimeout(() => setVisible(false), 2000);
            }
        }
        setDeferredPrompt(null);
    };

    const requestPushPermission = async () => {
        if (!("Notification" in window)) return;
        try {
            const permission = await Notification.requestPermission();
            setPushPermission(permission);
            if (permission === "granted") {
                await subscribeUserToPush();
            }
            setVisible(false);
        } catch (err) {
            console.error("Error requesting push permission:", err);
            setVisible(false);
        }
    };

    const subscribeUserToPush = async () => {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
        try {
            const registration = await navigator.serviceWorker.ready;
            const applicationServerKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

            const existingSubscription = await registration.pushManager.getSubscription();
            if (existingSubscription) {
                await sendSubscriptionToServer(existingSubscription);
                return;
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey,
            });

            await sendSubscriptionToServer(subscription);
        } catch (err) {
            console.error("Failed to subscribe the user:", err);
        }
    };

    const sendSubscriptionToServer = async (subscription: PushSubscription) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) return;

            await fetch("/api/web-push/subscribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ subscription }),
            });
        } catch (err) {
            console.error("Failed to send push obj to server:", err);
        }
    };

    const handleDismiss = () => {
        setVisible(false);
        localStorage.setItem("pwa-install-dismissed", "1");
    };

    if (!visible) return null;

    // Determine what to show
    const showInstall = !!deferredPrompt && !installed;
    const showPush = pushPermission === "default";

    if (!showInstall && !showPush) return null;

    return (
        <div style={{
            position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)",
            zIndex: 1000, width: "calc(100% - 2rem)", maxWidth: "420px",
            background: "rgba(10,22,40,0.97)", backdropFilter: "blur(20px)",
            border: "1px solid rgba(59,130,246,0.25)", borderRadius: "1rem",
            padding: "1rem 1.25rem", boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            animation: "slideUp 0.5s cubic-bezier(0.16,1,0.3,1)",
        }}>
            {installed && !showPush ? (
                <div style={{ textAlign: "center", color: "#10b981", fontWeight: 600, fontSize: "0.9rem" }}>
                    ✅ ¡App instalada correctamente!
                </div>
            ) : (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", flexDirection: "column" }}>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center", width: "100%" }}>
                        <div style={{
                            width: "44px", height: "44px", borderRadius: "0.75rem", flexShrink: 0,
                            background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "1.5rem",
                        }}>
                            🚗
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: "white", fontWeight: 700, fontSize: "0.95rem", fontFamily: "var(--font-heading)" }}>
                                Experiencia Completa
                            </div>
                            <div style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: "0.15rem", lineHeight: 1.4 }}>
                                Instala la App y activa las notificaciones para estar al tanto de tus servicios.
                            </div>
                        </div>
                        <button
                            onClick={handleDismiss}
                            style={{
                                background: "none", border: "none", color: "#64748b", flexShrink: 0,
                                cursor: "pointer", fontSize: "0.8rem", padding: "0.4rem", alignSelf: "flex-start"
                            }}
                        >
                            ✕
                        </button>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem", width: "100%", justifyContent: "flex-end" }}>
                        {showPush && !showInstall && (
                            <button
                                onClick={requestPushPermission}
                                style={{
                                    background: "linear-gradient(135deg, #10b981, #059669)",
                                    border: "none", borderRadius: "0.5rem", width: "100%",
                                    color: "white", fontWeight: 700, fontSize: "0.8rem",
                                    padding: "0.6rem 1rem", cursor: "pointer",
                                }}
                            >
                                🔔 Activar Notificaciones
                            </button>
                        )}
                        {showInstall && (
                            <button
                                onClick={handleInstall}
                                style={{
                                    background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                                    border: "none", borderRadius: "0.5rem", width: "100%",
                                    color: "white", fontWeight: 700, fontSize: "0.8rem",
                                    padding: "0.6rem 1rem", cursor: "pointer",
                                }}
                            >
                                📲 Instalar App
                            </button>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideUp {
                    from { transform: translateX(-50%) translateY(100%); opacity: 0; }
                    to { transform: translateX(-50%) translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
