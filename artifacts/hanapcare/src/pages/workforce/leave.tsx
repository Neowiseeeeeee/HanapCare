import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  CalendarOff, Plus, CheckCircle2, XCircle, Clock, Search, Calendar,
  ChevronDown, ChevronUp, User,
} from "lucide-react";

const LEAVE_TYPES = [
  "Sick Leave",
  "Annual Leave",
  "Emergency Leave",
  "Maternity/Paternity",
  "Continuing Medical Education",
  "Bereavement Leave",
  "Unpaid Leave",
] as const;

const FILTERS = ["All", "Pending", "Approved", "Denied"] as const;
type Filter = typeof FILTERS[number];

const STATUS_CONFIG = {
  Approved: { icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800" },
  Pending:  { icon: Clock,        color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800" },
  Denied:   { icon: XCircle,      color: "text-red-600 dark:text-red-400",       bg: "bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800" },
};

const newRequestSchema = z.object({
  leaveType: z.string().min(1, "Required"),
  fromDate: z.string().min(1, "Required"),
  toDate: z.string().min(1, "Required"),
  reason: z.string().optional(),
}).refine((d) => d.toDate >= d.fromDate, {
  message: "End date must be on or after start date",
  path: ["toDate"],
});
type NewRequestForm = z.infer<typeof newRequestSchema>;

interface LeaveRequest {
  id: number;
  staffId: number;
  leaveType: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason?: string | null;
  status: string;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
  createdAt: string;
  staffFirstName?: string;
  staffLastName?: string;
  staffRole?: string;
  staffEmail?: string;
}

function calcDays(from: string, to: string): number {
  const a = new Date(from);
  const b = new Date(to);
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return 1;
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)) + 1);
}

export default function LeaveRequests() {
  const { token, user } = useAuth();
  const qc = useQueryClient();
  const isHR = user?.role === "HR Manager" || user?.role === "Admin";

  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: requests = [], isLoading } = useQuery<LeaveRequest[]>({
    queryKey: ["leave-requests"],
    queryFn: async () => {
      const res = await fetch("/api/leave-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch leave requests");
      return res.json();
    },
    enabled: !!token,
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
      const res = await fetch(`/api/leave-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, reviewNotes: notes }),
      });
      if (!res.ok) throw new Error("Failed to update request");
      return res.json();
    },
    onSuccess: (_, vars) => {
      toast.success(`Leave request ${vars.status.toLowerCase()}`);
      qc.invalidateQueries({ queryKey: ["leave-requests"] });
    },
    onError: () => toast.error("Failed to update request"),
  });

  const form = useForm<NewRequestForm>({
    resolver: zodResolver(newRequestSchema),
    defaultValues: { leaveType: "", fromDate: "", toDate: "", reason: "" },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: NewRequestForm) => {
      const days = calcDays(data.fromDate, data.toDate);
      const res = await fetch("/api/leave-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...data, days }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to submit");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Leave request submitted");
      form.reset();
      setDialogOpen(false);
      qc.invalidateQueries({ queryKey: ["leave-requests"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filtered = requests.filter((r) => {
    const nameMatch = `${r.staffFirstName ?? ""} ${r.staffLastName ?? ""}`.toLowerCase().includes(search.toLowerCase());
    const filterMatch = filter === "All" || r.status === filter;
    return nameMatch && filterMatch;
  });

  const pendingCount  = requests.filter((r) => r.status === "Pending").length;
  const approvedCount = requests.filter((r) => r.status === "Approved").length;
  const deniedCount   = requests.filter((r) => r.status === "Denied").length;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Leave Requests</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isHR ? "Review and approve staff leave requests." : "Submit and track your leave requests."}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> New Request</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Submit Leave Request</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((d) => submitMutation.mutate(d))} className="space-y-4 pt-2">
                <FormField control={form.control} name="leaveType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leave Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {LEAVE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="fromDate" render={({ field }) => (
                    <FormItem><FormLabel>From</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="toDate" render={({ field }) => (
                    <FormItem><FormLabel>To</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                {form.watch("fromDate") && form.watch("toDate") && (
                  <p className="text-xs text-muted-foreground">
                    Duration: <span className="font-semibold text-foreground">{calcDays(form.watch("fromDate"), form.watch("toDate"))} day(s)</span>
                  </p>
                )}
                <FormField control={form.control} name="reason" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason <span className="text-muted-foreground">(optional)</span></FormLabel>
                    <FormControl><Textarea placeholder="Brief reason for the leave…" rows={3} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex justify-end gap-3 pt-1">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={submitMutation.isPending}>
                    {submitMutation.isPending ? "Submitting…" : "Submit Request"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {([
          ["Pending",  pendingCount,  STATUS_CONFIG.Pending],
          ["Approved", approvedCount, STATUS_CONFIG.Approved],
          ["Denied",   deniedCount,   STATUS_CONFIG.Denied],
        ] as const).map(([label, count, cfg]) => (
          <div key={label} className={`rounded-2xl border p-5 flex items-center gap-4 ${cfg.bg}`}>
            <div className="w-11 h-11 bg-background/60 rounded-xl flex items-center justify-center flex-shrink-0">
              <cfg.icon className={`w-5 h-5 ${cfg.color}`} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">{count}</p>
              <p className={`text-xs font-medium ${cfg.color}`}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by employee name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                filter === f
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 border border-transparent"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="bg-card rounded-2xl border border-border p-5 animate-pulse h-24" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-10 text-center">
          <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CalendarOff className="w-7 h-7 text-muted-foreground/40" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">No leave requests found</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            {search ? `No results for "${search}"` : filter !== "All" ? `No ${filter.toLowerCase()} requests` : "No leave requests yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const cfg = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.Pending;
            const expanded = expandedId === r.id;
            const name = r.staffFirstName && r.staffLastName ? `${r.staffFirstName} ${r.staffLastName}` : r.staffEmail ?? "Staff";
            const initial = name.charAt(0).toUpperCase();

            return (
              <div key={r.id} className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-5 flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-teal-500 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-semibold text-foreground text-sm">{name}</p>
                        <p className="text-xs text-muted-foreground">{r.staffRole} · {r.leaveType}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                        <cfg.icon className="w-3 h-3" /> {r.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {r.fromDate} – {r.toDate}</span>
                      <span className="font-semibold text-foreground">{r.days} day{r.days !== 1 ? "s" : ""}</span>
                    </div>
                    {r.reason && <p className="text-xs text-muted-foreground mt-1 italic">"{r.reason}"</p>}
                    {r.reviewNotes && (
                      <p className="text-xs text-foreground/70 mt-1 bg-muted/50 rounded-lg px-2 py-1">
                        <span className="font-medium">Review note:</span> {r.reviewNotes}
                      </p>
                    )}

                    {/* HR Actions */}
                    {isHR && r.status === "Pending" && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-700 dark:hover:bg-emerald-950"
                          disabled={approveMutation.isPending}
                          onClick={() => approveMutation.mutate({ id: r.id, status: "Approved" })}
                        >
                          <CheckCircle2 className="w-3 h-3" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1 border-red-300 text-red-700 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-950"
                          disabled={approveMutation.isPending}
                          onClick={() => approveMutation.mutate({ id: r.id, status: "Denied" })}
                        >
                          <XCircle className="w-3 h-3" /> Deny
                        </Button>
                        <button
                          className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                          onClick={() => setExpandedId(expanded ? null : r.id)}
                        >
                          Add note {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded note form */}
                {expanded && isHR && r.status === "Pending" && (
                  <ReviewNoteForm
                    onSubmit={(status, notes) => {
                      approveMutation.mutate({ id: r.id, status, notes });
                      setExpandedId(null);
                    }}
                    isPending={approveMutation.isPending}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ReviewNoteForm({ onSubmit, isPending }: {
  onSubmit: (status: string, notes: string) => void;
  isPending: boolean;
}) {
  const [notes, setNotes] = useState("");
  return (
    <div className="border-t border-border p-4 bg-muted/30 space-y-3">
      <Textarea
        placeholder="Optional review note (visible to employee)…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        className="text-sm"
      />
      <div className="flex gap-2 justify-end">
        <Button
          size="sm"
          className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
          disabled={isPending}
          onClick={() => onSubmit("Approved", notes)}
        >
          <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs border-red-300 text-red-700 hover:bg-red-50"
          disabled={isPending}
          onClick={() => onSubmit("Denied", notes)}
        >
          <XCircle className="w-3 h-3 mr-1" /> Deny
        </Button>
      </div>
    </div>
  );
}
