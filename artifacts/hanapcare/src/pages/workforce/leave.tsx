import { useState } from "react";
import { CalendarOff, Plus, CheckCircle2, XCircle, Clock, Search } from "lucide-react";

const REQUESTS = [
  { name: "Dr. Jose Rizal", role: "Doctor", type: "Sick Leave", from: "Jun 18, 2026", to: "Jun 19, 2026", days: 2, reason: "Medical appointment", status: "Pending" },
  { name: "Nurse Maria Santos", role: "Nurse", type: "Annual Leave", from: "Jul 1, 2026", to: "Jul 5, 2026", days: 5, reason: "Family vacation", status: "Approved" },
  { name: "Ana Reyes", role: "Receptionist", type: "Emergency Leave", from: "Jun 16, 2026", to: "Jun 16, 2026", days: 1, reason: "Family emergency", status: "Approved" },
  { name: "Juan dela Cruz", role: "Pharmacist", type: "Annual Leave", from: "Jun 20, 2026", to: "Jun 25, 2026", days: 6, reason: "Planned vacation", status: "Pending" },
  { name: "Lab Staff User", role: "Lab Staff", type: "Maternity/Paternity", from: "Jul 10, 2026", to: "Aug 10, 2026", days: 30, reason: "Parental leave", status: "Pending" },
  { name: "Cashier User", role: "Cashier", type: "Sick Leave", from: "Jun 10, 2026", to: "Jun 11, 2026", days: 2, reason: "Flu recovery", status: "Denied" },
];

const STATUS_CONFIG = {
  Approved: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
  Pending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
  Denied: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
};

const FILTERS = ["All", "Pending", "Approved", "Denied"] as const;
type Filter = typeof FILTERS[number];

export default function LeaveRequests() {
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");

  const filtered = REQUESTS.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || r.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Leave Requests</h1>
          <p className="text-muted-foreground text-sm mt-1">Review and approve staff leave requests.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> New Request
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {(["Pending", "Approved", "Denied"] as const).map((s) => {
          const cfg = STATUS_CONFIG[s];
          const count = REQUESTS.filter((r) => r.status === s).length;
          return (
            <div key={s} className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
              <div className={`w-11 h-11 ${cfg.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <cfg.icon className={`w-5 h-5 ${cfg.color}`} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-foreground">{count}</p>
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
            placeholder="Search by employee name…"
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
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                filter === f ? "bg-primary/10 text-primary border border-primary/30" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-10 text-center">
            <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CalendarOff className="w-7 h-7 text-muted-foreground/40" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">No leave requests found</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">Try adjusting your search or filter.</p>
          </div>
        ) : (
          filtered.map((r) => {
            const cfg = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG];
            return (
              <div key={`${r.name}-${r.from}`} className="bg-card rounded-2xl border border-border p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-teal-500 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {r.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-semibold text-foreground text-sm">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.role} · {r.type}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                      <cfg.icon className="w-3 h-3" /> {r.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{r.from} – {r.to}</span>
                    <span className="font-semibold text-foreground">{r.days} day{r.days !== 1 ? "s" : ""}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 italic">"{r.reason}"</p>
                  {r.status === "Pending" && (
                    <div className="flex gap-2 mt-3">
                      <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors">Approve</button>
                      <button className="px-3 py-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-semibold rounded-lg transition-colors">Deny</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
