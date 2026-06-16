import { useState } from "react";
import { HelpCircle, Search, Clock, CheckCircle2, MessageCircle, Phone, Mail } from "lucide-react";

const INQUIRIES = [
  { id: "INQ-001", name: "Lucia Bautista", channel: "Chat", subject: "How do I book an appointment online?", time: "10 mins ago", status: "Active" },
  { id: "INQ-002", name: "Ramon Torres", channel: "Phone", subject: "Asking about lab result turnaround time", time: "32 mins ago", status: "Active" },
  { id: "INQ-003", name: "Grace Villanueva", channel: "Email", subject: "Request for medical certificate", time: "1h ago", status: "Resolved" },
  { id: "INQ-004", name: "Andres Flores", channel: "Chat", subject: "Cannot log in to patient portal", time: "2h ago", status: "Resolved" },
  { id: "INQ-005", name: "Patricia Navarro", channel: "Email", subject: "Billing statement clarification", time: "3h ago", status: "Resolved" },
];

const CHANNEL_CONFIG = {
  Chat: { icon: MessageCircle, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950" },
  Phone: { icon: Phone, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950" },
  Email: { icon: Mail, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
};

const FILTERS = ["All", "Active", "Resolved"] as const;
type Filter = typeof FILTERS[number];

export default function PatientInquiries() {
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");

  const filtered = INQUIRIES.filter((i) => {
    const matchSearch =
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.subject.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || i.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Patient Inquiries</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage incoming patient questions across all channels.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Active Inquiries", value: String(INQUIRIES.filter((i) => i.status === "Active").length), icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
          { label: "Resolved Today", value: String(INQUIRIES.filter((i) => i.status === "Resolved").length), icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
          { label: "Total Today", value: String(INQUIRIES.length), icon: HelpCircle, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
            <div className={`w-11 h-11 ${stat.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by patient name or subject…"
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
                filter === f
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
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
              <HelpCircle className="w-7 h-7 text-muted-foreground/40" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">No inquiries found</h3>
            <p className="text-muted-foreground text-sm">All patient inquiries will appear here as they come in.</p>
          </div>
        ) : (
          filtered.map((inq) => {
            const channelCfg = CHANNEL_CONFIG[inq.channel as keyof typeof CHANNEL_CONFIG] ?? CHANNEL_CONFIG.Chat;
            const isActive = inq.status === "Active";
            return (
              <div
                key={inq.id}
                className={`bg-card rounded-2xl border p-5 flex items-start gap-4 hover:shadow-md transition-all cursor-pointer ${isActive ? "border-primary/30" : "border-border"}`}
              >
                <div className={`w-10 h-10 ${channelCfg.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <channelCfg.icon className={`w-5 h-5 ${channelCfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground text-sm">{inq.name}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${channelCfg.bg} ${channelCfg.color}`}>
                          {inq.channel}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{inq.subject}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-muted-foreground">{inq.time}</p>
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Resolved
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
