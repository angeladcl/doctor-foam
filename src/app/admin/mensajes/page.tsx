"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import AdminLayout from "@/components/AdminLayout";

type Conversation = {
    id: string;
    customer_id: string;
    customer_name: string;
    customer_email: string;
    last_message_at: string;
    unread_count: number;
    status?: string;
};

type Message = {
    id: string;
    conversation_id: string;
    sender_id: string;
    sender_role: "admin" | "customer";
    content: string;
    created_at: string;
    read: boolean;
};

export default function AdminMensajes() {
    const [session, setSession] = useState<{ access_token: string } | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [mobileView, setMobileView] = useState<"list" | "chat">("list");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) setSession(data.session);
        });
    }, []);

    const fetchConversations = useCallback(async () => {
        if (!session) return;
        try {
            const res = await fetch("/api/admin/chat", {
                headers: { Authorization: `Bearer ${session.access_token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setConversations(data.conversations || []);
            }
        } catch { /* silent */ }
        setLoading(false);
    }, [session]);

    useEffect(() => {
        if (session) {
            fetchConversations();
            const interval = setInterval(fetchConversations, 20000);
            return () => clearInterval(interval);
        }
    }, [session, fetchConversations]);

    const loadMessages = useCallback(async (conv: Conversation) => {
        if (!session) return;
        setLoadingMessages(true);
        setSelectedConv(conv);
        setMobileView("chat");
        try {
            const res = await fetch(`/api/chat?conversation_id=${conv.id}`, {
                headers: { Authorization: `Bearer ${session.access_token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages || []);
            }
            // Mark as read
            await fetch("/api/chat", {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ conversation_id: conv.id, reader_role: "admin" }),
            });
            // Update unread locally
            setConversations(prev =>
                prev.map(c => c.id === conv.id ? { ...c, unread_count: 0 } : c)
            );
        } catch { /* silent */ }
        setLoadingMessages(false);
    }, [session]);

    // Realtime subscription for selected conversation
    useEffect(() => {
        if (!selectedConv) return;
        const channel = supabase
            .channel(`chat-${selectedConv.id}`)
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "chat_messages", filter: `conversation_id=eq.${selectedConv.id}` },
                (payload) => {
                    const msg = payload.new as Message;
                    setMessages(prev => {
                        if (prev.some(m => m.id === msg.id)) return prev;
                        return [...prev, msg];
                    });
                    // Auto-mark as read if it's from customer
                    if (msg.sender_role === "customer" && session) {
                        fetch("/api/chat", {
                            method: "PATCH",
                            headers: {
                                Authorization: `Bearer ${session.access_token}`,
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ conversation_id: selectedConv.id, reader_role: "admin" }),
                        }).catch(() => { });
                    }
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [selectedConv, session]);

    // Auto-scroll on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConv || !session || sending) return;
        setSending(true);
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content: newMessage.trim(), conversation_id: selectedConv.id }),
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, data.message]);
                setNewMessage("");
            }
        } catch { /* silent */ }
        setSending(false);
    };

    const handleBack = () => {
        setMobileView("list");
        setSelectedConv(null);
        fetchConversations();
    };

    const filteredConversations = conversations.filter(c =>
        !searchQuery || c.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.customer_email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalUnread = conversations.reduce((acc, c) => acc + c.unread_count, 0);

    const formatTime = (iso: string) => {
        const d = new Date(iso);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        if (diff < 60000) return "Ahora";
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
        if (diff < 86400000) return d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
        return d.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
    };

    const formatMessageTime = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
    };

    const getInitial = (name: string) => (name || "?")[0].toUpperCase();

    return (
        <AdminLayout>
            <div style={{ marginBottom: "1.5rem" }}>
                <h1 style={{ color: "white", fontSize: "1.5rem", fontFamily: "var(--font-heading)", fontWeight: 800, margin: 0 }}>
                    💬 Mensajes
                    {totalUnread > 0 && (
                        <span style={{
                            marginLeft: "0.75rem", background: "#ef4444", color: "white",
                            fontSize: "0.75rem", fontWeight: 700, padding: "0.2rem 0.6rem",
                            borderRadius: "1rem", verticalAlign: "middle",
                        }}>
                            {totalUnread} sin leer
                        </span>
                    )}
                </h1>
            </div>

            <div className="msg-layout" style={{
                display: "flex", gap: "0", height: "calc(100vh - 180px)",
                borderRadius: "1rem", overflow: "hidden",
                border: "1px solid rgba(96,165,250,0.1)",
                background: "rgba(10,22,40,0.5)",
            }}>
                {/* ─── Conversation List ─── */}
                <div className="msg-list-panel" style={{
                    width: "340px", flexShrink: 0,
                    borderRight: "1px solid rgba(96,165,250,0.08)",
                    display: "flex", flexDirection: "column",
                    background: "rgba(10,22,40,0.6)",
                }}>
                    {/* Search */}
                    <div style={{ padding: "1rem", borderBottom: "1px solid rgba(96,165,250,0.08)" }}>
                        <div style={{
                            display: "flex", alignItems: "center", gap: "0.5rem",
                            background: "rgba(255,255,255,0.05)", borderRadius: "0.5rem",
                            padding: "0.5rem 0.75rem",
                            border: "1px solid rgba(96,165,250,0.1)",
                        }}>
                            <span style={{ color: "#64748b", fontSize: "0.9rem" }}>🔍</span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Buscar conversación..."
                                style={{
                                    flex: 1, background: "none", border: "none", outline: "none",
                                    color: "white", fontSize: "0.85rem", fontFamily: "var(--font-body)",
                                }}
                            />
                        </div>
                    </div>

                    {/* List */}
                    <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem" }}>
                        {loading ? (
                            <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
                                Cargando...
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
                                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem", opacity: 0.5 }}>💬</div>
                                <p style={{ fontSize: "0.85rem", margin: 0 }}>
                                    {searchQuery ? "Sin resultados" : "No hay conversaciones aún"}
                                </p>
                                <p style={{ fontSize: "0.75rem", marginTop: "0.5rem", color: "#475569" }}>
                                    {searchQuery ? "Intenta otro término" : "Las conversaciones aparecerán cuando un cliente te escriba"}
                                </p>
                            </div>
                        ) : (
                            filteredConversations.map(conv => (
                                <button
                                    key={conv.id}
                                    onClick={() => loadMessages(conv)}
                                    style={{
                                        width: "100%", display: "flex", alignItems: "center", gap: "0.75rem",
                                        padding: "0.85rem 0.75rem", borderRadius: "0.75rem", marginBottom: "0.25rem",
                                        border: "none", cursor: "pointer", textAlign: "left",
                                        background: selectedConv?.id === conv.id ? "rgba(59,130,246,0.15)" : "transparent",
                                        transition: "background 0.2s",
                                    }}
                                >
                                    {/* Avatar */}
                                    <div style={{
                                        width: "42px", height: "42px", borderRadius: "50%", flexShrink: 0,
                                        background: conv.unread_count > 0
                                            ? "linear-gradient(135deg, #3b82f6, #8b5cf6)"
                                            : "rgba(96,165,250,0.15)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        color: conv.unread_count > 0 ? "white" : "#64748b",
                                        fontWeight: 700, fontSize: "1rem", fontFamily: "var(--font-heading)",
                                    }}>
                                        {getInitial(conv.customer_name)}
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                                            <span style={{
                                                color: conv.unread_count > 0 ? "white" : "#cbd5e1",
                                                fontSize: "0.88rem", fontWeight: conv.unread_count > 0 ? 700 : 500,
                                                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                            }}>
                                                {conv.customer_name}
                                            </span>
                                            <span style={{ color: "#64748b", fontSize: "0.7rem", flexShrink: 0 }}>
                                                {conv.last_message_at ? formatTime(conv.last_message_at) : ""}
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <span style={{
                                                color: "#64748b", fontSize: "0.75rem",
                                                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                            }}>
                                                {conv.customer_email || "Sin email"}
                                            </span>
                                            {conv.unread_count > 0 && (
                                                <span style={{
                                                    background: "#3b82f6", color: "white",
                                                    fontSize: "0.65rem", fontWeight: 700,
                                                    padding: "0.1rem 0.4rem", borderRadius: "1rem",
                                                    minWidth: "16px", textAlign: "center",
                                                }}>
                                                    {conv.unread_count}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* ─── Chat Area ─── */}
                <div className="msg-chat-panel" style={{
                    flex: 1, display: "flex", flexDirection: "column",
                    background: "rgba(10,22,40,0.3)",
                }}>
                    {selectedConv ? (
                        <>
                            {/* Chat header */}
                            <div style={{
                                padding: "0.85rem 1.25rem",
                                borderBottom: "1px solid rgba(96,165,250,0.08)",
                                display: "flex", alignItems: "center", gap: "0.75rem",
                                background: "rgba(10,22,40,0.8)",
                            }}>
                                <button
                                    className="msg-back-btn"
                                    onClick={handleBack}
                                    style={{
                                        background: "none", border: "none", color: "#60a5fa",
                                        cursor: "pointer", fontSize: "1.1rem", padding: "0.25rem",
                                        display: "none",
                                    }}
                                >
                                    ←
                                </button>
                                <div style={{
                                    width: "36px", height: "36px", borderRadius: "50%",
                                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "white", fontWeight: 700, fontSize: "0.9rem",
                                }}>
                                    {getInitial(selectedConv.customer_name)}
                                </div>
                                <div>
                                    <div style={{ color: "white", fontWeight: 600, fontSize: "0.9rem", fontFamily: "var(--font-heading)" }}>
                                        {selectedConv.customer_name}
                                    </div>
                                    <div style={{ color: "#64748b", fontSize: "0.7rem" }}>
                                        {selectedConv.customer_email}
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>
                                {loadingMessages ? (
                                    <div style={{ textAlign: "center", color: "#64748b", padding: "2rem" }}>Cargando mensajes...</div>
                                ) : messages.length === 0 ? (
                                    <div style={{ textAlign: "center", color: "#64748b", padding: "3rem 1rem" }}>
                                        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem", opacity: 0.4 }}>💬</div>
                                        <p style={{ fontSize: "0.85rem" }}>No hay mensajes en esta conversación</p>
                                        <p style={{ fontSize: "0.75rem", color: "#475569" }}>Escribe el primer mensaje abajo</p>
                                    </div>
                                ) : (
                                    messages.map(msg => {
                                        const isAdmin = msg.sender_role === "admin";
                                        return (
                                            <div key={msg.id} style={{
                                                display: "flex", justifyContent: isAdmin ? "flex-end" : "flex-start",
                                                marginBottom: "0.75rem",
                                            }}>
                                                <div style={{
                                                    maxWidth: "75%",
                                                    padding: "0.7rem 1rem",
                                                    borderRadius: isAdmin ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem",
                                                    background: isAdmin
                                                        ? "linear-gradient(135deg, #2563eb, #3b82f6)"
                                                        : "rgba(255,255,255,0.08)",
                                                    color: isAdmin ? "white" : "#e2e8f0",
                                                    fontSize: "0.88rem",
                                                    lineHeight: "1.55",
                                                    border: isAdmin ? "none" : "1px solid rgba(96,165,250,0.1)",
                                                }}>
                                                    <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg.content}</div>
                                                    <div style={{
                                                        fontSize: "0.65rem",
                                                        color: isAdmin ? "rgba(255,255,255,0.6)" : "#64748b",
                                                        marginTop: "0.35rem",
                                                        textAlign: "right",
                                                        display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.3rem",
                                                    }}>
                                                        {formatMessageTime(msg.created_at)}
                                                        {isAdmin && (
                                                            <span style={{ fontSize: "0.7rem" }}>{msg.read ? "✓✓" : "✓"}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div style={{
                                padding: "0.85rem 1rem",
                                borderTop: "1px solid rgba(96,165,250,0.08)",
                                background: "rgba(10,22,40,0.8)",
                                display: "flex", alignItems: "center", gap: "0.75rem",
                            }}>
                                <input
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                                    placeholder="Escribe un mensaje..."
                                    style={{
                                        flex: 1, background: "rgba(255,255,255,0.06)",
                                        border: "1px solid rgba(96,165,250,0.15)", borderRadius: "0.75rem",
                                        padding: "0.65rem 1rem", color: "white", fontSize: "0.88rem",
                                        outline: "none", fontFamily: "var(--font-body)",
                                    }}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim() || sending}
                                    style={{
                                        padding: "0.65rem 1.25rem", borderRadius: "0.75rem",
                                        background: newMessage.trim() ? "linear-gradient(135deg, #2563eb, #3b82f6)" : "rgba(96,165,250,0.1)",
                                        color: "white", border: "none", cursor: newMessage.trim() ? "pointer" : "default",
                                        fontWeight: 600, fontSize: "0.85rem", fontFamily: "var(--font-heading)",
                                        transition: "all 0.2s", opacity: sending ? 0.6 : 1,
                                    }}
                                >
                                    {sending ? "..." : "Enviar"}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{
                            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                            flexDirection: "column", color: "#64748b",
                        }}>
                            <div style={{ fontSize: "4rem", opacity: 0.25, marginBottom: "1rem" }}>💬</div>
                            <p style={{ fontSize: "1rem", fontWeight: 600, color: "#94a3b8", fontFamily: "var(--font-heading)" }}>
                                Selecciona una conversación
                            </p>
                            <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
                                Elige un chat de la lista para ver los mensajes
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Responsive styles */}
            <style>{`
                @media (max-width: 768px) {
                    .msg-layout {
                        height: calc(100vh - 140px) !important;
                    }
                    .msg-list-panel {
                        width: 100% !important;
                        display: ${mobileView === "list" ? "flex" : "none"} !important;
                    }
                    .msg-chat-panel {
                        display: ${mobileView === "chat" ? "flex" : "none"} !important;
                    }
                    .msg-back-btn {
                        display: block !important;
                    }
                }
            `}</style>
        </AdminLayout>
    );
}
