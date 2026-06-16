import { useState } from "react";
import { Clock, CheckCircle2, XCircle, AlertCircle, Search, Download } from "lucide-react";

const RECORDS = [
  { name: "Dr. Jose Rizal", role: "Doctor", dept: "Internal Medicine", clockIn: "07:52 AM", clockOut: "04:15 PM", hours: "8h 23m", status: "Present" },
  { name: "Nurse Maria Santos", role: "Nurse", dept: "Ward A", clockIn: "05:58 AM", clockOut: "02:01 PM", hours: "8h 03m", status: "Present" },
  { name: "Ana Reyes", role: "Receptionist", dept: "Front Desk", clockIn: "08:05 AM", clockOut: "—", hours: "—", status: "Late" },
  { name: "Juan dela Cruz", role: "Pharmacist", dept: "Pharmacy", clockIn: "—", clockOut: "—", hours: "—", status: "Absent" },
  { name: "Lab Staff User", role: "Lab Staff", dept: "Laboratory", clockIn: "07:48 AM", clockOut: "03:52 PM", hours: "8h 04m", status: "Present" },
  { name: "Cashier User", role: "Cashier", dept: "Billing", clockIn: "08:00 AM", clockOut: "—", hours: "—", status: "Present" },
];

const STATUS_CONFIG = {
  Present: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
  Late: { icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
  Absent: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
};

const FILTERS = ["All", "Present", "Late", "Absent"] as const;
type Filter = typeof FILTERS[number];

export default function Attendance() {
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");

  const today = new Date().toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const filtered = RECORDS.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.role.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || r.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    Present: RECORDS.filter((r) => r.status === "Present").length,
    Late: RECORDS.filter((r) => r.status === "Late").length,
    Absent: RECORDS.filter((r) => r.status === "Absent").length,
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Attendance</h1>
          <p className="text-muted-foreground text-sm mt-1">{today}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-colors">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {(["Present", "Late", "Absent"] as const).map((s) => {
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
            placeholder="Search by name or role…"
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

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Employee</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Role</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Clock In</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Clock Out</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Hours</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r) => {
                const cfg = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG];
                return (
                  <tr key={r.name} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-teal-500 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {r.name.charAt(0)}
                        </div>
                        <span className="font-medium text-foreground">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{r.role}</td>
                    <td className="px-6 py-4 font-mono text-sm text-foreground">{r.clockIn}</td>
                    <td className="px-6 py-4 font-mono text-sm text-muted-foreground">{r.clockOut}</td>
                    <td className="px-6 py-4 text-muted-foreground">{r.hours}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                        <cfg.icon className="w-3 h-3" /> {r.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">No records match your search.</div>
          )}
        </div>
      </div>
    </div>
  );
}
