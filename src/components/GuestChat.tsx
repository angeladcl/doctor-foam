"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type GuestMessage = {
    id: string;
    sender_role: "guest" | "admin";
    content: string;
    created_at: string;
    read: boolean;
};

function getSessionId(): string {
    if (typeof window === "undefined") return "";
    let id = localStorage.getItem("drfoam_guest_session");
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem("drfoam_guest_session", id);
    }
    return id;
}

// Paths where guest chat should NOT appear
const HIDDEN_PATHS = ["/admin", "/mi-cuenta/chat"];

export default function GuestChat() {
    const pathname = usePathname();
    const shouldHide = HIDDEN_PATHS.some((p) => pathname.startsWith(p));

    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<GuestMessage[]>([]);
    const [input, setInput] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [showIntro, setShowIntro] = useState(true);
    const [sending, setSending] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [hasConversation, setHasConversation] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const sessionId = typeof window !== "undefined" ? getSessionId() : "";

    const fetchMessages = useCallback(async () => {
        if (!sessionId) return;
        try {
            const res = await fetch(`/api/guest-chat?session_id=${sessionId}`);
            if (res.ok) {
                const data = await res.json();
                if (data.conversation) {
                    setHasConversation(true);
                    setShowIntro(false);
                    setMessages(data.messages || []);
                    // Count unread admin messages
                    const unread = (data.messages || []).filter(
                        (m: GuestMessage) => m.sender_role === "admin" && !m.read
                    ).length;
                    if (!open) setUnreadCount(unread);
                }
            }
        } catch { /* silent */ }
    }, [sessionId, open]);

    // Auto-open from URL param (?chat=open) — for Google Maps messaging link
    useEffect(() => {
        if (typeof window === "undefined") return;
        const params = new URLSearchParams(window.location.search);
        if (params.get("chat") === "open") {
            setOpen(true);
            // Clean the URL param without reload
            const url = new URL(window.location.href);
            url.searchParams.delete("chat");
            window.history.replaceState({}, "", url.pathname + url.search);
        }
    }, []);

    // Initial fetch + polling
    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    useEffect(() => {
        if (open) {
            pollRef.current = setInterval(fetchMessages, 10000);
            setUnreadCount(0);
        }
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [open, fetchMessages]);

    // Auto-scroll
    useEffect(() => {
        if (open) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, open]);

    const handleStartChat = () => {
        if (!name.trim()) return;
        setShowIntro(false);
    };

    const sendMessage = async () => {
        if (!input.trim() || sending) return;
        setSending(true);
        try {
            const res = await fetch("/api/guest-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: sessionId,
                    content: input.trim(),
                    guest_name: name || "Visitante",
                    guest_email: email || undefined,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, data.message]);
                setInput("");
                setHasConversation(true);
            }
        } catch { /* silent */ }
        setSending(false);
    };

    const formatTime = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
    };

    if (shouldHide) return null;

    return (
        <>
            {/* Floating Bubble */}
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    aria-label="Chat con Doctor Foam"
                    style={{
                        position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 900,
                        width: "60px", height: "60px", borderRadius: "50%",
                        background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                        border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(37,99,235,0.5)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "transform 0.3s, box-shadow 0.3s",
                        animation: "guestChatPulse 2s ease-in-out infinite",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    {unreadCount > 0 && (
                        <span style={{
                            position: "absolute", top: "-4px", right: "-4px",
                            background: "#ef4444", color: "white", fontSize: "0.65rem",
                            fontWeight: 700, width: "20px", height: "20px", borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            border: "2px solid #0a1628",
                        }}>
                            {unreadCount}
                        </span>
                    )}
                </button>
            )}

            {/* Chat Panel */}
            {open && (
                <div style={{
                    position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 900,
                    width: "370px", maxWidth: "calc(100vw - 2rem)",
                    height: "520px", maxHeight: "calc(100vh - 6rem)",
                    borderRadius: "1rem", overflow: "hidden",
                    background: "rgba(10,22,40,0.97)", backdropFilter: "blur(20px)",
                    border: "1px solid rgba(59,130,246,0.25)",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
                    display: "flex", flexDirection: "column",
                    animation: "guestChatSlideIn 0.35s cubic-bezier(0.16,1,0.3,1)",
                }}>
                    {/* Header */}
                    <div style={{
                        padding: "0.85rem 1rem",
                        background: "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(37,99,235,0.05))",
                        borderBottom: "1px solid rgba(59,130,246,0.15)",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                            <div style={{
                                width: "36px", height: "36px", borderRadius: "50%",
                                background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "1.1rem",
                            }}>🚗</div>
                            <div>
                                <div style={{ color: "white", fontWeight: 700, fontSize: "0.9rem", fontFamily: "var(--font-heading)" }}>
                                    Doctor Foam
                                </div>
                                <div style={{ color: "#60a5fa", fontSize: "0.7rem" }}>
                                    <span style={{
                                        display: "inline-block", width: "6px", height: "6px",
                                        borderRadius: "50%", background: "#10b981", marginRight: "0.3rem",
                                        verticalAlign: "middle",
                                    }} />
                                    En línea
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            style={{
                                background: "none", border: "none", color: "#64748b",
                                cursor: "pointer", fontSize: "1.2rem", padding: "0.25rem",
                            }}
                        >✕</button>
                    </div>

                    {/* Body */}
                    {showIntro && !hasConversation ? (
                        /* Intro Form */
                        <div style={{ flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                                <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>👋</div>
                                <h3 style={{ color: "white", fontSize: "1.1rem", fontFamily: "var(--font-heading)", margin: "0 0 0.35rem" }}>
                                    ¡Hola! ¿En qué te ayudamos?
                                </h3>
                                <p style={{ color: "#94a3b8", fontSize: "0.8rem", margin: 0 }}>
                                    Escríbenos tu pregunta y te responderemos lo antes posible
                                </p>
                                <p style={{ color: "#60a5fa", fontSize: "0.72rem", margin: "0.5rem 0 0", lineHeight: 1.5 }}>
                                    💡 Pregunta por disponibilidad, precios, o agenda tu servicio aquí
                                </p>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Tu nombre *"
                                    style={guestInputStyle}
                                />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="Email (opcional)"
                                    style={guestInputStyle}
                                />
                                <button
                                    onClick={handleStartChat}
                                    disabled={!name.trim()}
                                    style={{
                                        padding: "0.7rem", borderRadius: "0.6rem",
                                        background: name.trim() ? "linear-gradient(135deg, #2563eb, #3b82f6)" : "rgba(96,165,250,0.1)",
                                        color: "white", border: "none", cursor: name.trim() ? "pointer" : "default",
                                        fontWeight: 700, fontSize: "0.88rem", fontFamily: "var(--font-heading)",
                                        transition: "all 0.2s",
                                    }}
                                >
                                    Iniciar chat
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Messages Area */
                        <>
                            <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
                                {messages.length === 0 && (
                                    <div style={{ textAlign: "center", color: "#64748b", padding: "2rem 0.5rem" }}>
                                        <p style={{ fontSize: "0.85rem", margin: 0 }}>
                                            Escribe tu mensaje y te responderemos pronto 💬
                                        </p>
                                    </div>
                                )}
                                {messages.map(msg => {
                                    const isGuest = msg.sender_role === "guest";
                                    return (
                                        <div key={msg.id} style={{
                                            display: "flex", justifyContent: isGuest ? "flex-end" : "flex-start",
                                            marginBottom: "0.6rem",
                                        }}>
                                            <div style={{
                                                maxWidth: "80%", padding: "0.6rem 0.85rem",
                                                borderRadius: isGuest ? "0.85rem 0.85rem 0.2rem 0.85rem" : "0.85rem 0.85rem 0.85rem 0.2rem",
                                                background: isGuest
                                                    ? "linear-gradient(135deg, #2563eb, #3b82f6)"
                                                    : "rgba(255,255,255,0.08)",
                                                color: isGuest ? "white" : "#e2e8f0",
                                                fontSize: "0.85rem", lineHeight: "1.5",
                                                border: isGuest ? "none" : "1px solid rgba(96,165,250,0.1)",
                                            }}>
                                                <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg.content}</div>
                                                <div style={{
                                                    fontSize: "0.6rem", textAlign: "right", marginTop: "0.25rem",
                                                    color: isGuest ? "rgba(255,255,255,0.6)" : "#64748b",
                                                }}>
                                                    {formatTime(msg.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div style={{
                                padding: "0.7rem", borderTop: "1px solid rgba(59,130,246,0.1)",
                                background: "rgba(10,22,40,0.8)",
                                display: "flex", alignItems: "center", gap: "0.5rem",
                            }}>
                                <input
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                                    placeholder="Escribe un mensaje..."
                                    style={{
                                        flex: 1, background: "rgba(255,255,255,0.06)",
                                        border: "1px solid rgba(96,165,250,0.15)", borderRadius: "0.6rem",
                                        padding: "0.55rem 0.85rem", color: "white", fontSize: "0.85rem",
                                        outline: "none", fontFamily: "var(--font-body)",
                                    }}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!input.trim() || sending}
                                    style={{
                                        padding: "0.55rem 0.85rem", borderRadius: "0.6rem",
                                        background: input.trim() ? "linear-gradient(135deg, #2563eb, #3b82f6)" : "rgba(96,165,250,0.1)",
                                        color: "white", border: "none",
                                        cursor: input.trim() ? "pointer" : "default",
                                        fontWeight: 600, fontSize: "0.8rem", fontFamily: "var(--font-heading)",
                                        opacity: sending ? 0.6 : 1,
                                    }}
                                >
                                    {sending ? "..." : "→"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            <style>{`
                @keyframes guestChatPulse {
                    0%, 100% { box-shadow: 0 4px 20px rgba(37,99,235,0.4); }
                    50% { box-shadow: 0 4px 30px rgba(37,99,235,0.7); }
                }
                @keyframes guestChatSlideIn {
                    from { transform: translateY(20px) scale(0.95); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
            `}</style>
        </>
    );
}

const guestInputStyle: React.CSSProperties = {
    width: "100%", padding: "0.65rem 0.85rem", borderRadius: "0.6rem",
    border: "1px solid rgba(96,165,250,0.15)", background: "rgba(255,255,255,0.06)",
    color: "white", fontSize: "0.85rem", outline: "none", fontFamily: "var(--font-body)",
};
