import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Plus, Search, Clock, CheckCircle2, AlertCircle, XCircle,
  Loader2, X, ChevronRight, User, Send, RefreshCw,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTicketsUnread } from "@/hooks/useTicketsUnread";

interface Ticket {
  id: number;
  subject: string;
  description: string;
  priority: string;
  status: string;
  patientId: number;
  patientName?: string;
  assignedToId?: number;
  createdAt: string;
  updatedAt: string;
}

interface Reply {
  id: number;
  ticketId: number;
  senderId: number;
  content: string;
  isStaff: number;
  createdAt: string;
  senderName?: string;
}

interface TicketDetail extends Ticket { replies: Reply[]; }

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  open: { icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/40" },
  in_progress: { icon: Clock, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950/40" },
  resolved: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  closed: { icon: XCircle, color: "text-muted-foreground", bg: "bg-muted" },
};

const PRIORITY_CONFIG: Record<string, { color: string; bg: string }> = {
  high: { color: "text-destructive", bg: "bg-destructive/10" },
  medium: { color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/40" },
  low: { color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950/40" },
};

const STATUS_OPTIONS = ["open", "in_progress", "resolved", "closed"];
const PRIORITY_OPTIONS = ["low", "medium", "high"];

export default function SupportTickets() {
  const { token, user } = useAuth();
  const { refresh: refreshBadge } = useTicketsUnread();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<TicketDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
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
        fetchTickets();
      }
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (ticketId: number, status: string) => {
    if (!token) return;
    await fetch(`/api/tickets/${ticketId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status, assignedToId: user?.id }),
    });
    fetchTickets();
    refreshBadge();
    if (selected?.id === ticketId) await openTicket(ticketId);
  };

  const filtered = tickets.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch =
      t.subject.toLowerCase().includes(q) ||
      (t.patientName ?? "").toLowerCase().includes(q) ||
      String(t.id).includes(q);
    const matchFilter = filter === "all" || t.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  };

  const labelStatus = (s: string) =>
    s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="flex gap-5 h-[calc(100vh-8.5rem)]">
      {/* Left: ticket list */}
      <div className={`flex flex-col ${selected ? "hidden lg:flex" : "flex"} w-full lg:w-auto lg:min-w-[340px] lg:max-w-[420px]`}>
        <div className="space-y-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">Support Tickets</h1>
              <p className="text-muted-foreground text-sm mt-0.5">Track and resolve patient support requests.</p>
            </div>
            <button
              onClick={fetchTickets}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(["open", "in_progress", "resolved"] as const).map((s) => {
              const cfg = STATUS_CONFIG[s];
              return (
                <div key={s} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
                  <div className={`w-9 h-9 ${cfg.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <cfg.icon className={`w-4.5 h-4.5 ${cfg.color}`} />
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-foreground">{counts[s]}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{labelStatus(s)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tickets…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-input rounded-xl text-sm bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {["all", "open", "in_progress", "resolved", "closed"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  filter === f ? "bg-primary/10 text-primary border border-primary/30" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {labelStatus(f)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-card rounded-2xl border border-border">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/30" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">No tickets found</h3>
              <p className="text-muted-foreground text-sm">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((ticket) => {
                const statusCfg = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open;
                const priorityCfg = PRIORITY_CONFIG[ticket.priority] ?? PRIORITY_CONFIG.medium;
                const isSelected = selected?.id === ticket.id;
                return (
                  <button
                    key={ticket.id}
                    onClick={() => openTicket(ticket.id)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-4 hover:bg-muted/30 transition-colors ${isSelected ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
                  >
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MessageSquare className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-[10px] font-mono text-muted-foreground">#{String(ticket.id).padStart(4, "0")}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${priorityCfg.bg} ${priorityCfg.color}`}>
                          {ticket.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="font-semibold text-foreground text-sm truncate">{ticket.subject}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {ticket.patientName ?? "Patient"} · {new Date(ticket.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.color}`}>
                        <statusCfg.icon className="w-3 h-3" />
                        {labelStatus(ticket.status)}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right: ticket detail */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            className="flex-1 flex flex-col bg-card rounded-2xl border border-border overflow-hidden min-w-0"
          >
            {detailLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground/30" />
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="px-5 py-4 border-b border-border flex items-start gap-3 flex-shrink-0">
                  <button
                    onClick={() => setSelected(null)}
                    className="p-1.5 mt-0.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors flex-shrink-0 lg:hidden"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-sm">{selected.subject}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {selected.patientName ?? "Patient"} · #{String(selected.id).padStart(4, "0")} · {new Date(selected.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      value={selected.priority}
                      onChange={(e) => {
                        const newPriority = e.target.value;
                        fetch(`/api/tickets/${selected.id}/status`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                          body: JSON.stringify({ priority: newPriority }),
                        }).then(() => {
                          setSelected((prev) => prev ? { ...prev, priority: newPriority } : prev);
                          fetchTickets();
                        });
                      }}
                      className="text-xs border border-input bg-background rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                    >
                      {PRIORITY_OPTIONS.map((p) => (
                        <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                      ))}
                    </select>
                    <select
                      value={selected.status}
                      onChange={(e) => updateStatus(selected.id, e.target.value)}
                      className="text-xs border border-input bg-background rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{labelStatus(s)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="px-5 py-4 border-b border-border bg-muted/20 flex-shrink-0">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Issue Description</p>
                  <p className="text-sm text-foreground leading-relaxed">{selected.description}</p>
                </div>

                {/* Replies */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {selected.replies.length === 0 ? (
                    <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
                      No replies yet — add the first response below.
                    </div>
                  ) : (
                    selected.replies.map((r) => (
                      <div key={r.id} className={`flex gap-2.5 ${r.isStaff ? "justify-end" : "items-end"}`}>
                        {!r.isStaff && (
                          <div className="w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center flex-shrink-0">
                            <User className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                          </div>
                        )}
                        <div className="max-w-[78%] space-y-0.5">
                          <p className={`text-[10px] text-muted-foreground/60 ${r.isStaff ? "text-right" : ""}`}>
                            {r.isStaff ? "Support Agent" : (r.senderName ?? "Patient")} · {new Date(r.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            r.isStaff
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-background text-foreground rounded-bl-sm shadow-sm border border-border"
                          }`}>
                            {r.content}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Reply input */}
                {selected.status !== "closed" ? (
                  <div className="border-t border-border p-3 flex-shrink-0">
                    <form onSubmit={sendReply} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Reply to this ticket…"
                        className="flex-1 px-4 py-2.5 bg-muted rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-background transition-all"
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
                  <div className="border-t border-border p-4 text-center flex-shrink-0">
                    <p className="text-muted-foreground text-sm">This ticket is closed.</p>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state for detail panel on desktop */}
      {!selected && (
        <div className="hidden lg:flex flex-1 items-center justify-center flex-col gap-3 bg-card rounded-2xl border border-border text-center p-8">
          <MessageSquare className="w-14 h-14 text-muted-foreground/20" />
          <h3 className="font-bold text-foreground text-lg">Select a ticket</h3>
          <p className="text-muted-foreground text-sm max-w-xs">Click any ticket from the list to view its details and respond.</p>
        </div>
      )}
    </div>
  );
}
