"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";

type Message = {
    id: string;
    content: string;
    sender_role: "customer" | "admin";
    created_at: string;
    read: boolean;
};

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [token, setToken] = useState("");

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        setToken(session.access_token);

        const res = await fetch("/api/chat", {
            headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await res.json();

        if (data.conversation) setConversationId(data.conversation.id);
        setMessages(data.messages || []);
        setLoading(false);

        // Mark messages as read
        if (data.conversation?.id) {
            await fetch("/api/chat", {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    conversation_id: data.conversation.id,
                    reader_role: "customer",
                }),
            });
        }
    }, []);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    // Subscribe to realtime messages
    useEffect(() => {
        if (!conversationId) return;

        const channel = supabase
            .channel(`chat:${conversationId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "chat_messages",
                    filter: `conversation_id=eq.${conversationId}`,
                },
                (payload) => {
                    const newMsg = payload.new as Message;
                    setMessages((prev) => [...prev, newMsg]);

                    // Auto-mark as read if from admin
                    if (newMsg.sender_role === "admin" && token) {
                        fetch("/api/chat", {
                            method: "PATCH",
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                conversation_id: conversationId,
                                reader_role: "customer",
                            }),
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, token]);

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        const content = newMessage.trim();
        setNewMessage("");

        // Optimistic update
        const optimisticMsg: Message = {
            id: `temp-${Date.now()}`,
            content,
            sender_role: "customer",
            created_at: new Date().toISOString(),
            read: false,
        };
        setMessages((prev) => [...prev, optimisticMsg]);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        await fetch("/api/chat", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session.access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content,
                conversation_id: conversationId,
                sender_role: "customer",
            }),
        });

        setSending(false);
    };

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();
        if (isToday) return d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
        return d.toLocaleDateString("es-MX", { day: "numeric", month: "short" }) + " " + d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 4rem)" }}>
            <div style={{ marginBottom: "1rem" }}>
                <h1 style={{ color: "white", fontFamily: "var(--font-heading)", fontSize: "1.5rem", margin: 0 }}>
                    💬 Chat con Doctor Foam
                </h1>
                <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
                    Nuestro equipo te responderá lo antes posible
                </p>
            </div>

            {/* Messages area */}
            <div className="glass-card" style={{
                flex: 1, padding: "1rem", overflowY: "auto", display: "flex",
                flexDirection: "column", gap: "0.5rem", marginBottom: "1rem",
            }}>
                {loading ? (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <p style={{ color: "#94a3b8" }}>Cargando mensajes...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                        <div>
                            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>💬</div>
                            <p style={{ color: "white", fontWeight: 600, marginBottom: "0.5rem" }}>¡Hola!</p>
                            <p style={{ color: "#94a3b8", fontSize: "0.85rem", maxWidth: "300px" }}>
                                Escríbenos cualquier duda sobre tu servicio. Estamos aquí para ayudarte.
                            </p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isCustomer = msg.sender_role === "customer";
                        return (
                            <div key={msg.id} style={{
                                display: "flex", justifyContent: isCustomer ? "flex-end" : "flex-start",
                            }}>
                                <div style={{
                                    maxWidth: "75%", padding: "0.75rem 1rem", borderRadius: "12px",
                                    background: isCustomer
                                        ? "linear-gradient(135deg, #3b82f6, #1d4ed8)"
                                        : "rgba(15,34,64,0.8)",
                                    border: isCustomer ? "none" : "1px solid rgba(96,165,250,0.15)",
                                }}>
                                    {!isCustomer && (
                                        <p style={{ color: "#60a5fa", fontSize: "0.7rem", fontWeight: 600, margin: "0 0 0.25rem" }}>
                                            Doctor Foam
                                        </p>
                                    )}
                                    <p style={{ color: "white", margin: 0, fontSize: "0.9rem", lineHeight: 1.5, wordBreak: "break-word" }}>
                                        {msg.content}
                                    </p>
                                    <p style={{ color: isCustomer ? "rgba(255,255,255,0.5)" : "#475569", fontSize: "0.65rem", margin: "0.3rem 0 0", textAlign: "right" }}>
                                        {formatTime(msg.created_at)}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <form onSubmit={handleSend} style={{ display: "flex", gap: "0.5rem" }}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe tu mensaje..."
                    style={{
                        flex: 1, padding: "0.85rem 1rem", borderRadius: "12px",
                        border: "1px solid rgba(96,165,250,0.2)", background: "rgba(10,22,40,0.8)",
                        color: "white", fontSize: "0.9rem", outline: "none",
                    }}
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    style={{
                        padding: "0.85rem 1.5rem", borderRadius: "12px", border: "none",
                        background: newMessage.trim() ? "linear-gradient(135deg, #3b82f6, #1d4ed8)" : "rgba(59,130,246,0.2)",
                        color: "white", fontSize: "1rem", cursor: newMessage.trim() ? "pointer" : "default",
                        transition: "all 0.2s",
                    }}
                >
                    {sending ? "..." : "➤"}
                </button>
            </form>
        </div>
    );
}
