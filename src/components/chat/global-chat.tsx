"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth/context";
import { getMessages, addMessage, CHAT_CITIES, type ChatMessage, type ChatCity } from "@/lib/chat/store";
import { moderateText } from "@/lib/chat/moderation";

const POLL_MS = 2500;

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
}

function ChatBubbleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 2 11 13" /><path d="M22 2 15 22 11 13 2 9l20-7Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function GlobalChat() {
  const { user } = useAuth();
  const [open, setOpen]         = useState(false);
  const [city, setCity]         = useState<ChatCity>("Milano");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText]         = useState("");
  const [sendCity, setSendCity] = useState<ChatCity>("Milano");
  const [error, setError]       = useState<string | null>(null);
  const [sending, setSending]   = useState(false);
  const [unread, setUnread]     = useState(0);
  const bottomRef   = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLTextAreaElement>(null);
  const lastCountRef = useRef(0);

  const loadMessages = useCallback(() => {
    const msgs = getMessages(city);
    setMessages(msgs);
    if (!open) {
      const diff = msgs.length - lastCountRef.current;
      if (diff > 0 && lastCountRef.current > 0) setUnread((u) => u + diff);
    }
    lastCountRef.current = msgs.length;
  }, [open, city]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  useEffect(() => {
    const id = setInterval(loadMessages, POLL_MS);
    return () => clearInterval(id);
  }, [loadMessages]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "instant" });
        inputRef.current?.focus();
      }, 60);
    }
  }, [open]);

  // Reset unread when changing city and sync sendCity
  useEffect(() => { lastCountRef.current = 0; setSendCity(city); }, [city]);

  function handleSend() {
    if (!user) { setError("Accedi per inviare messaggi."); return; }
    const check = moderateText(text);
    if (!check.ok) { setError(check.reason ?? "Messaggio non valido."); return; }
    setSending(true);
    setError(null);
    try {
      addMessage({ userId: user.id, userName: user.name.split(" ")[0]!, text: text.trim(), city: sendCity });
      setText("");
      loadMessages();
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  const cities = CHAT_CITIES.filter((c) => c !== "Tutte");

  return (
    <div className="gchat">
      <button
        className={`gchat__toggle${open ? " is-open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Chiudi chat" : "Apri chat globale"}
      >
        {open ? <CloseIcon /> : <ChatBubbleIcon />}
        {!open && unread > 0 && <span className="gchat__badge">{unread > 9 ? "9+" : unread}</span>}
        {!open && <span className="gchat__label">Chatta e chiedi consiglio!</span>}
      </button>

      {open && (
        <div className="gchat__panel" role="dialog" aria-label="Chat globale">

          {/* Header */}
          <div className="gchat__header">
            <div className="gchat__header-info">
              <span className="gchat__online-dot" aria-hidden="true" />
              <strong>Chat Globale</strong>
            </div>
            <span className="gchat__header-sub">Rispetta gli altri · No insulti</span>
          </div>

          {/* City filter tabs */}
          <div className="gchat__cities">
            {cities.map((c) => (
              <button
                key={c}
                className={`gchat__city-btn${city === c ? " is-active" : ""}`}
                onClick={() => setCity(c)}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="gchat__messages">
            {messages.length === 0 ? (
              <p className="gchat__empty">
                {city === "Tutte"
                  ? "Nessun messaggio ancora. Inizia tu! 👋"
                  : `Nessun messaggio da ${city}. Scrivi il primo! 👋`}
              </p>
            ) : (
              messages.map((msg) => {
                const isMe = user?.id === msg.userId;
                return (
                  <div key={msg.id} className={`gchat__msg${isMe ? " gchat__msg--me" : ""}`}>
                    <div className="gchat__msg-meta">
                      <span className="gchat__msg-name">{isMe ? "Tu" : msg.userName}</span>
                      {msg.city !== "Tutte" && (
                        <span className="gchat__msg-city">{msg.city}</span>
                      )}
                      <span className="gchat__msg-time">{formatTime(msg.createdAt)}</span>
                    </div>
                    <div className="gchat__msg-bubble">{msg.text}</div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="gchat__input-area">
            {error && <p className="gchat__error">{error}</p>}
            {user ? (
              <>
                <div className="gchat__input-row">
                  <textarea
                    ref={inputRef}
                    className="gchat__input"
                    value={text}
                    onChange={(e) => { setText(e.target.value); setError(null); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Scrivi un messaggio…"
                    rows={1}
                    maxLength={280}
                    disabled={sending}
                  />
                  <button
                    className="gchat__send"
                    onClick={handleSend}
                    disabled={!text.trim() || sending}
                    aria-label="Invia"
                  >
                    <SendIcon />
                  </button>
                </div>
              </>
            ) : (
              <p className="gchat__login-note">
                <a href="/login">Accedi</a> per partecipare alla chat.
              </p>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
