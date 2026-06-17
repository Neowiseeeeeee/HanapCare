import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { ClipboardList, Plus, Search, User, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format, isToday, isThisWeek, isThisMonth } from "date-fns";

const FILTERS = ["All", "Today", "This Week", "This Month"] as const;
type Filter = typeof FILTERS[number];

const NOTE_TYPES = ["General", "Assessment", "Medication", "Procedure", "Handover", "Incident"] as const;
const SHIFTS = ["Morning", "Afternoon", "Night"] as const;

interface NursingNote {
  id: number;
  patientId: number;
  patientName: string;
  authorName: string;
  noteType: string;
  content: string;
  shift?: string | null;
  isHandover: number;
  createdAt: string;
}

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  patientCode: string;
}

export default function NursingNotes() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    patientId: "",
    noteType: "General",
    content: "",
    shift: "Morning",
    isHandover: false,
  });

  const { data: notes = [], isLoading } = useQuery<NursingNote[]>({
    queryKey: ["nursing-notes"],
    queryFn: async () => {
      const res = await fetch("/api/nursing-notes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch notes");
      return res.json();
    },
    enabled: !!token,
  });

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["patients-list"],
    queryFn: async () => {
      const res = await fetch("/api/patients?limit=100", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch patients");
      const json = await res.json();
      return json.data ?? json;
    },
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch("/api/nursing-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patientId: Number(data.patientId),
          noteType: data.noteType,
          content: data.content,
          shift: data.shift,
          isHandover: data.isHandover ? 1 : 0,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to save note");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Nursing note saved");
      setShowModal(false);
      setForm({ patientId: "", noteType: "General", content: "", shift: "Morning", isHandover: false });
      qc.invalidateQueries({ queryKey: ["nursing-notes"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filtered = notes.filter((n) => {
    const matchSearch = n.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === "All") return true;
    const d = new Date(n.createdAt);
    if (filter === "Today") return isToday(d);
    if (filter === "This Week") return isThisWeek(d, { weekStartsOn: 1 });
    if (filter === "This Month") return isThisMonth(d);
    return true;
  });

  const todayCount = notes.filter(n => isToday(new Date(n.createdAt))).length;
  const uniquePatients = new Set(notes.filter(n => isToday(new Date(n.createdAt))).map(n => n.patientId)).size;
  const handoverCount = notes.filter(n => n.isHandover === 1).length;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Nursing Notes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Document patient observations, care activities, and shift handover notes.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Note
        </button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Notes Today", value: todayCount, icon: ClipboardList, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950" },
          { label: "Patients Documented", value: uniquePatients, icon: User, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950" },
          { label: "Pending Handovers", value: handoverCount, icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
            <div className={`w-11 h-11 ${stat.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">{isLoading ? "…" : stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by patient name or note content…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-input rounded-xl text-sm bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filter === f
                ? "bg-primary/10 text-primary border border-primary/30"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Notes list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="bg-card rounded-2xl border border-border p-5 animate-pulse h-28" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-10 text-center">
          <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-7 h-7 text-muted-foreground/40" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">No nursing notes yet</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-5">
            Start documenting patient care by adding your first nursing note.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Add First Note
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((note) => (
            <div key={note.id} className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-teal-500 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {note.patientName?.charAt(0) ?? "P"}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{note.patientName}</p>
                    <p className="text-xs text-muted-foreground">{note.authorName} · {note.shift && `${note.shift} shift · `}{format(new Date(note.createdAt), "MMM d, yyyy h:mm a")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{note.noteType}</span>
                  {note.isHandover === 1 && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-600">Handover</span>
                  )}
                </div>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{note.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Note Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background rounded-2xl border border-border shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Add Nursing Note</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Patient *</label>
                <select
                  value={form.patientId}
                  onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}
                  className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select patient…</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.patientCode})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Note Type</label>
                  <select
                    value={form.noteType}
                    onChange={e => setForm(f => ({ ...f, noteType: e.target.value }))}
                    className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {NOTE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Shift</label>
                  <select
                    value={form.shift}
                    onChange={e => setForm(f => ({ ...f, shift: e.target.value }))}
                    className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Note *</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  rows={4}
                  placeholder="Document your observations, care activities, or handover notes…"
                  className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.isHandover}
                  onChange={e => setForm(f => ({ ...f, isHandover: e.target.checked }))}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm text-foreground">Mark as handover note</span>
              </label>

              <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                Verify patient identity before documenting.
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!form.patientId) { toast.error("Please select a patient"); return; }
                  if (!form.content.trim()) { toast.error("Note content is required"); return; }
                  createMutation.mutate(form);
                }}
                disabled={createMutation.isPending}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {createMutation.isPending ? "Saving…" : "Save Note"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
