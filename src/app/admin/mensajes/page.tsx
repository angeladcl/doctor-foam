"use client";

import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useRef, useState } from "react";

type Conversation = {
    id: string;
    customer_id?: string;
    customer_name: string;
    customer_email: string;
    last_message_at: string;
    unread_count: number;
    status?: string;
    guest_name?: string;
    guest_email?: string;
};

type Message = {
    id: string;
    conversation_id: string;
    sender_id?: string;
    sender_role: "admin" | "customer" | "guest";
    content: string;
    created_at: string;
    read: boolean;
};

type TabType = "clientes" | "invitados";

export default function AdminMensajes() {
    const [session, setSession] = useState<{ access_token: string } | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>("clientes");
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [guestConversations, setGuestConversations] = useState<Conversation[]>([]);
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

    /* ─── Fetch conversations ─── */
    const fetchClientConversations = useCallback(async () => {
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
    }, [session]);

    const fetchGuestConversations = useCallback(async () => {
        if (!session) return;
        try {
            const res = await fetch("/api/admin/guest-chat", {
                headers: { Authorization: `Bearer ${session.access_token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setGuestConversations(data.conversations || []);
            }
        } catch { /* silent */ }
    }, [session]);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        await Promise.all([fetchClientConversations(), fetchGuestConversations()]);
        setLoading(false);
    }, [fetchClientConversations, fetchGuestConversations]);

    useEffect(() => {
        if (session) {
            fetchAll();
            const interval = setInterval(fetchAll, 20000);
            return () => clearInterval(interval);
        }
    }, [session, fetchAll]);

    /* ─── Load messages ─── */
    const loadMessages = useCallback(async (conv: Conversation, isGuest: boolean) => {
        if (!session) return;
        setLoadingMessages(true);
        setSelectedConv(conv);
        setMobileView("chat");

        try {
            if (isGuest) {
                const res = await fetch(`/api/admin/guest-chat?conversation_id=${conv.id}`, {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data.messages || []);
                }
                // Mark as read
                await fetch("/api/admin/guest-chat", {
                    method: "PATCH",
                    headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ conversation_id: conv.id }),
                });
            } else {
                const res = await fetch(`/api/chat?conversation_id=${conv.id}`, {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data.messages || []);
                }
                await fetch("/api/chat", {
                    method: "PATCH",
                    headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ conversation_id: conv.id, reader_role: "admin" }),
                });
            }

            // Update unread locally
            if (isGuest) {
                setGuestConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread_count: 0 } : c));
            } else {
                setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread_count: 0 } : c));
            }
        } catch { /* silent */ }
        setLoadingMessages(false);
    }, [session]);

    /* ─── Realtime ─── */
    useEffect(() => {
        if (!selectedConv) return;
        const table = activeTab === "invitados" ? "guest_messages" : "chat_messages";
        const channel = supabase
            .channel(`msg-${selectedConv.id}`)
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table, filter: `conversation_id=eq.${selectedConv.id}` },
                (payload) => {
                    const msg = payload.new as Message;
                    setMessages(prev => {
                        if (prev.some(m => m.id === msg.id)) return prev;
                        return [...prev, msg];
                    });
                    // Auto-mark as read
                    const otherRole = activeTab === "invitados" ? "guest" : "customer";
                    if (msg.sender_role === otherRole && session) {
                        const endpoint = activeTab === "invitados" ? "/api/admin/guest-chat" : "/api/chat";
                        const body = activeTab === "invitados"
                            ? { conversation_id: selectedConv.id }
                            : { conversation_id: selectedConv.id, reader_role: "admin" };
                        fetch(endpoint, {
                            method: "PATCH",
                            headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
                            body: JSON.stringify(body),
                        }).catch(() => { });
                    }
                }
            )
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [selectedConv, session, activeTab]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    /* ─── Send message ─── */
    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConv || !session || sending) return;
        setSending(true);
        try {
            if (activeTab === "invitados") {
                const res = await fetch("/api/admin/guest-chat", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ conversation_id: selectedConv.id, content: newMessage.trim() }),
                });
                if (res.ok) {
                    const data = await res.json();
                    setMessages(prev => [...prev, data.message]);
                    setNewMessage("");
                }
            } else {
                const res = await fetch("/api/chat", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ content: newMessage.trim(), conversation_id: selectedConv.id }),
                });
                if (res.ok) {
                    const data = await res.json();
                    setMessages(prev => [...prev, data.message]);
                    setNewMessage("");
                }
            }
        } catch { /* silent */ }
        setSending(false);
    };

    const handleBack = () => {
        setMobileView("list");
        setSelectedConv(null);
        fetchAll();
    };

    const switchTab = (tab: TabType) => {
        setActiveTab(tab);
        setSelectedConv(null);
        setMessages([]);
        setMobileView("list");
        setSearchQuery("");
    };

    /* ─── Helpers ─── */
    const currentConversations = activeTab === "clientes" ? conversations : guestConversations;
    const filteredConversations = currentConversations.filter(c =>
        !searchQuery || c.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.customer_email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const totalClientUnread = conversations.reduce((acc, c) => acc + c.unread_count, 0);
    const totalGuestUnread = guestConversations.reduce((acc, c) => acc + c.unread_count, 0);

    const formatTime = (iso: string) => {
        const d = new Date(iso);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        if (diff < 60000) return "Ahora";
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
        if (diff < 86400000) return d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
        return d.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
    };

    const formatMessageTime = (iso: string) =>
        new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

    const getInitial = (name: string) => (name || "?")[0].toUpperCase();

    return (
        <AdminLayout>
            <div style={{ marginBottom: "1.5rem" }}>
                <h1 style={{ color: "white", fontSize: "1.5rem", fontFamily: "var(--font-heading)", fontWeight: 800, margin: 0 }}>
                    💬 Mensajes
                    {(totalClientUnread + totalGuestUnread) > 0 && (
                        <span style={{
                            marginLeft: "0.75rem", background: "#ef4444", color: "white",
                            fontSize: "0.75rem", fontWeight: 700, padding: "0.2rem 0.6rem",
                            borderRadius: "1rem", verticalAlign: "middle",
                        }}>
                            {totalClientUnread + totalGuestUnread} sin leer
                        </span>
                    )}
                </h1>
            </div>

            {/* ─── Tabs ─── */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                {([
                    { key: "clientes" as TabType, label: "👤 Clientes", count: totalClientUnread },
                    { key: "invitados" as TabType, label: "🌐 Invitados", count: totalGuestUnread },
                ]).map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => switchTab(tab.key)}
                        style={{
                            padding: "0.55rem 1.1rem", borderRadius: "0.6rem",
                            border: activeTab === tab.key ? "1px solid rgba(59,130,246,0.4)" : "1px solid rgba(96,165,250,0.1)",
                            background: activeTab === tab.key ? "rgba(59,130,246,0.15)" : "rgba(10,22,40,0.4)",
                            color: activeTab === tab.key ? "#60a5fa" : "#94a3b8",
                            cursor: "pointer", fontWeight: 600, fontSize: "0.85rem",
                            fontFamily: "var(--font-heading)", transition: "all 0.2s",
                            display: "flex", alignItems: "center", gap: "0.4rem",
                        }}
                    >
                        {tab.label}
                        {tab.count > 0 && (
                            <span style={{
                                background: "#ef4444", color: "white", fontSize: "0.6rem",
                                fontWeight: 700, padding: "0.1rem 0.35rem", borderRadius: "1rem",
                                minWidth: "14px", textAlign: "center",
                            }}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ─── Chat Layout ─── */}
            <div className="msg-layout" style={{
                display: "flex", gap: "0", height: "calc(100vh - 230px)",
                borderRadius: "1rem", overflow: "hidden",
                border: "1px solid rgba(96,165,250,0.1)",
                background: "rgba(10,22,40,0.5)",
            }}>
                {/* Conversation List */}
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
                            padding: "0.5rem 0.75rem", border: "1px solid rgba(96,165,250,0.1)",
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
                                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem", opacity: 0.5 }}>
                                    {activeTab === "invitados" ? "🌐" : "💬"}
                                </div>
                                <p style={{ fontSize: "0.85rem", margin: 0 }}>
                                    {searchQuery ? "Sin resultados" : activeTab === "invitados" ? "No hay chats de invitados aún" : "No hay conversaciones aún"}
                                </p>
                                <p style={{ fontSize: "0.75rem", marginTop: "0.5rem", color: "#475569" }}>
                                    {searchQuery ? "Intenta otro término" : activeTab === "invitados"
                                        ? "Aparecerán cuando un visitante use el chat público"
                                        : "Las conversaciones aparecerán cuando un cliente te escriba"}
                                </p>
                            </div>
                        ) : (
                            filteredConversations.map(conv => (
                                <button
                                    key={conv.id}
                                    onClick={() => loadMessages(conv, activeTab === "invitados")}
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
                                            ? activeTab === "invitados"
                                                ? "linear-gradient(135deg, #10b981, #34d399)"
                                                : "linear-gradient(135deg, #3b82f6, #8b5cf6)"
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
                                                    background: activeTab === "invitados" ? "#48bb78" : "#63b3ed",
                                                    color: "white", fontSize: "0.65rem", fontWeight: 700,
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

                {/* Chat Area */}
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
                                >←</button>
                                <div style={{
                                    width: "36px", height: "36px", borderRadius: "50%",
                                    background: activeTab === "invitados"
                                        ? "linear-gradient(135deg, #2f855a, #48bb78)"
                                        : "linear-gradient(135deg, #3182ce, #b794f6)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "white", fontWeight: 700, fontSize: "0.9rem",
                                }}>
                                    {getInitial(selectedConv.customer_name)}
                                </div>
                                <div>
                                    <div style={{ color: "white", fontWeight: 600, fontSize: "0.9rem", fontFamily: "var(--font-heading)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                        {selectedConv.customer_name}
                                        <span style={{
                                            fontSize: "0.6rem", padding: "0.1rem 0.35rem", borderRadius: "0.3rem",
                                            background: activeTab === "invitados" ? "rgba(72,187,120,0.15)" : "rgba(99,179,237,0.15)",
                                            color: activeTab === "invitados" ? "#48bb78" : "#63b3ed",
                                            fontWeight: 600,
                                        }}>
                                            {activeTab === "invitados" ? "Invitado" : "Cliente"}
                                        </span>
                                    </div>
                                    <div style={{ color: "#64748b", fontSize: "0.7rem" }}>
                                        {selectedConv.customer_email || "Sin email"}
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
                                                    maxWidth: "75%", padding: "0.7rem 1rem",
                                                    borderRadius: isAdmin ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem",
                                                    background: isAdmin
                                                        ? "linear-gradient(135deg, #3182ce, #63b3ed)"
                                                        : "rgba(255,255,255,0.08)",
                                                    color: isAdmin ? "white" : "#e2e8f0",
                                                    fontSize: "0.88rem", lineHeight: "1.55",
                                                    border: isAdmin ? "none" : "1px solid rgba(96,165,250,0.1)",
                                                }}>
                                                    <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg.content}</div>
                                                    <div style={{
                                                        fontSize: "0.65rem",
                                                        color: isAdmin ? "rgba(255,255,255,0.6)" : "#64748b",
                                                        marginTop: "0.35rem", textAlign: "right",
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
                                        background: newMessage.trim() ? "linear-gradient(135deg, #3182ce, #63b3ed)" : "rgba(99,179,237,0.1)",
                                        color: "white", border: "none", cursor: newMessage.trim() ? "pointer" : "default",
                                        fontWeight: 600, fontSize: "0.85rem", fontFamily: "var(--font-heading)",
                                        transition: "all 0.2s", opacity: sending ? 0.6 : 1,
                                    }}
                                >
                                    {sending ? "..." : "Enviar"}
                                </button>
                            </div>
                            <div style={{ padding: "0 1rem 0.5rem", textAlign: "right" }}>
                                <span style={{ color: "#334155", fontSize: "0.65rem", fontFamily: "var(--font-heading)" }}>
                                    ⏎ Enter para enviar
                                </span>
                            </div>
                        </>
                    ) : (
                        <div style={{
                            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                            flexDirection: "column", color: "#64748b",
                        }}>
                            <div style={{ fontSize: "4rem", opacity: 0.25, marginBottom: "1rem" }}>
                                {activeTab === "invitados" ? "🌐" : "💬"}
                            </div>
                            <p style={{ fontSize: "1rem", fontWeight: 600, color: "#94a3b8", fontFamily: "var(--font-heading)" }}>
                                Selecciona una conversación
                            </p>
                            <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
                                Elige un chat de {activeTab === "invitados" ? "invitados" : "clientes"} para ver los mensajes
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Responsive styles */}
            <style>{`
                @media (max-width: 768px) {
                    .msg-layout {
                        height: calc(100vh - 190px) !important;
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
