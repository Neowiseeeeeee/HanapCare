import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot } from "lucide-react";
import { useAuthOptional } from "@/lib/auth";
import MascotButton from "@/components/MascotButton";

interface Message {
  id: number;
  content: string;
  isBot: boolean;
  createdAt: string;
}

const QUICK_QUESTIONS = [
  "How do I book an appointment?",
  "How do I view my test results?",
  "What services do you offer?",
  "How do I pay my bill?",
  "How do I create an account?",
];

function getOrCreateAnonId(): string {
  const key = "hanapcare_anon_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [followUps, setFollowUps] = useState<string[]>(QUICK_QUESTIONS);
  const [showFollowUps, setShowFollowUps] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const auth = useAuthOptional();
  const user = auth?.user;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [messages, isOpen]);

  const initSession = useCallback(async () => {
    if (initialized) return;
    setInitialized(true);
    const anonymousId = getOrCreateAnonId();
    try {
      const res = await fetch("/api/chat/public/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anonymousId }),
      });
      if (!res.ok) return;
      const session = await res.json();
      setSessionId(session.id);

      // Sync localStorage — if session was found by IP the anonymousId may differ
      const resolvedId: string = session.anonymousId ?? anonymousId;
      if (resolvedId !== anonymousId) {
        localStorage.setItem("hanapcare_anon_id", resolvedId);
      }

      const msgRes = await fetch(`/api/chat/public/sessions/${resolvedId}/messages`);
      if (msgRes.ok) {
        const msgs = await msgRes.json();
        setMessages(msgs);
        if (msgs.length > 1) setShowFollowUps(false);
      }
    } catch {
      // network error — fall back to offline mode silently
    }
  }, [initialized]);

  useEffect(() => {
    if (isOpen && !initialized) {
      initSession();
    }
  }, [isOpen, initialized, initSession]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const anonymousId = getOrCreateAnonId();
    setInput("");
    setShowFollowUps(false);
    setIsTyping(true);

    const optimistic: Message = {
      id: Date.now(),
      content: trimmed,
      isBot: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch(`/api/chat/public/sessions/${anonymousId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });
      if (res.ok) {
        const data = await res.json();
        const newMsgs: Message[] = data.messages ?? [];
        setMessages((prev) => {
          const withoutOptimistic = prev.filter((m) => m.id !== optimistic.id);
          return [...withoutOptimistic, ...newMsgs];
        });
        if (data.followUpSuggestions?.length) {
          setFollowUps(data.followUpSuggestions);
          setShowFollowUps(true);
        }
      }
    } catch {
      // keep optimistic message visible
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <MascotButton onClick={() => setIsOpen(true)} />
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-black/20 flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700"
            style={{ height: "520px" }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-sky-600 to-teal-600 px-4 py-3.5 flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">HanapCare Support</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-white/70 text-xs">Online · Usually replies instantly</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-800/50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2 ${msg.isBot ? "items-end" : "items-end justify-end"}`}>
                  {msg.isBot && (
                    <div className="w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.isBot
                        ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-sm shadow-sm"
                        : "bg-sky-500 text-white rounded-br-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2 items-end">
                  <div className="w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div className="bg-white dark:bg-slate-700 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 bg-slate-400 rounded-full block"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {showFollowUps && messages.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {followUps.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-sky-200 dark:border-sky-700 text-sky-700 dark:text-sky-300 text-xs font-medium rounded-full hover:bg-sky-50 dark:hover:bg-sky-900/40 hover:border-sky-400 transition-colors shadow-sm"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-slate-100 dark:border-slate-700 p-3 bg-white dark:bg-slate-900 flex-shrink-0">
              <form
                onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message…"
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:bg-white dark:focus:bg-slate-700 transition-all"
                  maxLength={500}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="w-10 h-10 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
                  aria-label="Send"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              {user ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-center">
                  Signed in as <span className="font-medium text-slate-500 dark:text-slate-400">{user.fullName}</span>
                </p>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-center">
                  Chatting as guest · <a href="/signup" className="text-sky-500 hover:underline">Create account</a> to save history
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
