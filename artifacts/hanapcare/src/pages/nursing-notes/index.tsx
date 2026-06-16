import { useState } from "react";
import { ClipboardList, Plus, Search, Filter, User, Clock } from "lucide-react";

const FILTERS = ["All", "Today", "This Week", "This Month"] as const;
type Filter = typeof FILTERS[number];

export default function NursingNotes() {
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Nursing Notes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Document patient observations, care activities, and shift handover notes.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Add Note
        </button>
      </div>

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

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Notes Today", value: "0", icon: ClipboardList, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950" },
          { label: "Patients Documented", value: "0", icon: User, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950" },
          { label: "Pending Handovers", value: "0", icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
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

      <div className="bg-card rounded-2xl border border-border p-10 text-center">
        <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ClipboardList className="w-7 h-7 text-muted-foreground/40" />
        </div>
        <h3 className="font-semibold text-foreground mb-1">No nursing notes yet</h3>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-5">
          Start documenting patient care by adding your first nursing note.
        </p>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-sm transition-all">
          <Plus className="w-4 h-4" /> Add First Note
        </button>
      </div>
    </div>
  );
}
