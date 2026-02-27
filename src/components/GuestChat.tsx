"use client";

import { supabase } from "@/lib/supabase";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

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

function GuestChatInner() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
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
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [adminTyping, setAdminTyping] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const openRef = useRef(open);
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const sessionId = typeof window !== "undefined" ? getSessionId() : "";

    useEffect(() => { openRef.current = open; }, [open]);

    const fetchMessages = useCallback(async () => {
        if (!sessionId) return;
        try {
            const res = await fetch(`/api/guest-chat?session_id=${sessionId}`);
            if (res.ok) {
                const data = await res.json();
                if (data.conversation) {
                    setHasConversation(true);
                    setConversationId(data.conversation.id);
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
        if (searchParams?.get("chat") === "open") {
            setOpen(true);
            // Clean the URL param without reload
            if (typeof window !== "undefined") {
                const url = new URL(window.location.href);
                url.searchParams.delete("chat");
                window.history.replaceState({}, "", url.pathname + url.search);
            }
        }
    }, [searchParams]);

    // Initial fetch
    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    // Real-time subscription
    useEffect(() => {
        if (!conversationId) return;

        const channel = supabase.channel(`chat_${conversationId}`);
        channelRef.current = channel;

        channel
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'guest_messages', filter: `conversation_id=eq.${conversationId}` }, (payload) => {
                const newMsg = payload.new as GuestMessage;
                setMessages(prev => {
                    if (prev.find(m => m.id === newMsg.id)) return prev;
                    return [...prev, newMsg];
                });
                if (newMsg.sender_role === 'admin') {
                    setAdminTyping(false);
                    if (!openRef.current) setUnreadCount(c => c + 1);
                }
            })
            .on('broadcast', { event: 'typing' }, (payload) => {
                if (payload.payload.role === 'admin') {
                    setAdminTyping(payload.payload.isTyping);
                    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                    if (payload.payload.isTyping) {
                        typingTimeoutRef.current = setTimeout(() => setAdminTyping(false), 5000);
                    }
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            channelRef.current = null;
        };
    }, [conversationId]);

    // Cleanup timeouts
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        }
    }, []);

    // Clear unread on open
    useEffect(() => {
        if (open) setUnreadCount(0);
    }, [open]);

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
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
            const res = await fetch("/api/guest-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                signal: controller.signal,
                body: JSON.stringify({
                    session_id: sessionId,
                    content: input.trim(),
                    guest_name: name || "Visitante",
                    guest_email: email || undefined,
                }),
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, data.message]);
                setInput("");
                setHasConversation(true);
            } else {
                const errData = await res.json().catch(() => ({}));
                alert("Error al enviar el mensaje: " + (errData.error || res.statusText || "Error del servidor"));
            }
        } catch (err: any) {
            console.error("GuestChat error:", err);
            alert("Hubo un problema de conexión. Intenta de nuevo.");
        } finally {
            setSending(false);
        }
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
                                {adminTyping && (
                                    <div style={{
                                        display: "flex", justifyContent: "flex-start",
                                        marginBottom: "0.6rem",
                                    }}>
                                        <div style={{
                                            padding: "0.6rem 0.85rem",
                                            borderRadius: "0.85rem 0.85rem 0.85rem 0.2rem",
                                            background: "rgba(255,255,255,0.08)",
                                            color: "#e2e8f0", fontSize: "0.85rem",
                                            display: "flex", gap: "4px", alignItems: "center"
                                        }}>
                                            <span style={{ animation: "guestChatBounce 1s infinite", animationDelay: "0s" }}>.</span>
                                            <span style={{ animation: "guestChatBounce 1s infinite", animationDelay: "0.2s" }}>.</span>
                                            <span style={{ animation: "guestChatBounce 1s infinite", animationDelay: "0.4s" }}>.</span>
                                        </div>
                                    </div>
                                )}
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
                                    onChange={e => {
                                        setInput(e.target.value);
                                        if (channelRef.current && hasConversation) {
                                            channelRef.current.send({
                                                type: 'broadcast',
                                                event: 'typing',
                                                payload: { role: 'guest', isTyping: e.target.value.trim().length > 0 }
                                            });
                                        }
                                    }}
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
                @keyframes guestChatBounce {
                    0%, 100% { transform: translateY(0); opacity: 0.5; }
                    50% { transform: translateY(-3px); opacity: 1; }
                }
            `}</style>
        </>
    );
}

export default function GuestChat() {
    return (
        <Suspense fallback={null}>
            <GuestChatInner />
        </Suspense>
    );
}

const guestInputStyle: React.CSSProperties = {
    width: "100%", padding: "0.65rem 0.85rem", borderRadius: "0.6rem",
    border: "1px solid rgba(96,165,250,0.15)", background: "rgba(255,255,255,0.06)",
    color: "white", fontSize: "0.85rem", outline: "none", fontFamily: "var(--font-body)",
};
