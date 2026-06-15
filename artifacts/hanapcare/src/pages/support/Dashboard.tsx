import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Send, User, Clock, CheckCheck, Circle,
  Inbox, ArrowLeft, Bot, Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

interface ChatSession {
  id: number;
  patientId: number;
  patientName: string;
  status: string;
  subject: string;
  updatedAt: string;
}

interface ChatMessage {
  id: number;
  sessionId: number;
  senderId: number | null;
  content: string;
  isBot: boolean;
  createdAt: string;
}

export default function SupportDashboard() {
  const { user, token } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showSessions, setShowSessions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 15000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (activeSession) fetchMessages(activeSession.id);
  }, [activeSession]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchSessions = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/chat/sessions/support", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setSessions(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (sessionId: number) => {
    if (!token) return;
    const res = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setMessages(await res.json());
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !activeSession || !token) return;
    setSending(true);
    try {
      const res = await fetch(`/api/chat/sessions/${activeSession.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: reply.trim() }),
      });
      if (res.ok) {
        const msgs = await res.json();
        setMessages((prev) => [...prev, ...msgs]);
        setReply("");
      }
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async (sessionId: number) => {
    if (!token) return;
    await fetch(`/api/chat/sessions/${sessionId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: "resolved" }),
    });
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: "resolved" } : s))
    );
    if (activeSession?.id === sessionId) {
      setActiveSession(null);
      setShowSessions(true);
    }
  };

  const openSession = (session: ChatSession) => {
    setActiveSession(session);
    setShowSessions(false);
  };

  const statusColor = (status: string) =>
    status === "open"
      ? "text-green-600 bg-green-500/10"
      : status === "resolved"
      ? "text-muted-foreground bg-muted"
      : "text-amber-600 bg-amber-500/10";

  const openCount = sessions.filter((s) => s.status === "open").length;

  return (
    <div className="flex gap-5 h-[calc(100vh-8.5rem)]">
      {/* Sessions panel */}
      <AnimatePresence mode="wait">
        {(showSessions || typeof window !== "undefined" && window.innerWidth >= 640) && (
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            className={`${showSessions ? "flex" : "hidden sm:flex"} flex-col w-full sm:w-72 bg-card rounded-2xl border border-border overflow-hidden`}
          >
            <div className="px-4 py-3.5 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-foreground flex items-center gap-2 text-sm">
                <Inbox className="w-5 h-5 text-primary" />
                Chat Queue
                {openCount > 0 && (
                  <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5 font-bold">
                    {openCount}
                  </span>
                )}
              </h2>
              <button
                onClick={() => setIsOnline(!isOnline)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${
                  isOnline
                    ? "bg-green-500/10 text-green-600 border-green-500/30"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                <Circle className={`w-2 h-2 fill-current ${isOnline ? "text-green-500" : "text-muted-foreground"}`} />
                {isOnline ? "Online" : "Offline"}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/30" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="py-12 text-center">
                  <MessageCircle className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No chat sessions yet.</p>
                </div>
              ) : (
                sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => openSession(session)}
                    className={`w-full text-left px-4 py-3.5 hover:bg-muted/50 border-b border-border last:border-0 transition-colors ${
                      activeSession?.id === session.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-foreground text-sm truncate">
                            {session.patientName || `Patient #${session.patientId}`}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${statusColor(session.status)}`}>
                            {session.status}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-xs mt-0.5 truncate">{session.subject}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground/60">
                          <Clock className="w-3 h-3" />
                          {new Date(session.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat area */}
      <div className={`flex-1 flex flex-col bg-card rounded-2xl border border-border overflow-hidden ${!showSessions ? "flex" : "hidden sm:flex"}`}>
        {!activeSession ? (
          <div className="flex-1 flex items-center justify-center flex-col gap-3 text-center p-8">
            <MessageCircle className="w-14 h-14 text-muted-foreground/20" />
            <h3 className="font-bold text-foreground text-lg">Select a conversation</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Choose a chat session from the queue to start supporting a patient.
            </p>
          </div>
        ) : (
          <>
            <div className="px-5 py-3.5 border-b border-border flex items-center gap-3">
              <button
                onClick={() => { setShowSessions(true); setActiveSession(null); }}
                className="sm:hidden p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground text-sm">
                  {activeSession.patientName || `Patient #${activeSession.patientId}`}
                </p>
                <p className="text-muted-foreground text-xs">{activeSession.subject}</p>
              </div>
              {activeSession.status === "open" && (
                <button
                  onClick={() => handleResolve(activeSession.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-green-500/10 text-green-600 hover:bg-green-500/20 rounded-lg transition-colors border border-green-500/20"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark Resolved
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.senderId === user?.id ? "justify-end" : "items-end"}`}
                >
                  {msg.senderId !== user?.id && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10">
                      {msg.isBot ? (
                        <Bot className="w-4 h-4 text-primary" />
                      ) : (
                        <User className="w-4 h-4 text-primary" />
                      )}
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.senderId === user?.id
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-card text-foreground rounded-bl-sm shadow-sm border border-border"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {activeSession.status === "open" ? (
              <div className="border-t border-border p-3 bg-card">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type a reply…"
                    className="flex-1 px-4 py-2.5 bg-muted rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-background transition-all"
                    maxLength={1000}
                  />
                  <button
                    type="submit"
                    disabled={!reply.trim() || sending}
                    className="w-10 h-10 bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground rounded-xl flex items-center justify-center transition-colors"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
              </div>
            ) : (
              <div className="border-t border-border p-4 bg-muted/20 text-center">
                <p className="text-muted-foreground text-sm">This conversation is resolved.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
