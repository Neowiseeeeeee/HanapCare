import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  HelpCircle, Search, Clock, CheckCircle2, MessageCircle, X, Send, Bot,
  UserCheck, Loader2, RefreshCw, ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useSupportUnread } from "@/hooks/useSupportUnread";

interface ChatSession {
  id: number;
  patientId: number | null;
  assignedToId: number | null;
  status: string;
  subject: string | null;
  createdAt: string;
  updatedAt: string;
  patientName: string | null;
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

const FILTERS = ["All", "Active", "Resolved"] as const;
type Filter = typeof FILTERS[number];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function isActive(session: ChatSession) {
  return session.status === "open";
}

export default function Inquiries() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const { markSessionRead, refresh: refreshUnread } = useSupportUnread();

  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ChatSession | null>(null);
  const [reply, setReply] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const authHeaders = { Authorization: `Bearer ${token}` };

  const { data: sessions = [], isLoading: loadingSessions, refetch: refetchSessions } = useQuery<ChatSession[]>({
    queryKey: ["chat-sessions-support"],
    queryFn: async () => {
      const res = await fetch("/api/chat/sessions/support", { headers: authHeaders });
      if (!res.ok) throw new Error("Failed to load sessions");
      return res.json();
    },
    refetchInterval: 10000,
    enabled: !!token,
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery<ChatMessage[]>({
    queryKey: ["chat-messages", selected?.id],
    queryFn: async () => {
      if (!selected) return [];
      const res = await fetch(`/api/chat/sessions/${selected.id}/messages`, { headers: authHeaders });
      if (!res.ok) throw new Error("Failed to load messages");
      const data: ChatMessage[] = await res.json();
      markSessionRead(selected.id);
      return data;
    },
    enabled: !!selected && !!token,
    refetchInterval: selected ? 5000 : false,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/chat/sessions/${selected!.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to send");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", selected?.id] });
      queryClient.invalidateQueries({ queryKey: ["chat-sessions-support"] });
      refreshUnread();
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ sessionId, status }: { sessionId: number; status: string }) => {
      const res = await fetch(`/api/chat/sessions/${sessionId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["chat-sessions-support"] });
      if (selected?.id === vars.sessionId) {
        setSelected((prev) => prev ? { ...prev, status: vars.status } : prev);
      }
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!reply.trim() || !selected) return;
    sendMutation.mutate(reply.trim());
    setReply("");
  };

  const handleSelectSession = (session: ChatSession) => {
    setSelected((prev) => prev?.id === session.id ? null : session);
  };

  const filtered = sessions.filter((s) => {
    const name = s.patientName?.toLowerCase() ?? "";
    const subj = s.subject?.toLowerCase() ?? "";
    const matchSearch = name.includes(search.toLowerCase()) || subj.includes(search.toLowerCase());
    const active = isActive(s);
    const matchFilter =
      filter === "All" ||
      (filter === "Active" && active) ||
      (filter === "Resolved" && !active);
    return matchSearch && matchFilter;
  });

  const activeCount = sessions.filter(isActive).length;
  const resolvedCount = sessions.filter((s) => !isActive(s)).length;

  return (
    <div className="flex gap-6 h-full relative">
      {/* Main list */}
      <div className={`flex-1 min-w-0 space-y-6 pb-10 transition-all duration-300 ${selected ? "lg:max-w-[55%]" : ""}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Inquiries</h1>
            <p className="text-muted-foreground text-sm mt-1">
              All patient chat conversations from the support widget.
            </p>
          </div>
          <button
            onClick={() => refetchSessions()}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-xl hover:bg-muted"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: "Active Inquiries", value: activeCount, icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
            { label: "Resolved", value: resolvedCount, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
            { label: "Total", value: sessions.length, icon: HelpCircle, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950" },
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
          {loadingSessions ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-10 text-center">
              <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-7 h-7 text-muted-foreground/40" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">No inquiries found</h3>
              <p className="text-muted-foreground text-sm">
                {sessions.length === 0
                  ? "Patient chat conversations will appear here once patients start chatting."
                  : "No inquiries match your current filter."}
              </p>
            </div>
          ) : (
            filtered.map((session) => {
              const active = isActive(session);
              const isSelected = selected?.id === session.id;
              const guestLabel = `Guest #${session.id}`;
              const initials = session.patientName
                ? session.patientName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                : `G${session.id}`;

              return (
                <div
                  key={session.id}
                  onClick={() => handleSelectSession(session)}
                  className={`bg-card rounded-2xl border p-5 flex items-start gap-4 hover:shadow-md transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/20"
                      : active
                      ? "border-primary/30"
                      : "border-border"
                  }`}
                >
                  <div className="w-10 h-10 bg-sky-50 dark:bg-sky-950 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sky-600 text-sm">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground text-sm">
                            {session.patientName ?? `Guest #${session.id}`}
                          </p>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-600">
                            Chat
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5 truncate">
                          {session.subject ?? "General Inquiry"}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 flex items-center gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">{timeAgo(session.updatedAt)}</p>
                          {active ? (
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

      {/* Conversation panel — full-screen overlay on mobile, fixed sidebar on lg+ */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-card flex flex-col overflow-hidden lg:static lg:inset-auto lg:z-auto lg:w-[420px] lg:flex-shrink-0 lg:rounded-2xl lg:border lg:border-border lg:h-[calc(100vh-120px)] lg:sticky lg:top-6">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 bg-sky-50 dark:bg-sky-950 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sky-600 text-sm">
                {selected.patientName?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">
                  {selected.patientName ?? `Guest #${selected.id}`}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {selected.subject ?? "General Inquiry"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Status + actions */}
          <div className="px-5 py-2.5 border-b border-border flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                isActive(selected)
                  ? "bg-amber-50 dark:bg-amber-950 text-amber-600"
                  : "bg-emerald-50 dark:bg-emerald-950 text-emerald-600"
              }`}>
                {isActive(selected) ? "● Active" : "✓ Resolved"}
              </span>
              <span className="text-xs text-muted-foreground">#{selected.id}</span>
            </div>
            <button
              onClick={() =>
                statusMutation.mutate({
                  sessionId: selected.id,
                  status: isActive(selected) ? "resolved" : "open",
                })
              }
              disabled={statusMutation.isPending}
              className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors ${
                isActive(selected)
                  ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900"
                  : "bg-amber-50 dark:bg-amber-950 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900"
              }`}
            >
              {isActive(selected) ? "Mark Resolved" : "Reopen"}
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {loadingMessages ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">No messages yet.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isAgent = !msg.isBot && msg.senderId !== selected.patientId;
                const isPatientMsg = msg.senderId === selected.patientId;

                return (
                  <div key={msg.id} className={`flex ${isPatientMsg ? "justify-start" : "justify-end"}`}>
                    {!isPatientMsg && (
                      <div className="flex flex-col items-end gap-1 max-w-[80%]">
                        {msg.isBot && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 mr-1">
                            <Bot className="w-3 h-3" /> Bot
                          </span>
                        )}
                        {isAgent && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 mr-1">
                            <UserCheck className="w-3 h-3" /> You
                          </span>
                        )}
                        <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-2.5">
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <p className="text-xs mt-1 text-primary-foreground/60">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    )}
                    {isPatientMsg && (
                      <div className="max-w-[80%] bg-muted text-foreground rounded-2xl rounded-bl-md px-4 py-2.5">
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Reply box */}
          <div className="px-5 py-4 border-t border-border">
            {isActive(selected) ? (
              <div className="flex gap-2 items-end">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a reply… (Enter to send)"
                  rows={2}
                  className="flex-1 resize-none rounded-xl border border-input bg-background text-sm px-3.5 py-2.5 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button
                  onClick={handleSend}
                  disabled={!reply.trim() || sendMutation.isPending}
                  className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {sendMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xs text-muted-foreground py-1">This inquiry has been resolved.</p>
                <button
                  onClick={() => statusMutation.mutate({ sessionId: selected.id, status: "open" })}
                  className="mt-2 text-xs font-semibold text-amber-600 hover:underline"
                >
                  Reopen to reply
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
