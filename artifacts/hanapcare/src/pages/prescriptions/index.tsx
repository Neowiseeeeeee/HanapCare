import { useState } from "react";
import { Pill, Plus, Search, Filter, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";

const STATUS_CONFIG = {
  Active: { label: "Active", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
  Completed: { label: "Completed", icon: CheckCircle2, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950" },
  Cancelled: { label: "Cancelled", icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
  Pending: { label: "Pending", icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.Active;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
      <cfg.icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

const FILTERS = ["All", "Active", "Pending", "Completed", "Cancelled"] as const;
type Filter = typeof FILTERS[number];

export default function Prescriptions() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");

  const isDoctor = user?.role === "Doctor";
  const isPharmacist = user?.role === "Pharmacist";

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">
            {isDoctor ? "Prescriptions I've Written" : isPharmacist ? "Prescription Queue" : "Prescriptions"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isDoctor
              ? "Manage and track prescriptions you've issued to patients."
              : isPharmacist
              ? "Review incoming prescriptions and record dispensing."
              : "Full prescription history across all patients."}
          </p>
        </div>
        {isDoctor && (
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> New Prescription
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by patient, medicine, or doctor…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-input rounded-xl text-sm bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors">
          <Filter className="w-4 h-4" /> Filters
        </button>
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

      <div className="bg-card rounded-2xl border border-border p-10 text-center">
        <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Pill className="w-7 h-7 text-muted-foreground/40" />
        </div>
        <h3 className="font-semibold text-foreground mb-1">No prescriptions found</h3>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-5">
          {isDoctor
            ? "Prescriptions you write for patients will appear here."
            : isPharmacist
            ? "Incoming prescriptions from doctors will appear here for you to process."
            : "Prescriptions issued across the facility will appear here."}
        </p>
        {isDoctor && (
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-sm transition-all">
            <Plus className="w-4 h-4" /> Write First Prescription
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-xl px-4 py-3">
        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
        <span>
          Prescription records are linked to the active consultation for each patient. Open a consultation
          to prescribe medicines directly.
        </span>
      </div>
    </div>
  );
}
