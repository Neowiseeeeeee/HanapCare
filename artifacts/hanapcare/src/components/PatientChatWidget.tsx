import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, Loader2, Sparkles, UserCheck, MessageCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import MascotButton from "@/components/MascotButton";

interface ChatMessage {
  id: number;
  sessionId: number;
  senderId: number | null;
  content: string;
  isBot: boolean;
  createdAt: string;
}

interface ChatSession {
  id: number;
  status: string;
}

const QUICK_QUESTIONS = [
  "How do I book an appointment?",
  "Do you accept PhilHealth?",
  "When are you open?",
  "How do I view my lab results?",
];

export default function PatientChatWidget() {
  const { user, token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isPatient = user?.role === "Patient";

  const initSession = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/chat/sessions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const sessions: ChatSession[] = await res.json();
        const open = sessions.find((s) => s.status === "open");
        if (open) {
          setSession(open);
          const msgRes = await fetch(`/api/chat/sessions/${open.id}/messages`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (msgRes.ok) setMessages(await msgRes.json());
          return;
        }
      }
      const createRes = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject: "General Inquiry" }),
      });
      if (createRes.ok) {
        const newSession = await createRes.json();
        setSession(newSession);
        const msgRes = await fetch(`/api/chat/sessions/${newSession.id}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (msgRes.ok) setMessages(await msgRes.json());
      }
    } finally {
      setLoading(false);
    }
  };

  const pollMessages = async (sessionId: number) => {
    if (!token) return;
    const res = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const latest: ChatMessage[] = await res.json();
      setMessages((prev) => {
        if (latest.length !== prev.length) {
          const newMsgs = latest.slice(prev.length);
          if (!isOpen) {
            const agentMsgs = newMsgs.filter((m) => !m.isBot && m.senderId !== user?.id);
            if (agentMsgs.length > 0) setUnread((n) => n + agentMsgs.length);
          }
          return latest;
        }
        return prev;
      });
    }
  };

  useEffect(() => {
    if (session && isOpen) {
      pollRef.current = setInterval(() => pollMessages(session.id), 5000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [session, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setUnread(0);
    if (!session) initSession();
    setTimeout(() => inputRef.current?.focus(), 200);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !session || !token || sending) return;
    setSending(true);
    setInput("");
    setFollowUps([]);
    try {
      const res = await fetch(`/api/chat/sessions/${session.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (res.ok) {
        const data: { messages: ChatMessage[]; followUpSuggestions?: string[] } = await res.json();
        setMessages((prev) => [...prev, ...data.messages]);
        if (data.followUpSuggestions?.length) {
          setFollowUps(data.followUpSuggestions);
        }
      }
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user || !isPatient) return null;

  const hasAgentReplied = messages.some((m) => !m.isBot && m.senderId !== user.id);

  return (
    <>
      {!isOpen && (
        <MascotButton onClick={handleOpen} unread={unread} />
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed bottom-6 right-6 w-[390px] max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col z-50 overflow-hidden"
            style={{ height: "520px" }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-sky-500 to-teal-500 px-4 py-3.5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-sky-500" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm leading-none">HanapCare Support</p>
                  <p className="text-white/80 text-xs mt-0.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {hasAgentReplied ? "Live Agent Active" : "AI + Live Agents"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-800/50">
              {loading && (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                </div>
              )}
              {!loading && messages.length === 0 && !session && (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3 px-4">
                  <div className="w-14 h-14 bg-sky-100 dark:bg-sky-900 rounded-2xl flex items-center justify-center">
                    <MessageCircle className="w-7 h-7 text-sky-500" />
                  </div>
                  <p className="font-semibold text-slate-700 dark:text-slate-200">How can we help?</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Ask anything about appointments, billing, lab results, or any HanapCare service.
                  </p>
                </div>
              )}
              {!loading &&
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${msg.senderId === user.id ? "justify-end" : "items-end"}`}
                  >
                    {msg.senderId !== user.id && (
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-auto ${
                          msg.isBot
                            ? "bg-sky-100 dark:bg-sky-900"
                            : "bg-teal-100 dark:bg-teal-900"
                        }`}
                      >
                        {msg.isBot ? (
                          <Bot className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        )}
                      </div>
                    )}
                    <div className="max-w-[76%] space-y-1">
                      {!msg.isBot && msg.senderId !== user.id && (
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">Support Agent</p>
                      )}
                      <div
                        className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                          msg.senderId === user.id
                            ? "bg-sky-500 text-white rounded-br-sm"
                            : "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-sm shadow-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <p className={`text-[10px] text-slate-400 dark:text-slate-500 ${msg.senderId === user.id ? "text-right mr-1" : "ml-1"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              <div ref={bottomRef} />
            </div>

            {/* Follow-up suggestions */}
            <AnimatePresence>
              {followUps.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-3 pt-2 pb-1 flex flex-wrap gap-1.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700"
                >
                  <p className="w-full text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide">
                    You might also want to ask:
                  </p>
                  {followUps.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-xs px-2.5 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-full hover:border-sky-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick questions (only early in conversation) */}
            {!loading && messages.length > 0 && messages.length < 3 && followUps.length === 0 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5 bg-slate-50 dark:bg-slate-800/50">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-2.5 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-full hover:border-sky-400 hover:text-sky-600 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="border-t border-slate-100 dark:border-slate-700 p-3 bg-white dark:bg-slate-900 flex-shrink-0">
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={session ? "Type a message…" : "Starting chat…"}
                  className="flex-1 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:bg-white dark:focus:bg-slate-700 transition-all"
                  maxLength={500}
                  disabled={!session || sending}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending || !session}
                  className="w-10 h-10 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
                  aria-label="Send"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
