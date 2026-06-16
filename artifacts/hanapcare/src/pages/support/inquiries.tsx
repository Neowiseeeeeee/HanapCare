import { useState } from "react";
import { HelpCircle, Search, Clock, CheckCircle2, MessageCircle, Phone, Mail, X, Send, ChevronRight } from "lucide-react";

const INQUIRIES = [
  {
    id: "INQ-001",
    name: "Lucia Bautista",
    channel: "Chat",
    subject: "How do I book an appointment online?",
    time: "10 mins ago",
    status: "Active",
    messages: [
      { from: "patient", text: "Hi, how do I book an appointment online?", time: "10 mins ago" },
      { from: "agent", text: "Hello Lucia! You can book an appointment by visiting the Patient Portal and clicking 'Book Appointment'.", time: "9 mins ago" },
      { from: "patient", text: "Do I need to create an account first?", time: "8 mins ago" },
      { from: "agent", text: "Yes, you'll need to register with your valid ID. It only takes a few minutes!", time: "7 mins ago" },
    ],
  },
  {
    id: "INQ-002",
    name: "Ramon Torres",
    channel: "Phone",
    subject: "Asking about lab result turnaround time",
    time: "32 mins ago",
    status: "Active",
    messages: [
      { from: "patient", text: "When will my lab results be ready?", time: "32 mins ago" },
      { from: "agent", text: "Standard lab results are typically ready within 24 hours. Which test did you have done?", time: "30 mins ago" },
      { from: "patient", text: "Complete blood count and urinalysis.", time: "28 mins ago" },
      { from: "agent", text: "Those results should be available by tomorrow morning. We'll send you a notification.", time: "26 mins ago" },
    ],
  },
  {
    id: "INQ-003",
    name: "Grace Villanueva",
    channel: "Email",
    subject: "Request for medical certificate",
    time: "1h ago",
    status: "Resolved",
    messages: [
      { from: "patient", text: "Good afternoon! I need a medical certificate for work purposes.", time: "1h ago" },
      { from: "agent", text: "Hello Grace! You can request a medical certificate at the records section. Please bring a valid ID.", time: "55 mins ago" },
      { from: "patient", text: "Do I need to pay for it?", time: "50 mins ago" },
      { from: "agent", text: "There is a minimal fee of ₱150. It will be ready within 2 business days.", time: "45 mins ago" },
      { from: "patient", text: "Perfect, thank you!", time: "44 mins ago" },
    ],
  },
  {
    id: "INQ-004",
    name: "Andres Flores",
    channel: "Chat",
    subject: "Cannot log in to patient portal",
    time: "2h ago",
    status: "Resolved",
    messages: [
      { from: "patient", text: "I can't log in to the patient portal. It says my password is incorrect.", time: "2h ago" },
      { from: "agent", text: "I'm sorry to hear that, Andres. Please try resetting your password using the 'Forgot Password' link.", time: "1h 58m ago" },
      { from: "patient", text: "I didn't receive the reset email.", time: "1h 55m ago" },
      { from: "agent", text: "Please check your spam folder. If not there, I can update your email address on file.", time: "1h 53m ago" },
      { from: "patient", text: "Found it in spam! Issue resolved. Thank you.", time: "1h 50m ago" },
    ],
  },
  {
    id: "INQ-005",
    name: "Patricia Navarro",
    channel: "Email",
    subject: "Billing statement clarification",
    time: "3h ago",
    status: "Resolved",
    messages: [
      { from: "patient", text: "Hello, I have a question about a charge on my billing statement.", time: "3h ago" },
      { from: "agent", text: "Hi Patricia! I'd be happy to help clarify your bill. Which charge are you referring to?", time: "2h 55m ago" },
      { from: "patient", text: "There's a ₱2,500 charge labeled 'Ancillary Fees' that I don't understand.", time: "2h 50m ago" },
      { from: "agent", text: "That covers your use of the treatment room and nursing assistance during your visit.", time: "2h 45m ago" },
      { from: "patient", text: "Oh I see, that makes sense. Thank you for explaining!", time: "2h 43m ago" },
    ],
  },
];

const CHANNEL_CONFIG = {
  Chat: { icon: MessageCircle, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950" },
  Phone: { icon: Phone, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950" },
  Email: { icon: Mail, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
};

const FILTERS = ["All", "Active", "Resolved"] as const;
type Filter = typeof FILTERS[number];
type Inquiry = typeof INQUIRIES[number];

export default function PatientInquiries() {
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [reply, setReply] = useState("");

  const filtered = INQUIRIES.filter((i) => {
    const matchSearch =
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.subject.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || i.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="flex gap-6 h-full">
      {/* Main list */}
      <div className={`flex-1 min-w-0 space-y-6 pb-10 transition-all duration-300 ${selected ? "max-w-[55%]" : ""}`}>
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
              const isSelected = selected?.id === inq.id;
              return (
                <div
                  key={inq.id}
                  onClick={() => setSelected(isSelected ? null : inq)}
                  className={`bg-card rounded-2xl border p-5 flex items-start gap-4 hover:shadow-md transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/20"
                      : isActive
                      ? "border-primary/30"
                      : "border-border"
                  }`}
                >
                  <div className={`w-10 h-10 ${channelCfg.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <channelCfg.icon className={`w-5 h-5 ${channelCfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground text-sm">{inq.name}</p>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${channelCfg.bg} ${channelCfg.color}`}>
                            {inq.channel}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5 truncate">{inq.subject}</p>
                      </div>
                      <div className="text-right flex-shrink-0 flex items-center gap-2">
                        <div>
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
                        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isSelected ? "rotate-90" : ""}`} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Conversation panel */}
      {selected && (
        <div className="w-[420px] flex-shrink-0 bg-card border border-border rounded-2xl flex flex-col overflow-hidden h-[calc(100vh-120px)] sticky top-6">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-3 min-w-0">
              {(() => {
                const cfg = CHANNEL_CONFIG[selected.channel as keyof typeof CHANNEL_CONFIG] ?? CHANNEL_CONFIG.Chat;
                return (
                  <div className={`w-9 h-9 ${cfg.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                );
              })()}
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">{selected.name}</p>
                <p className="text-xs text-muted-foreground truncate">{selected.subject}</p>
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Status badge */}
          <div className="px-5 py-2.5 border-b border-border flex items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              selected.status === "Active"
                ? "bg-amber-50 dark:bg-amber-950 text-amber-600"
                : "bg-emerald-50 dark:bg-emerald-950 text-emerald-600"
            }`}>
              {selected.status === "Active" ? "● Active" : "✓ Resolved"}
            </span>
            <span className="text-xs text-muted-foreground">{selected.id}</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {selected.messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.from === "agent" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  msg.from === "agent"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                }`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.from === "agent" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Reply box */}
          <div className="px-5 py-4 border-t border-border">
            {selected.status === "Active" ? (
              <div className="flex gap-2 items-end">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type a reply…"
                  rows={2}
                  className="flex-1 resize-none rounded-xl border border-input bg-background text-sm px-3.5 py-2.5 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button
                  onClick={() => setReply("")}
                  disabled={!reply.trim()}
                  className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <p className="text-center text-xs text-muted-foreground py-1">This inquiry has been resolved.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
