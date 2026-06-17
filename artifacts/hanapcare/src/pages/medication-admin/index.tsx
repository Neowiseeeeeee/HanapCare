import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Pill, Plus, Search, CheckCircle2, Clock, AlertCircle, User } from "lucide-react";
import { toast } from "sonner";
import { format, isToday } from "date-fns";

const FILTERS = ["All", "Scheduled", "Administered", "Missed", "Due Soon"] as const;
type Filter = typeof FILTERS[number];

interface DispensingRecord {
  id: number;
  patientId: number;
  patientName: string;
  medicineId: number;
  medicineName: string;
  quantityDispensed: number;
  dispensedAt: string;
  dispensedBy?: string | null;
  prescriptionId?: number | null;
}

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  patientCode: string;
}

interface Medicine {
  id: number;
  drugName: string;
  genericName?: string | null;
  quantity: number;
}

export default function MedicationAdministration() {
  const { token, user } = useAuth();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    patientId: "",
    medicineId: "",
    quantityDispensed: "1",
    notes: "",
  });

  const { data: records = [], isLoading } = useQuery<DispensingRecord[]>({
    queryKey: ["dispensing-records"],
    queryFn: async () => {
      const res = await fetch("/api/dispensing-records", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
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
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      return json.data ?? json;
    },
    enabled: !!token && showModal,
  });

  const { data: medicines = [] } = useQuery<Medicine[]>({
    queryKey: ["medicines-list"],
    queryFn: async () => {
      const res = await fetch("/api/medicines", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!token && showModal,
  });

  const adminMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch("/api/dispensing-records", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patientId: Number(data.patientId),
          medicineId: Number(data.medicineId),
          quantityDispensed: Number(data.quantityDispensed),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to record administration");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Medication administration recorded");
      setShowModal(false);
      setForm({ patientId: "", medicineId: "", quantityDispensed: "1", notes: "" });
      qc.invalidateQueries({ queryKey: ["dispensing-records"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const todayRecords = records.filter(r => isToday(new Date(r.dispensedAt)));
  const uniquePatients = new Set(records.map(r => r.patientId)).size;

  const filtered = records.filter(r => {
    const matchSearch = r.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      r.medicineName?.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === "All" || filter === "Administered") return true;
    return false;
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Medication Administration</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Record and track medications administered to patients on your ward.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> Record Administration
        </button>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { label: "Administered Today", value: isLoading ? "…" : String(todayRecords.length), icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
          { label: "Total Records", value: isLoading ? "…" : String(records.length), icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
          { label: "Missed", value: "0", icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
          { label: "Patients", value: isLoading ? "…" : String(uniquePatients), icon: User, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950" },
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
            placeholder="Search by patient name or medicine…"
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

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="bg-card rounded-2xl border border-border p-5 animate-pulse h-20" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-10 text-center">
          <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Pill className="w-7 h-7 text-muted-foreground/40" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">No medication records</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-5">
            Medication administration records will appear here as you document them.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Record First Administration
          </button>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Time</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Patient</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Medicine</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Qty</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Administered By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 whitespace-nowrap text-xs text-muted-foreground">
                    {format(new Date(r.dispensedAt), "MMM d, h:mm a")}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-foreground">{r.patientName}</td>
                  <td className="px-5 py-3.5 text-primary font-medium">{r.medicineName}</td>
                  <td className="px-5 py-3.5">{r.quantityDispensed}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{r.dispensedBy ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
        <span className="text-amber-700 dark:text-amber-300">
          Always verify the patient's identity and check for allergies before administering any medication.
          Follow the Five Rights: Right Patient, Right Drug, Right Dose, Right Route, Right Time.
        </span>
      </div>

      {/* Record Administration Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background rounded-2xl border border-border shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Record Medication Administration</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Patient *</label>
                <select
                  value={form.patientId}
                  onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}
                  className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">Select patient…</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.patientCode})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Medicine *</label>
                <select
                  value={form.medicineId}
                  onChange={e => setForm(f => ({ ...f, medicineId: e.target.value }))}
                  className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">Select medicine…</option>
                  {medicines.map(m => (
                    <option key={m.id} value={m.id}>{m.drugName}{m.genericName ? ` (${m.genericName})` : ""} — Stock: {m.quantity}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  value={form.quantityDispensed}
                  onChange={e => setForm(f => ({ ...f, quantityDispensed: e.target.value }))}
                  className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                Verify Right Patient, Right Drug, Right Dose, Right Route, Right Time.
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
              <button
                onClick={() => {
                  if (!form.patientId) { toast.error("Select a patient"); return; }
                  if (!form.medicineId) { toast.error("Select a medicine"); return; }
                  if (!form.quantityDispensed || Number(form.quantityDispensed) < 1) { toast.error("Quantity must be at least 1"); return; }
                  adminMutation.mutate(form);
                }}
                disabled={adminMutation.isPending}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {adminMutation.isPending ? "Recording…" : "Record Administration"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
