import { useState } from "react";
import { MessageSquare, Plus, Search, Clock, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

const TICKETS = [
  { id: "TKT-001", subject: "Appointment booking issue", patient: "Juan Dela Cruz", priority: "High", status: "Open", created: "Jun 16, 2026", updated: "2h ago" },
  { id: "TKT-002", subject: "Cannot access medical records", patient: "Maria Santos", priority: "Medium", status: "In Progress", created: "Jun 15, 2026", updated: "5h ago" },
  { id: "TKT-003", subject: "Billing discrepancy", patient: "Pedro Reyes", priority: "High", status: "Open", created: "Jun 15, 2026", updated: "1d ago" },
  { id: "TKT-004", subject: "Password reset not working", patient: "Ana Lim", priority: "Low", status: "Resolved", created: "Jun 14, 2026", updated: "2d ago" },
  { id: "TKT-005", subject: "Lab results not showing", patient: "Carlos Manalo", priority: "Medium", status: "Resolved", created: "Jun 13, 2026", updated: "3d ago" },
];

const STATUS_CONFIG = {
  Open: { icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
  "In Progress": { icon: Clock, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950" },
  Resolved: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
  Closed: { icon: XCircle, color: "text-muted-foreground", bg: "bg-muted" },
};

const PRIORITY_CONFIG = {
  High: { color: "text-destructive", bg: "bg-destructive/10" },
  Medium: { color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
  Low: { color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950" },
};

const FILTERS = ["All", "Open", "In Progress", "Resolved"] as const;
type Filter = typeof FILTERS[number];

export default function SupportTickets() {
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");

  const filtered = TICKETS.filter((t) => {
    const matchSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || t.patient.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || t.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    Open: TICKETS.filter((t) => t.status === "Open").length,
    "In Progress": TICKETS.filter((t) => t.status === "In Progress").length,
    Resolved: TICKETS.filter((t) => t.status === "Resolved").length,
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Support Tickets</h1>
          <p className="text-muted-foreground text-sm mt-1">Track and resolve patient support requests.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> New Ticket
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {(["Open", "In Progress", "Resolved"] as const).map((s) => {
          const cfg = STATUS_CONFIG[s];
          return (
            <div key={s} className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
              <div className={`w-11 h-11 ${cfg.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <cfg.icon className={`w-5 h-5 ${cfg.color}`} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-foreground">{counts[s]}</p>
                <p className="text-xs text-muted-foreground">{s}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by ticket ID, subject, or patient…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-input rounded-xl text-sm bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                filter === f ? "bg-primary/10 text-primary border border-primary/30" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {filtered.length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-7 h-7 text-muted-foreground/40" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">No tickets found</h3>
              <p className="text-muted-foreground text-sm">Try adjusting your search or filter.</p>
            </div>
          ) : (
            filtered.map((ticket) => {
              const statusCfg = STATUS_CONFIG[ticket.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.Open;
              const priorityCfg = PRIORITY_CONFIG[ticket.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.Low;
              return (
                <div key={ticket.id} className="flex items-start gap-4 px-6 py-4 hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">{ticket.id}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityCfg.bg} ${priorityCfg.color}`}>{ticket.priority}</span>
                        </div>
                        <p className="font-semibold text-foreground text-sm mt-0.5">{ticket.subject}</p>
                        <p className="text-xs text-muted-foreground">Patient: {ticket.patient} · Updated {ticket.updated}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${statusCfg.bg} ${statusCfg.color}`}>
                        <statusCfg.icon className="w-3 h-3" /> {ticket.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
