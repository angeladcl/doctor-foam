"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [visible, setVisible] = useState(false);
    const [installed, setInstalled] = useState(false);

    useEffect(() => {
        // Check if already dismissed
        if (localStorage.getItem("pwa-install-dismissed")) return;

        // Check if already installed (standalone mode)
        if (window.matchMedia("(display-mode: standalone)").matches) return;

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Brief delay for smoother UX
            setTimeout(() => setVisible(true), 2000);
        };

        window.addEventListener("beforeinstallprompt", handler);
        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setInstalled(true);
            setTimeout(() => setVisible(false), 2000);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setVisible(false);
        localStorage.setItem("pwa-install-dismissed", "1");
    };

    if (!visible) return null;

    return (
        <div style={{
            position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)",
            zIndex: 1000, width: "calc(100% - 2rem)", maxWidth: "400px",
            background: "rgba(10,22,40,0.97)", backdropFilter: "blur(20px)",
            border: "1px solid rgba(59,130,246,0.25)", borderRadius: "1rem",
            padding: "1rem 1.25rem", boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            animation: "slideUp 0.5s cubic-bezier(0.16,1,0.3,1)",
        }}>
            {installed ? (
                <div style={{ textAlign: "center", color: "#10b981", fontWeight: 600, fontSize: "0.9rem" }}>
                    ✅ ¡App instalada correctamente!
                </div>
            ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{
                        width: "44px", height: "44px", borderRadius: "0.75rem", flexShrink: 0,
                        background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.5rem",
                    }}>
                        🚗
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ color: "white", fontWeight: 700, fontSize: "0.9rem", fontFamily: "var(--font-heading)" }}>
                            Instalar Doctor Foam
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: "0.75rem", marginTop: "0.15rem" }}>
                            Acceso rápido desde tu pantalla de inicio
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                        <button
                            onClick={handleDismiss}
                            style={{
                                background: "none", border: "none", color: "#64748b",
                                cursor: "pointer", fontSize: "0.8rem", padding: "0.4rem",
                            }}
                        >
                            ✕
                        </button>
                        <button
                            onClick={handleInstall}
                            style={{
                                background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                                border: "none", borderRadius: "0.5rem",
                                color: "white", fontWeight: 700, fontSize: "0.78rem",
                                padding: "0.45rem 0.85rem", cursor: "pointer",
                                fontFamily: "var(--font-heading)",
                            }}
                        >
                            Instalar
                        </button>
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
