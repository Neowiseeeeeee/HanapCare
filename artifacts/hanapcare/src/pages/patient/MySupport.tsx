import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LifeBuoy, Plus, X, Send, Loader2, CheckCircle2, AlertCircle, Clock, XCircle,
  User, ChevronRight, MessageSquare,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTicketsUnread } from "@/hooks/useTicketsUnread";

interface Ticket {
  id: number;
  subject: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Reply {
  id: number;
  content: string;
  isStaff: number;
  createdAt: string;
  senderName?: string;
}

interface TicketDetail extends Ticket { replies: Reply[]; }

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  open: { icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/40", label: "Open" },
  in_progress: { icon: Clock, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950/40", label: "In Progress" },
  resolved: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40", label: "Resolved" },
  closed: { icon: XCircle, color: "text-muted-foreground", bg: "bg-muted", label: "Closed" },
};

const PRIORITY_LABELS: Record<string, string> = { high: "High Priority", medium: "Medium", low: "Low" };

export default function MySupport() {
  const { token } = useAuth();
  const { refresh: refreshBadge } = useTicketsUnread();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TicketDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [newSubject, setNewSubject] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [creating, setCreating] = useState(false);

  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const fetchTickets = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/tickets", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setTickets(await res.json());
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const openTicket = async (id: number) => {
    if (!token) return;
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/tickets/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setSelected(await res.json());
    } finally {
      setDetailLoading(false);
    }
  };

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newDesc.trim() || !token) return;
    setCreating(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject: newSubject.trim(), description: newDesc.trim(), priority: newPriority }),
      });
      if (res.ok) {
        setNewSubject(""); setNewDesc(""); setNewPriority("medium");
        setShowNew(false);
        await fetchTickets();
        refreshBadge();
      }
    } finally {
      setCreating(false);
    }
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !selected || !token) return;
    setSending(true);
    try {
      const res = await fetch(`/api/tickets/${selected.id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: reply.trim() }),
      });
      if (res.ok) {
        setReply("");
        await openTicket(selected.id);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 pb-10 max-w-3xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-primary" /> My Support Tickets
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Submit and track support requests with our HanapCare team.
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> New Ticket
        </button>
      </div>

      {/* New ticket modal */}
      <AnimatePresence>
        {showNew && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowNew(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 12 }}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-foreground text-lg">New Support Ticket</h2>
                <button onClick={() => setShowNew(false)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={createTicket} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Subject</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Briefly describe your issue…"
                    className="w-full px-4 py-2.5 border border-input rounded-xl text-sm bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    maxLength={120}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Description</label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Provide more details about your concern…"
                    className="w-full px-4 py-2.5 border border-input rounded-xl text-sm bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                    rows={4}
                    maxLength={2000}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Priority</label>
                  <div className="flex gap-2">
                    {["low", "medium", "high"].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewPriority(p)}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors border ${
                          newPriority === p
                            ? "bg-primary/10 text-primary border-primary/40"
                            : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                        }`}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={creating || !newSubject.trim() || !newDesc.trim()}
                  className="w-full py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : "Submit Ticket"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ticket list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/30" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <LifeBuoy className="w-14 h-14 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="font-bold text-foreground text-lg mb-2">No tickets yet</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Having an issue with HanapCare? Submit a support ticket and our team will help you.
          </p>
          <button
            onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Create your first ticket
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const cfg = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open;
            const isSelected = selected?.id === ticket.id;
            return (
              <button
                key={ticket.id}
                onClick={() => openTicket(ticket.id)}
                className={`w-full text-left bg-card border rounded-2xl p-4 hover:shadow-md transition-all ${
                  isSelected ? "border-primary/40 shadow-md" : "border-border"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 ${cfg.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <cfg.icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="font-semibold text-foreground text-sm truncate">{ticket.subject}</p>
                      <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{ticket.description}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] font-mono text-muted-foreground/60">#{String(ticket.id).padStart(4, "0")}</span>
                      <span className="text-[10px] text-muted-foreground/60">{PRIORITY_LABELS[ticket.priority]}</span>
                      <span className="text-[10px] text-muted-foreground/60">Updated {new Date(ticket.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 mt-1" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Ticket detail panel */}
      <AnimatePresence>
        {(selected || detailLoading) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg flex flex-col shadow-2xl"
              style={{ maxHeight: "90vh" }}
            >
              {detailLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/30" />
                </div>
              ) : selected ? (
                <>
                  <div className="px-5 py-4 border-b border-border flex items-start gap-3 flex-shrink-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground text-sm">{selected.subject}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[10px] font-mono text-muted-foreground/60">#{String(selected.id).padStart(4, "0")}</span>
                        {(() => { const cfg = STATUS_CONFIG[selected.status] ?? STATUS_CONFIG.open; return (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                        ); })()}
                      </div>
                    </div>
                    <button onClick={() => setSelected(null)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="px-5 py-3 border-b border-border bg-muted/20 flex-shrink-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Your Issue</p>
                    <p className="text-sm text-foreground leading-relaxed">{selected.description}</p>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                    {selected.replies.length === 0 ? (
                      <div className="flex items-center justify-center h-20 text-muted-foreground text-sm text-center">
                        <div>
                          <MessageSquare className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                          Our team will respond here shortly.
                        </div>
                      </div>
                    ) : (
                      selected.replies.map((r) => (
                        <div key={r.id} className={`flex gap-2.5 ${r.isStaff ? "justify-end" : "items-end"}`}>
                          {!r.isStaff && (
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <User className="w-3.5 h-3.5 text-primary" />
                            </div>
                          )}
                          <div className="max-w-[80%] space-y-0.5">
                            <p className={`text-[10px] text-muted-foreground/60 ${r.isStaff ? "text-right" : ""}`}>
                              {r.isStaff ? "HanapCare Support" : "You"} · {new Date(r.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                            <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              r.isStaff
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-muted text-foreground rounded-bl-sm"
                            }`}>
                              {r.content}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {selected.status !== "closed" && selected.status !== "resolved" ? (
                    <div className="border-t border-border p-3 flex-shrink-0">
                      <form onSubmit={sendReply} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          placeholder="Add a message or update…"
                          className="flex-1 px-4 py-2.5 bg-muted rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-background transition-all dark:text-foreground"
                          maxLength={2000}
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
                    <div className="border-t border-border p-4 text-center flex-shrink-0 bg-muted/20">
                      <p className="text-muted-foreground text-sm">
                        This ticket is {selected.status}. <button onClick={() => setShowNew(true)} className="text-primary underline">Open a new ticket</button> if you need further help.
                      </p>
                    </div>
                  )}
                </>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
