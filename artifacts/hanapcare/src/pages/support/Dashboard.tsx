import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Send, User, Clock, CheckCheck, Circle,
  Inbox, ArrowLeft, Bot, Loader2, UserCheck, RefreshCw,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useSupportUnread } from "@/hooks/useSupportUnread";

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
  isRead: boolean;
  createdAt: string;
}

export default function SupportDashboard() {
  const { user, token } = useAuth();
  const { sessions: unreadSessions, total: unreadTotal, markSessionRead, refresh: refreshUnread } = useSupportUnread();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showSessions, setShowSessions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sessionsPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const msgPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeSessionRef = useRef<ChatSession | null>(null);

  useEffect(() => {
    activeSessionRef.current = activeSession;
  }, [activeSession]);

  const fetchSessions = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/chat/sessions/support", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (sessionId: number, silent = false) => {
    if (!token) return;
    const res = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data: ChatMessage[] = await res.json();
      if (!silent) {
        setMessages(data);
      } else {
        setMessages((prev) => {
          if (data.length !== prev.length) return data;
          return prev;
        });
      }
    }
  };

  useEffect(() => {
    fetchSessions();
    sessionsPollRef.current = setInterval(fetchSessions, 15000);
    return () => {
      if (sessionsPollRef.current) clearInterval(sessionsPollRef.current);
    };
  }, [token]);

  useEffect(() => {
    if (msgPollRef.current) clearInterval(msgPollRef.current);
    if (activeSession) {
      fetchMessages(activeSession.id);
      msgPollRef.current = setInterval(() => {
        if (activeSessionRef.current) {
          fetchMessages(activeSessionRef.current.id, true);
        }
      }, 5000);
    } else {
      setMessages([]);
    }
    return () => {
      if (msgPollRef.current) clearInterval(msgPollRef.current);
    };
  }, [activeSession?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !activeSession || !token) return;
    setSending(true);
    const content = reply.trim();
    setReply("");
    try {
      const res = await fetch(`/api/chat/sessions/${activeSession.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const data: { messages: ChatMessage[] } = await res.json();
        setMessages((prev) => [...prev, ...data.messages]);
        fetchSessions();
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

  const handleAssign = async (sessionId: number) => {
    if (!token) return;
    await fetch(`/api/chat/sessions/${sessionId}/assign`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({}),
    });
    fetchSessions();
  };

  const openSession = (session: ChatSession) => {
    setActiveSession(session);
    setShowSessions(false);
    markSessionRead(session.id);
    if (session.status === "open") handleAssign(session.id);
  };

  const statusColor = (status: string) =>
    status === "open"
      ? "text-green-600 bg-green-500/10"
      : status === "resolved"
      ? "text-muted-foreground bg-muted"
      : "text-amber-600 bg-amber-500/10";

  const openCount = sessions.filter((s) => s.status === "open").length;

  const getSenderLabel = (msg: ChatMessage) => {
    if (msg.isBot) return "HanapCare Bot";
    if (msg.senderId === user?.id) return "You";
    if (msg.senderId === null) return "System";
    return "Patient";
  };

  return (
    <div className="flex gap-5 h-[calc(100vh-8.5rem)]">
      {/* Sessions panel */}
      <AnimatePresence mode="wait">
        {(showSessions || (typeof window !== "undefined" && window.innerWidth >= 640)) && (
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
                {unreadTotal > 0 && (
                  <span className="text-xs bg-red-500 text-white rounded-full px-2 py-0.5 font-bold">
                    {unreadTotal} new
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchSessions}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
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
                  <p className="text-muted-foreground/60 text-xs mt-1">Patients will appear here when they start a chat.</p>
                </div>
              ) : (
                sessions.map((session) => {
                  const sessionUnread = unreadSessions[session.id] ?? 0;
                  const isSelected = activeSession?.id === session.id;
                  return (
                    <button
                      key={session.id}
                      onClick={() => openSession(session)}
                      className={`w-full text-left px-4 py-3.5 hover:bg-muted/50 border-b border-border last:border-0 transition-colors ${
                        isSelected ? "bg-primary/5 border-l-2 border-l-primary" : ""
                      } ${sessionUnread > 0 && !isSelected ? "bg-red-500/5" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative w-8 h-8 flex-shrink-0 mt-0.5">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          {sessionUnread > 0 && !isSelected && (
                            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                              {sessionUnread > 9 ? "9+" : sessionUnread}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm truncate ${sessionUnread > 0 && !isSelected ? "font-bold text-foreground" : "font-semibold text-foreground"}`}>
                              {session.patientName || `Patient #${session.patientId}`}
                            </p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${statusColor(session.status)}`}>
                              {session.status}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-xs mt-0.5 truncate">{session.subject}</p>
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground/60">
                              <Clock className="w-3 h-3" />
                              {new Date(session.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                            {sessionUnread > 0 && !isSelected && (
                              <span className="text-[10px] text-red-500 font-semibold">
                                {sessionUnread} unread
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat area */}
      <div
        className={`flex-1 flex flex-col bg-card rounded-2xl border border-border overflow-hidden ${
          !showSessions ? "flex" : "hidden sm:flex"
        }`}
      >
        {!activeSession ? (
          <div className="flex-1 flex items-center justify-center flex-col gap-3 text-center p-8">
            <MessageCircle className="w-14 h-14 text-muted-foreground/20" />
            <h3 className="font-bold text-foreground text-lg">Select a conversation</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Choose a chat session from the queue on the left to start supporting a patient.
            </p>
          </div>
        ) : (
          <>
            {/* Chat header */}
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchMessages(activeSession.id)}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  title="Refresh messages"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                {activeSession.status === "open" && (
                  <button
                    onClick={() => handleResolve(activeSession.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-green-500/10 text-green-600 hover:bg-green-500/20 rounded-lg transition-colors border border-green-500/20"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark Resolved
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
              {messages.map((msg) => {
                const isMe = msg.senderId === user?.id;
                const isBot = msg.isBot;
                const isPatient = !isMe && !isBot && msg.senderId !== null;

                return (
                  <div key={msg.id} className={`flex gap-2 ${isMe ? "justify-end" : "items-end"}`}>
                    {!isMe && (
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${isBot ? "bg-primary/10" : "bg-sky-500/10"}`}>
                        {isBot ? (
                          <Bot className="w-4 h-4 text-primary" />
                        ) : isPatient ? (
                          <User className="w-4 h-4 text-sky-600" />
                        ) : (
                          <UserCheck className="w-4 h-4 text-teal-600" />
                        )}
                      </div>
                    )}
                    <div className="max-w-[75%] space-y-0.5">
                      <p className={`text-[10px] text-muted-foreground/60 ${isMe ? "text-right" : ""}`}>
                        {getSenderLabel(msg)} · {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <div
                        className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isMe
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : isBot
                            ? "bg-muted text-foreground rounded-bl-sm border border-border"
                            : "bg-card text-foreground rounded-bl-sm shadow-sm border border-border"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })}
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                  No messages yet — loading…
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Reply bar */}
            {activeSession.status === "open" ? (
              <div className="border-t border-border p-3 bg-card">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type a reply to the patient…"
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
                <p className="text-[10px] text-muted-foreground/50 mt-1.5 ml-1">
                  Replies go directly to the patient's chat widget. Bot replies are paused while you're typing.
                </p>
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
