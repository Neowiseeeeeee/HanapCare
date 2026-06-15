import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Send, User, Clock, CheckCheck, Circle,
  LogOut, Menu, X, Inbox, ArrowLeft, Bot, Loader2, Bell,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { HanapCareLogoIcon } from "@/components/public/HanapCareLogo";

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
  const { user, token, logout } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSessions, setShowSessions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const firstName = user?.fullName?.split(" ")[0] ?? "Agent";

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
    status === "open" ? "text-green-400 bg-green-400/10" :
    status === "resolved" ? "text-slate-400 bg-slate-400/10" :
    "text-amber-400 bg-amber-400/10";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <HanapCareLogoIcon size={32} />
            <span className="font-bold text-lg text-slate-900 hidden sm:block">
              Hanap<span className="text-sky-500">Care</span>
              <span className="ml-2 text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full font-semibold">
                Support
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                isOnline
                  ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                  : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
              }`}
            >
              <Circle className={`w-2 h-2 fill-current ${isOnline ? "text-green-500" : "text-slate-400"}`} />
              {isOnline ? "Online" : "Offline"}
            </button>

            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-sky-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user?.fullName?.[0]?.toUpperCase() ?? "S"}
              </div>
              <div className="text-sm">
                <p className="font-semibold text-slate-900 leading-none">{user?.fullName}</p>
                <p className="text-xs text-slate-400 mt-0.5">Support Agent</p>
              </div>
            </div>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button
              onClick={logout}
              className="hidden sm:flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6">
        <div className="flex gap-5 h-[calc(100vh-140px)]">
          {/* Sessions panel */}
          <AnimatePresence mode="wait">
            {(showSessions || typeof window !== "undefined" && window.innerWidth >= 640) && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`${showSessions ? "flex" : "hidden sm:flex"} flex-col w-full sm:w-72 bg-white rounded-2xl border border-slate-200 overflow-hidden`}
              >
                <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="font-bold text-slate-900 flex items-center gap-2">
                    <Inbox className="w-5 h-5 text-sky-500" />
                    Chat Queue
                    {sessions.filter((s) => s.status === "open").length > 0 && (
                      <span className="text-xs bg-sky-500 text-white rounded-full px-2 py-0.5 font-bold">
                        {sessions.filter((s) => s.status === "open").length}
                      </span>
                    )}
                  </h2>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="py-12 text-center">
                      <MessageCircle className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm">No chat sessions yet.</p>
                    </div>
                  ) : (
                    sessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => openSession(session)}
                        className={`w-full text-left px-4 py-3.5 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors ${
                          activeSession?.id === session.id ? "bg-sky-50" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-sky-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-semibold text-slate-900 text-sm truncate">
                                {session.patientName || `Patient #${session.patientId}`}
                              </p>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${statusColor(session.status)}`}>
                                {session.status}
                              </span>
                            </div>
                            <p className="text-slate-400 text-xs mt-0.5 truncate">{session.subject}</p>
                            <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
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
          <div className={`flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden ${!showSessions ? "flex" : "hidden sm:flex"}`}>
            {!activeSession ? (
              <div className="flex-1 flex items-center justify-center flex-col gap-3 text-center p-8">
                <MessageCircle className="w-14 h-14 text-slate-200" />
                <h3 className="font-bold text-slate-700 text-lg">Select a conversation</h3>
                <p className="text-slate-400 text-sm max-w-xs">
                  Choose a chat session from the queue to start supporting a patient.
                </p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-3">
                  <button
                    onClick={() => { setShowSessions(true); setActiveSession(null); }}
                    className="sm:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-9 h-9 bg-sky-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-sky-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 text-sm">
                      {activeSession.patientName || `Patient #${activeSession.patientId}`}
                    </p>
                    <p className="text-slate-400 text-xs">{activeSession.subject}</p>
                  </div>
                  {activeSession.status === "open" && (
                    <button
                      onClick={() => handleResolve(activeSession.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Mark Resolved
                    </button>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${msg.senderId === user?.id ? "justify-end" : "items-end"}`}
                    >
                      {msg.senderId !== user?.id && (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-sky-100">
                          {msg.isBot ? (
                            <Bot className="w-4 h-4 text-sky-600" />
                          ) : (
                            <User className="w-4 h-4 text-sky-600" />
                          )}
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          msg.senderId === user?.id
                            ? "bg-sky-500 text-white rounded-br-sm"
                            : "bg-white text-slate-800 rounded-bl-sm shadow-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                {/* Reply input */}
                {activeSession.status === "open" ? (
                  <div className="border-t border-slate-100 p-3 bg-white">
                    <form onSubmit={handleSend} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Type a reply…"
                        className="flex-1 px-4 py-2.5 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:bg-white transition-all"
                        maxLength={1000}
                      />
                      <button
                        type="submit"
                        disabled={!reply.trim() || sending}
                        className="w-10 h-10 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors"
                      >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="border-t border-slate-100 p-4 bg-slate-50 text-center">
                    <p className="text-slate-400 text-sm">This conversation is resolved.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
