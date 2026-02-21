"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";

type Conversation = {
    id: string;
    customer_id: string;
    status: string;
    last_message_at: string;
    created_at: string;
    customer_name?: string;
    customer_email?: string;
    unread_count?: number;
};

type Message = {
    id: string;
    content: string;
    sender_role: "customer" | "admin";
    created_at: string;
    read: boolean;
};

export default function AdminChatPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConv, setSelectedConv] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [token, setToken] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchConversations = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        setToken(session.access_token);

        // Use service role to list all conversations (admin only)
        const res = await fetch("/api/admin/chat", {
            headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await res.json();
        setConversations(data.conversations || []);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, [fetchConversations]);

    const loadMessages = useCallback(async (convId: string) => {
        setSelectedConv(convId);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const res = await fetch(`/api/chat?conversation_id=${convId}`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await res.json();
        setMessages(data.messages || []);

        // Mark as read
        await fetch("/api/chat", {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${session.access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ conversation_id: convId, reader_role: "admin" }),
        });

        // Update unread count locally
        setConversations((prev) =>
            prev.map((c) => (c.id === convId ? { ...c, unread_count: 0 } : c))
        );
    }, []);

    // Realtime for messages
    useEffect(() => {
        if (!selectedConv) return;

        const channel = supabase
            .channel(`admin-chat:${selectedConv}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "chat_messages",
                    filter: `conversation_id=eq.${selectedConv}`,
                },
                (payload) => {
                    const newMsg = payload.new as Message;
                    setMessages((prev) => [...prev, newMsg]);

                    // Mark as read
                    if (newMsg.sender_role === "customer" && token) {
                        fetch("/api/chat", {
                            method: "PATCH",
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                conversation_id: selectedConv,
                                reader_role: "admin",
                            }),
                        });
                    }
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [selectedConv, token]);

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending || !selectedConv) return;

        setSending(true);
        const content = newMessage.trim();
        setNewMessage("");

        // Optimistic
        setMessages((prev) => [
            ...prev,
            {
                id: `temp-${Date.now()}`,
                content,
                sender_role: "admin",
                created_at: new Date().toISOString(),
                read: false,
            },
        ]);

        await fetch("/api/chat", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content,
                conversation_id: selectedConv,
                sender_role: "admin",
            }),
        });

        setSending(false);
    };

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();
        if (isToday) return d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
        return d.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
    };

    return (
        <div style={{ display: "flex", gap: "1rem", height: "calc(100vh - 8rem)" }}>
            {/* Conversations list */}
            <div style={{
                width: "300px", minWidth: "250px", background: "rgba(15,34,64,0.4)",
                borderRadius: "12px", border: "1px solid rgba(96,165,250,0.1)",
                display: "flex", flexDirection: "column", overflow: "hidden",
            }}>
                <div style={{ padding: "1rem", borderBottom: "1px solid rgba(96,165,250,0.1)" }}>
                    <h2 style={{ color: "white", fontSize: "1rem", margin: 0 }}>💬 Conversaciones</h2>
                    <p style={{ color: "#64748b", fontSize: "0.75rem", margin: "0.25rem 0 0" }}>{conversations.length} cliente{conversations.length !== 1 ? "s" : ""}</p>
                </div>
                <div style={{ flex: 1, overflowY: "auto" }}>
                    {loading ? (
                        <p style={{ color: "#94a3b8", padding: "1rem", fontSize: "0.85rem" }}>Cargando...</p>
                    ) : conversations.length === 0 ? (
                        <p style={{ color: "#64748b", padding: "1rem", fontSize: "0.85rem" }}>Sin conversaciones aún</p>
                    ) : (
                        conversations.map((conv) => (
                            <div
                                key={conv.id}
                                onClick={() => loadMessages(conv.id)}
                                style={{
                                    padding: "0.75rem 1rem", cursor: "pointer", transition: "all 0.15s",
                                    borderBottom: "1px solid rgba(96,165,250,0.05)",
                                    background: selectedConv === conv.id ? "rgba(59,130,246,0.1)" : "transparent",
                                    borderLeft: selectedConv === conv.id ? "3px solid #3b82f6" : "3px solid transparent",
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <p style={{ color: "white", fontWeight: 600, fontSize: "0.85rem", margin: 0 }}>
                                        {conv.customer_name || "Cliente"}
                                    </p>
                                    {(conv.unread_count || 0) > 0 && (
                                        <span style={{
                                            background: "#ef4444", color: "white", fontSize: "0.65rem",
                                            padding: "0.1rem 0.4rem", borderRadius: "999px", fontWeight: 700,
                                        }}>
                                            {conv.unread_count}
                                        </span>
                                    )}
                                </div>
                                <p style={{ color: "#64748b", fontSize: "0.7rem", margin: "0.15rem 0 0" }}>
                                    {conv.customer_email || ""} · {formatTime(conv.last_message_at)}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat area */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {!selectedConv ? (
                    <div style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                        background: "rgba(15,34,64,0.4)", borderRadius: "12px",
                        border: "1px solid rgba(96,165,250,0.1)",
                    }}>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💬</div>
                            <p style={{ color: "#94a3b8" }}>Selecciona una conversación</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Messages */}
                        <div style={{
                            flex: 1, padding: "1rem", overflowY: "auto", display: "flex",
                            flexDirection: "column", gap: "0.5rem",
                            background: "rgba(15,34,64,0.4)", borderRadius: "12px 12px 0 0",
                            border: "1px solid rgba(96,165,250,0.1)", borderBottom: "none",
                        }}>
                            {messages.map((msg) => {
                                const isAdmin = msg.sender_role === "admin";
                                return (
                                    <div key={msg.id} style={{ display: "flex", justifyContent: isAdmin ? "flex-end" : "flex-start" }}>
                                        <div style={{
                                            maxWidth: "70%", padding: "0.75rem 1rem", borderRadius: "12px",
                                            background: isAdmin ? "linear-gradient(135deg, #3b82f6, #1d4ed8)" : "rgba(15,34,64,0.8)",
                                            border: isAdmin ? "none" : "1px solid rgba(96,165,250,0.15)",
                                        }}>
                                            <p style={{ color: "white", margin: 0, fontSize: "0.9rem", lineHeight: 1.5, wordBreak: "break-word" }}>{msg.content}</p>
                                            <p style={{ color: isAdmin ? "rgba(255,255,255,0.5)" : "#475569", fontSize: "0.65rem", margin: "0.3rem 0 0", textAlign: "right" }}>
                                                {formatTime(msg.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} style={{
                            display: "flex", gap: "0.5rem", padding: "0.75rem",
                            background: "rgba(15,34,64,0.6)", borderRadius: "0 0 12px 12px",
                            border: "1px solid rgba(96,165,250,0.1)", borderTop: "none",
                        }}>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Responder..."
                                style={{
                                    flex: 1, padding: "0.75rem 1rem", borderRadius: "8px",
                                    border: "1px solid rgba(96,165,250,0.2)", background: "rgba(10,22,40,0.8)",
                                    color: "white", fontSize: "0.9rem", outline: "none",
                                }}
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim() || sending}
                                style={{
                                    padding: "0.75rem 1.25rem", borderRadius: "8px", border: "none",
                                    background: newMessage.trim() ? "linear-gradient(135deg, #3b82f6, #1d4ed8)" : "rgba(59,130,246,0.2)",
                                    color: "white", cursor: newMessage.trim() ? "pointer" : "default",
                                }}
                            >
                                {sending ? "..." : "➤"}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
